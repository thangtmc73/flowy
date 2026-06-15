import os
import re
import json
import logging
import time
import base64
from datetime import datetime
from difflib import SequenceMatcher
from typing import Dict, List, Any, Optional
from pathlib import Path

from dotenv import load_dotenv
from greennode_agentbase.core.logging import configure_logger
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain_core.tools import tool

from greennode_agentbase import (
    GreenNodeAgentBaseApp,
    RequestContext,
    PingStatus,
)
from greennode_agentbase.memory import MemoryClient
from greennode_agentbase.memory.models import MemoryRecordSearchRequest, MemoryRecordInsertDirectlyRequest
from greennode_agent_bridge import AgentBaseMemoryEvents
from langgraph.config import get_config

load_dotenv()

logger = logging.getLogger("faq_agent")
configure_logger(logger)

app = GreenNodeAgentBaseApp()

# --- FAQ Data Loading (Multi-Partner Support) ---
FAQ_DATA_PATH = os.environ.get("FAQ_DATA_PATH", "knowledge")
FAQ_ALL_ENTRIES = []
FAQ_INDEX = {}

def load_knowledge_base():
    """Load multi-partner FAQ structure from knowledge base."""
    global FAQ_ALL_ENTRIES, FAQ_INDEX
    
    from pathlib import Path
    
    knowledge_dir = Path(FAQ_DATA_PATH)
    index_path = knowledge_dir / "_index.json"
    
    # Fallback: try old single-file format
    if not index_path.exists():
        old_faq_path = knowledge_dir / "faq.json"
        if old_faq_path.exists():
            print(f"Warning: Using old FAQ format from {old_faq_path}. Consider migrating with scripts/migrate_faq.py")
            load_legacy_format(old_faq_path)
            return
        else:
            print(f"Error: Neither {index_path} nor {old_faq_path} found")
            FAQ_ALL_ENTRIES = []
            return
    
    try:
        with open(index_path, "r", encoding="utf-8") as f:
            FAQ_INDEX = json.load(f)
        
        # Load each product file
        for partner in FAQ_INDEX.get("partners", []):
            if not partner.get("active", True):
                continue
            
            for product in partner.get("products", []):
                product_file = knowledge_dir / product["file"]
                if not product_file.exists():
                    print(f"Warning: Product file not found: {product_file}")
                    continue
                
                with open(product_file, "r", encoding="utf-8") as f:
                    product_data = json.load(f)
                
                # Flatten user_questions into searchable entries
                for faq in product_data.get("faqs", []):
                    for user_question in faq.get("user_questions", []):
                        FAQ_ALL_ENTRIES.append({
                            "question": user_question,
                            "canonical": faq.get("canonical_question", user_question),
                            "answer": faq.get("answer", ""),
                            "category": faq.get("category", "General"),
                            "partner": partner.get("partner_name", "Unknown"),
                            "partner_id": partner.get("partner_id", ""),
                            "product": product.get("product_name", "Unknown"),
                            "product_id": product.get("product_id", ""),
                            "tags": faq.get("tags", []),
                            "priority": faq.get("priority", 5),
                            "id": faq.get("id", "")
                        })
        
        # Load cross-product FAQs if exists
        cross_dir = knowledge_dir / "cross_product"
        if cross_dir.exists():
            for cross_file in cross_dir.glob("*.json"):
                with open(cross_file, "r", encoding="utf-8") as f:
                    cross_data = json.load(f)
                    for faq in cross_data.get("faqs", []):
                        for user_question in faq.get("user_questions", []):
                            FAQ_ALL_ENTRIES.append({
                                "question": user_question,
                                "canonical": faq.get("canonical_question", user_question),
                                "answer": faq.get("answer", ""),
                                "category": faq.get("category", "So sánh / Chung"),
                                "partner": "Zalopay",
                                "product": "Cross-product",
                                "priority": faq.get("priority", 8),
                                "id": faq.get("id", "")
                            })
        
        partner_count = len([p for p in FAQ_INDEX.get("partners", []) if p.get("active", True)])
        print(f"✓ Loaded {len(FAQ_ALL_ENTRIES)} FAQ entries from {partner_count} partner(s)")
    
    except Exception as e:
        print(f"Error loading knowledge base: {e}")
        FAQ_ALL_ENTRIES = []


def load_legacy_format(faq_path):
    """Fallback loader for old single-file format."""
    global FAQ_ALL_ENTRIES
    try:
        with open(faq_path, "r", encoding="utf-8") as f:
            old_data = json.load(f)
        
        for item in old_data:
            FAQ_ALL_ENTRIES.append({
                "question": item.get("instruction", ""),
                "canonical": item.get("instruction", ""),
                "answer": item.get("output", ""),
                "category": item.get("category", "General"),
                "partner": "Legacy Partner",
                "product": "Legacy Product",
                "priority": 5
            })
        
        print(f"✓ Loaded {len(FAQ_ALL_ENTRIES)} FAQ entries (legacy format)")
    except Exception as e:
        print(f"Error loading legacy FAQ: {e}")
        FAQ_ALL_ENTRIES = []

def similarity_score(str1: str, str2: str) -> float:
    """Calculate similarity between two strings (0-1)"""
    return SequenceMatcher(None, str1.lower(), str2.lower()).ratio()

def search_faq_fuzzy(query, threshold=0.4, top_k=3, partner_filter=None, category_filter=None):
    """
    Search FAQ using fuzzy matching with multi-partner support.
    
    Args:
        query: User question
        threshold: Minimum similarity score (0-1)
        top_k: Number of results to return
        partner_filter: Filter by partner_id (e.g., "msig")
        category_filter: Filter by category (e.g., "health")
    
    Returns:
        List of matching FAQ entries with scores
    """
    results = []
    
    for entry in FAQ_ALL_ENTRIES:
        # Apply filters
        if partner_filter and entry.get("partner_id") != partner_filter:
            continue
        if category_filter and entry.get("product_category") != category_filter:
            continue
        
        score = similarity_score(query, entry["question"])
        if score >= threshold:
            results.append({
                **entry,
                "score": score
            })
    
    # Rank by: score * priority
    results.sort(key=lambda x: (x["score"] * x.get("priority", 5)), reverse=True)
    return results[:top_k]


FAQ_SEARCH_TOP_K = 2
FAQ_SEARCH_THRESHOLD = 0.5
FAQ_ANSWER_MAX_CHARS = 600


def normalize_brand_name(text: str) -> str:
    """Ensure the platform brand is spelled Zalopay in agent-facing text."""
    if not text:
        return text
    text = re.sub(r"\bZaloPay\b", "Zalopay", text)
    text = re.sub(r"\bZalo Pay\b", "Zalopay", text)
    text = re.sub(r"\bZALOPAY\b", "Zalopay", text)
    return text


def _truncate_faq_answer(answer: str, max_chars: int = FAQ_ANSWER_MAX_CHARS) -> str:
    """Trim long FAQ answers so the LLM context stays focused."""
    if len(answer) <= max_chars:
        return answer
    return answer[:max_chars].rstrip() + "..."


# --- File Processing Functions ---

def parse_uploaded_file(file_data: Dict[str, Any]) -> str:
    """Parse uploaded file content based on file type.
    
    Args:
        file_data: Dict with keys: name, type, size, content
    
    Returns:
        Parsed text content
    """
    file_type = file_data.get("type", "")
    content = file_data.get("content", "")
    
    # JSON file - already parsed
    if file_type == "application/json" or isinstance(content, dict):
        return json.dumps(content, ensure_ascii=False, indent=2)
    
    # PDF file - base64 encoded
    if file_type == "application/pdf" and isinstance(content, dict):
        pdf_data = content.get("data", "")
        # For now, return metadata. Full PDF parsing requires pypdf2/pdfplumber
        return f"[PDF File: {file_data.get('name')}]\nSize: {file_data.get('size')} bytes\nNote: PDF text extraction requires additional processing."
    
    # Text-based files
    if isinstance(content, str):
        return content
    
    return str(content)


def load_all_products() -> List[Dict[str, Any]]:
    """Load all insurance products from knowledge base.
    
    Returns:
        List of product dicts with partner info
    """
    products = []
    knowledge_dir = Path(FAQ_DATA_PATH)
    index_path = knowledge_dir / "_index.json"
    
    if not index_path.exists():
        return products
    
    try:
        with open(index_path, "r", encoding="utf-8") as f:
            index_data = json.load(f)
        
        for partner in index_data.get("partners", []):
            if not partner.get("active", True):
                continue
            
            for product in partner.get("products", []):
                product_file = knowledge_dir / product["file"]
                if not product_file.exists():
                    continue
                
                with open(product_file, "r", encoding="utf-8") as f:
                    product_data = json.load(f)
                
                products.append({
                    "partner_id": partner.get("partner_id", ""),
                    "partner_name": partner.get("partner_name", ""),
                    "product_id": product.get("product_id", ""),
                    "product_name": product.get("product_name", ""),
                    "category": product.get("category", ""),
                    "data": product_data
                })
        
        return products
    except Exception as e:
        logger.error(f"Error loading products: {e}")
        return products


def extract_insurance_features(text_content: str, llm: ChatOpenAI) -> Dict[str, Any]:
    """Use LLM to extract insurance features from text.
    
    Args:
        text_content: Raw text from uploaded file
        llm: ChatOpenAI instance
    
    Returns:
        Dict with extracted features
    """
    extraction_prompt = f"""Analyze this insurance document and extract key information in JSON format.

Document content:
{text_content[:3000]}

Extract the following information (in Vietnamese):
- product_name: Tên sản phẩm bảo hiểm
- partner: Công ty bảo hiểm/đối tác
- category: Loại bảo hiểm (sức khỏe, xe, du lịch, cyber, v.v.)
- coverage: Quyền lợi bảo hiểm chính
- cost: Chi phí/phí bảo hiểm
- age_range: Độ tuổi áp dụng
- benefits: Các quyền lợi cụ thể
- exclusions: Điều khoản loại trừ (nếu có)
- highlights: Điểm nổi bật

Return ONLY valid JSON, no additional text."""

    try:
        response = llm.invoke(extraction_prompt)
        content = response.content.strip()
        
        # Extract JSON from markdown code blocks if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        return json.loads(content)
    except Exception as e:
        logger.error(f"Error extracting features with LLM: {e}")
        return {
            "product_name": "Unknown",
            "error": str(e),
            "raw_content": text_content[:500]
        }

# Load FAQ data on startup
load_knowledge_base()

# --- Memory Configuration ---
# Create a memory with: /agentbase-memory
# Set the memory ID here or via MEMORY_ID env var
MEMORY_ID = os.environ.get("MEMORY_ID", "")
if not MEMORY_ID:
    raise ValueError("MEMORY_ID environment variable is required for memory-enabled agents")

# Strategy ID for long-term memory namespace partitioning
# This is fixed per memory instance — do NOT pass as a tool parameter
MEMORY_STRATEGY_ID = os.environ.get("MEMORY_STRATEGY_ID", "default")

# CheckpointSaver: persists conversation state as events in AgentBase Memory
# This enables multi-turn conversations that survive restarts
checkpointer = AgentBaseMemoryEvents(memory_id=MEMORY_ID)

# MemoryClient: used by long-term memory tools to store/search semantic facts
memory_client = MemoryClient()

# --- LLM Configuration ---
# Uses any OpenAI-compatible LLM provider (GreenNode AIP, OpenAI, Ollama, etc.)
# Set LLM_BASE_URL, LLM_API_KEY, and LLM_MODEL in your .env file.
# For GreenNode AIP: use /agentbase-llm to manage API keys and browse models.
# For other providers: set the appropriate base URL and API key.
# Production: use /agentbase-identity to store API key, inject via @requires_api_key
LLM_MODEL = os.environ.get("LLM_MODEL", "")
LLM_BASE_URL = os.environ.get("LLM_BASE_URL", "")
LLM_API_KEY = os.environ.get("LLM_API_KEY", "")
if not LLM_MODEL or not LLM_BASE_URL or not LLM_API_KEY:
    raise ValueError(
        "LLM_MODEL, LLM_BASE_URL, and LLM_API_KEY environment variables are required. "
        "Set them in your .env file or use /agentbase-llm to get a platform API key."
    )

llm = ChatOpenAI(
    model=LLM_MODEL,
    base_url=LLM_BASE_URL,
    api_key=LLM_API_KEY,
)


# --- Long-Term Memory Tools (via MemoryClient SDK) ---
# actor_id: retrieved from LangGraph configurable (set in handler via context.user_id)
# strategy_id: app-level config (MEMORY_STRATEGY_ID), fixed per memory instance
# Neither should be exposed as tool parameters to avoid LLM hallucination


def _get_actor_id():
    """Get actor_id from LangGraph configurable (set during graph.invoke)."""
    try:
        config = get_config()
        return config["configurable"].get("actor_id", "default")
    except RuntimeError:
        # Called outside runnable context - return default
        return "default"


def _build_namespace(actor_id: str) -> str:
    """Build memory namespace from strategy_id (app config) and actor_id (runtime config)."""
    return f"/strategies/{MEMORY_STRATEGY_ID}/actors/{actor_id}"


@tool
async def remember(fact: str) -> str:
    """Store a fact in long-term memory for later retrieval.

    Args:
        fact: The fact or information to remember.
    """
    actor_id = _get_actor_id()
    namespace = _build_namespace(actor_id)
    logger.info("[tool:remember] actor=%s fact=%r", actor_id, fact[:80])
    await memory_client.insert_memory_records_directly_async(
        id=MEMORY_ID,
        namespace=namespace,
        request=MemoryRecordInsertDirectlyRequest(memory_records=[fact]),
    )
    logger.info("[tool:remember] stored OK")
    return f"Remembered: {fact}"


@tool
async def recall(query: str) -> str:
    """Search long-term memory for facts relevant to a query.

    Args:
        query: Natural language search query.
    """
    actor_id = _get_actor_id()
    namespace = _build_namespace(actor_id)
    logger.info("[tool:recall] actor=%s query=%r", actor_id, query[:80])
    t0 = time.monotonic()
    results = await memory_client.search_memory_records_async(
        id=MEMORY_ID,
        namespace=namespace,
        request=MemoryRecordSearchRequest(query=query, limit=10),
    )
    logger.info("[tool:recall] found %d results (%.2fs)", len(results), time.monotonic() - t0)
    if not results:
        return "No relevant memories found."
    # SDK 1.0.3 returns dicts; older versions return model objects — handle both
    def _get(r, key, default=""):
        return r[key] if isinstance(r, dict) else getattr(r, key, default)
    return "\n".join(f"- {_get(r, 'memory')} (score: {_get(r, 'score', 0):.2f})" for r in results)


@tool
def search_faq_docs(query: str) -> str:
    """Search FAQ documentation for answers to user questions about insurance products on Zalopay.

    Supports multiple partners and product types (health, car, travel, cyber, etc.).
    Automatically detects partner and product context from the query.

    Args:
        query: The user's question or topic to search for in the FAQ docs.
    """
    logger.info("[tool:search_faq] query=%r", query[:80])
    if not FAQ_ALL_ENTRIES:
        return f"FAQ database is not loaded. Please check if {FAQ_DATA_PATH} exists."

    # Smart context detection
    partner_filter = None
    query_lower = query.lower()
    
    # Detect specific partner mentions in query
    partner_patterns = {
        "msig": ["msig", "sức khỏe 24/7"],
        "gic": ["gic", "credit topup"],
        "vbi": ["vbi", "cyber"],
    }
    
    for partner_id, patterns in partner_patterns.items():
        if any(pattern in query_lower for pattern in patterns):
            partner_filter = partner_id
            break

    t0 = time.monotonic()
    results = search_faq_fuzzy(
        query,
        threshold=FAQ_SEARCH_THRESHOLD,
        top_k=FAQ_SEARCH_TOP_K,
        partner_filter=partner_filter,
    )
    logger.info("[tool:search_faq] matched %d results (%.2fs)", len(results), time.monotonic() - t0)

    if not results:
        return (
            "Không tìm thấy thông tin phù hợp trong FAQ về sản phẩm bảo hiểm trên Zalopay.\n"
            "Có thể hỏi về:\n"
            "- Các gói bảo hiểm sức khỏe\n"
            "- Bảo hiểm an ninh mạng (Cyber)\n"
            "- Bảo hiểm tài chính (Credit Topup)\n"
            "- Quyền lợi, chi phí, độ tuổi áp dụng\n"
            "- Quy trình mua và bồi thường"
        )

    best = results[0]
    confidence_pct = int(best["score"] * 100)
    response = (
        f"Kết quả phù hợp nhất ({confidence_pct}%):\n"
        f"Sản phẩm: {best['partner']} - {best['product']}\n"
        f"Câu hỏi: {best['canonical']}\n"
        f"Danh mục: {best['category']}\n"
        f"Trả lời: {_truncate_faq_answer(best['answer'])}\n"
    )

    if len(results) > 1:
        response += "\nKết quả liên quan khác (chỉ tham khảo, không trả lời trừ khi user hỏi):\n"
        for result in results[1:]:
            other_pct = int(result["score"] * 100)
            response += (
                f"- {result['partner']} - {result['product']}: "
                f"{result['canonical']} ({result['category']}, {other_pct}%)\n"
            )

    return response


@tool
async def compare_insurance_products(uploaded_info: str) -> str:
    """Compare uploaded insurance document with existing products on Zalopay.
    
    This tool analyzes insurance information from uploaded files and compares
    it with products available on the Zalopay platform.
    
    Args:
        uploaded_info: Extracted insurance information in JSON string format
    """
    logger.info("[tool:compare_insurance] starting comparison")
    
    try:
        # Parse uploaded info
        if isinstance(uploaded_info, str):
            uploaded = json.loads(uploaded_info)
        else:
            uploaded = uploaded_info
        
        # Load all existing products
        products = load_all_products()
        
        if not products:
            return "Không thể tải danh sách sản phẩm từ knowledge base."
        
        # Build comparison response
        response = f"## So sánh: {uploaded.get('product_name', 'Sản phẩm tải lên')}\n\n"
        response += f"**Đối tác:** {uploaded.get('partner', 'N/A')}\n"
        response += f"**Loại:** {uploaded.get('category', 'N/A')}\n\n"
        
        # Find similar products by category
        similar_products = [
            p for p in products 
            if uploaded.get('category', '').lower() in p.get('category', '').lower() or
               p.get('category', '').lower() in uploaded.get('category', '').lower()
        ]
        
        if not similar_products:
            response += "Không tìm thấy sản phẩm tương tự trong danh mục này trên Zalopay.\n\n"
            response += "**Sản phẩm hiện có trên Zalopay:**\n"
            for p in products[:3]:
                response += f"- {p['product_name']} ({p['partner_name']})\n"
            return response
        
        response += f"**Tìm thấy {len(similar_products)} sản phẩm tương tự trên Zalopay:**\n\n"
        
        # Detailed comparison
        for i, product in enumerate(similar_products[:3], 1):
            product_data = product['data']
            response += f"### {i}. {product['product_name']} - {product['partner_name']}\n\n"
            
            # Extract key info from product
            summary = product_data.get('product_summary', {})
            response += f"**Chi phí:** {summary.get('cost', 'N/A')}\n"
            response += f"**Quyền lợi:** {summary.get('coverage', 'N/A')}\n"
            response += f"**Độ tuổi:** {summary.get('age_range', 'N/A')}\n"
            
            # Find specific FAQs about benefits
            benefit_faqs = [
                faq for faq in product_data.get('faqs', [])
                if 'quyền lợi' in faq.get('canonical_question', '').lower() or
                   'benefits' in faq.get('category', '').lower()
            ]
            
            if benefit_faqs:
                response += f"\n**Chi tiết quyền lợi:**\n{benefit_faqs[0].get('answer', '')[:300]}...\n"
            
            response += "\n---\n\n"
        
        # Comparison summary
        response += "## Kết luận\n\n"
        response += f"Sản phẩm tải lên thuộc danh mục **{uploaded.get('category')}**, "
        response += f"tương tự với các sản phẩm của {', '.join([p['partner_name'] for p in similar_products[:2]])} trên Zalopay.\n\n"
        
        response += "Bạn có thể:\n"
        response += "- So sánh chi tiết quyền lợi và chi phí\n"
        response += "- Tìm hiểu thêm về quy trình mua bảo hiểm trên Zalopay\n"
        response += "- Liên hệ để được tư vấn cụ thể hơn\n"
        
        return response
        
    except Exception as e:
        logger.error(f"[tool:compare_insurance] error: {e}")
        return f"Lỗi khi so sánh sản phẩm: {str(e)}"


# --- Create Agent with Checkpointer ---
# create_agent builds a compiled LangGraph StateGraph with tool-calling support.
# checkpointer: persists conversation state via AgentBase Memory (short-term)
# Long-term memory is handled by remember/recall tools via MemoryClient SDK
agent = create_agent(
    llm,
    tools=[remember, recall, search_faq_docs, compare_insurance_products],
    system_prompt=(
        "Bạn là trợ lý tư vấn bảo hiểm trên nền tảng Zalopay.\n\n"
        "QUY TẮC THƯƠNG HIỆU:\n"
        "- Luôn viết tên nền tảng là **Zalopay** (chữ Z viết hoa, còn lại viết thường)\n"
        "- KHÔNG dùng ZaloPay, Zalo Pay hay ZALOPAY\n\n"
        "NGUYÊN TẮC TRẢ LỜI (ưu tiên cao nhất):\n"
        "- Chỉ trả lời đúng phạm vi câu hỏi. Không lan sang quyền lợi, quy trình, so sánh nếu user không hỏi.\n"
        "- Câu hỏi yes/no hoặc một con số → trả lời trực tiếp trong 1–3 câu trước; chi tiết chỉ thêm khi cần.\n"
        "- Tóm tắt từ FAQ thành 2–4 câu; không copy nguyên văn trừ khi user hỏi chi tiết hoặc cần giữ bảng/HTML.\n"
        "- Dùng kết quả FAQ phù hợp nhất; bỏ qua kết quả phụ trừ khi user hỏi 'tất cả', 'so sánh', 'liệt kê'.\n"
        "- Tối đa ~150 từ cho câu hỏi đơn giản; kết thúc bằng 1 gợi ý ngắn thay vì liệt kê mọi chủ đề liên quan.\n\n"
        "Vai trò của bạn:\n"
        "- Trả lời câu hỏi về các sản phẩm bảo hiểm từ nhiều đối tác bằng cách tìm kiếm trong FAQ với tool 'search_faq_docs'\n"
        "- So sánh sản phẩm bảo hiểm từ file upload với các gói hiện có trên Zalopay bằng tool 'compare_insurance_products'\n"
        "- Nhớ thông tin quan trọng về người dùng với tool 'remember'\n"
        "- Tra cứu lại các tương tác và thông tin đã học với tool 'recall' khi cần cá nhân hóa\n"
        "- Cung cấp câu trả lời chính xác, ngắn gọn, dựa trên tài liệu FAQ\n"
        "- So sánh khách quan giữa các gói bảo hiểm chỉ khi được hỏi\n"
        "- Nếu không tìm thấy câu trả lời trong tài liệu, hãy nói thẳng thắn\n"
        "- Giao tiếp thân thiện, giữ ngữ cảnh xuyên suốt cuộc trò chuyện\n\n"
        "Quy trình trả lời:\n"
        "1. Tìm kiếm FAQ bằng 'search_faq_docs'\n"
        "2. Chỉ gọi 'recall' khi cần thông tin cá nhân hóa từ các lượt chat trước\n"
        "3. Trả lời súc tích theo nguyên tắc trên; gọi 'remember' khi user chia sẻ nhu cầu/sở thích quan trọng\n\n"
        "XỬ LÝ FILE UPLOAD:\n"
        "- Khi người dùng upload file bảo hiểm, phân tích thông tin trong file\n"
        "- Sử dụng 'compare_insurance_products' để so sánh với sản phẩm trên Zalopay\n"
        "- Đưa ra nhận xét khách quan về ưu/nhược điểm\n"
        "- Gợi ý sản phẩm tương tự hoặc tốt hơn trên Zalopay\n\n"
        "QUY TẮC FORMAT OUTPUT (MARKDOWN):\n"
        "- Trả lời bằng Markdown; câu hỏi đơn giản thường chỉ cần 1 đoạn hoặc vài bullet ngắn\n"
        "- Dùng **bold** cho thông tin then chốt\n"
        "- Dùng ###, emoji, bảng CHỈ khi user hỏi so sánh, liệt kê nhiều mục, hoặc yêu cầu chi tiết\n"
        "- Dùng markdown tables khi so sánh:\n"
        "  | Tiêu chí | Sản phẩm A | Sản phẩm B |\n"
        "  |----------|------------|------------|\n"
        "  | Chi phí  | 100K       | 150K       |\n\n"
        "FORMAT CHO CÂU HỎI ĐƠN LẺ (1 sản phẩm):\n"
        "- Tóm tắt 2–4 câu; giữ HTML/bảng FAQ chỉ khi user cần chi tiết giá hoặc quyền lợi đầy đủ\n\n"
        "FORMAT CHO CÂU HỎI TỔNG HỢP (nhiều sản phẩm — chỉ khi user hỏi tất cả/so sánh):\n"
        "Dùng format phân cấp rõ ràng:\n\n"
        "🔹 **TÊN SẢN PHẨM 1** (Đối tác)\n"
        "- **Chi phí:** ...\n"
        "- **Quyền lợi:** ...\n"
        "- **Đặc điểm:** ...\n\n"
        "🔹 **TÊN SẢN PHẨM 2** (Đối tác)\n"
        "- **Chi phí:** ...\n"
        "- **Quyền lợi:** ...\n"
        "- **Đặc điểm:** ...\n\n"
        "FORMAT CHO SO SÁNH SẢN PHẨM:\n"
        "### So sánh: [Tên sản phẩm]\n\n"
        "**Sản phẩm upload:**\n"
        "- Đối tác: ...\n"
        "- Chi phí: ...\n"
        "- Quyền lợi: ...\n\n"
        "**Sản phẩm tương tự trên Zalopay:**\n\n"
        "| Tiêu chí | Sản phẩm Upload | Zalopay - A | Zalopay - B |\n"
        "|----|----|----|----|\n"
        "| Chi phí | ... | ... | ... |\n"
        "| Quyền lợi | ... | ... | ... |\n\n"
        "**Nhận xét:**\n"
        "- Ưu điểm: ...\n"
        "- Nhược điểm: ...\n"
        "- Gợi ý: ...\n\n"
        "Lưu ý:\n"
        "- Luôn trả lời bằng tiếng Việt\n"
        "- Thân thiện, nhiệt tình, chuyên nghiệp\n"
        "- Nếu người dùng chào hỏi, hãy giới thiệu bản thân và dịch vụ\n"
        "- Khi so sánh giữa các đối tác, trình bày khách quan, không thiên vị\n"
        "- KHÔNG bao giờ tự thêm markdown syntax không cần thiết"
    ),
    checkpointer=checkpointer,
)


@app.entrypoint
async def handler(payload: dict, context: RequestContext) -> dict:
    """Main agent entrypoint with LangChain + Memory support.

    Args:
        payload: JSON body with "message" and optional "file"
        context: Request metadata (session_id, user_id, request_headers)
    """
    # Short-term memory (checkpointer) requires both user_id and session_id
    # to correctly persist and isolate conversation state per user per session.
    if not context.user_id or not context.session_id:
        return {
            "status": "error",
            "error": "Missing required headers: X-GreenNode-AgentBase-User-Id and X-GreenNode-AgentBase-Session-Id are required when using memory.",
        }

    message = payload.get("message", "Hello")
    file_data = payload.get("file")
    t_start = time.monotonic()

    logger.info(
        "[handler] user=%s session=%s msg=%r has_file=%s",
        context.user_id, context.session_id, message[:100], bool(file_data),
    )

    # Handle file upload if present
    enhanced_message = message
    if file_data:
        try:
            logger.info("[handler] processing uploaded file: %s", file_data.get("name", "unknown"))
            
            # Parse file content
            file_content = parse_uploaded_file(file_data)
            
            # Extract insurance info using LLM
            insurance_info = extract_insurance_features(file_content, llm)
            
            # Enhance message with file context
            enhanced_message = f"""Người dùng đã upload file bảo hiểm: {file_data.get('name')}

Thông tin trích xuất từ file:
{json.dumps(insurance_info, ensure_ascii=False, indent=2)}

Câu hỏi của người dùng: {message}

Hãy phân tích file này và so sánh với các sản phẩm bảo hiểm trên Zalopay. 
Sử dụng tool 'compare_insurance_products' để đưa ra so sánh chi tiết."""
            
            logger.info("[handler] extracted insurance info: %s", insurance_info.get("product_name", "N/A"))
            
        except Exception as e:
            logger.error(f"[handler] error processing file: {e}")
            return {
                "status": "error",
                "error": f"Không thể xử lý file upload: {str(e)}",
                "timestamp": datetime.now().isoformat(),
            }

    # Map AgentBase context to LangGraph config
    # thread_id -> session persistence, actor_id -> per-user memory
    config = {
        "configurable": {
            "thread_id": context.session_id,
            "actor_id": context.user_id,
        }
    }

    # ainvoke is required when using async tools (remember, recall)
    result = await agent.ainvoke(
        {"messages": [{"role": "user", "content": enhanced_message}]},
        config=config,
    )
    ai_message = result["messages"][-1]

    # Count tool calls made during this invocation for observability
    tool_calls = sum(
        1 for m in result["messages"]
        if hasattr(m, "type") and m.type == "tool"
    )
    elapsed = time.monotonic() - t_start
    logger.info(
        "[handler] done user=%s tool_calls=%d elapsed=%.2fs has_file=%s",
        context.user_id, tool_calls, elapsed, bool(file_data),
    )

    return {
        "status": "success",
        "response": normalize_brand_name(ai_message.content),
        "timestamp": datetime.now().isoformat(),
    }


@app.ping
def health_check() -> PingStatus:
    """Custom health check for GET /health endpoint."""
    return PingStatus.HEALTHY


if __name__ == "__main__":
    port = int(os.environ.get("AGENT_PORT", 8080))
    app.run(port=port, host="0.0.0.0")
