import os
import json
import logging
import time
from datetime import datetime
from difflib import SequenceMatcher

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
    results = search_faq_fuzzy(query, threshold=0.4, top_k=5, partner_filter=partner_filter)
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

    response = f"Tìm thấy {len(results)} kết quả liên quan:\n\n"
    for i, result in enumerate(results, 1):
        confidence_pct = int(result['score'] * 100)
        response += f"[{i}] {result['partner']} - {result['product']}\n"
        response += f"Câu hỏi: {result['canonical']}\n"
        response += f"Trả lời: {result['answer']}\n"
        response += f"Danh mục: {result['category']} | Độ tương đồng: {confidence_pct}%\n\n"

    return response


# --- Create Agent with Checkpointer ---
# create_agent builds a compiled LangGraph StateGraph with tool-calling support.
# checkpointer: persists conversation state via AgentBase Memory (short-term)
# Long-term memory is handled by remember/recall tools via MemoryClient SDK
agent = create_agent(
    llm,
    tools=[remember, recall, search_faq_docs],
    system_prompt=(
        "Bạn là trợ lý tư vấn bảo hiểm trên nền tảng Zalopay.\n\n"
        "Vai trò của bạn:\n"
        "- Trả lời câu hỏi về các sản phẩm bảo hiểm từ nhiều đối tác bằng cách tìm kiếm trong FAQ với tool 'search_faq_docs'\n"
        "- Nhớ thông tin quan trọng về người dùng với tool 'remember'\n"
        "- Tra cứu lại các tương tác và thông tin đã học với tool 'recall'\n"
        "- Cung cấp câu trả lời chính xác, rõ ràng dựa trên tài liệu FAQ\n"
        "- So sánh khách quan giữa các gói bảo hiểm khi được hỏi\n"
        "- Nếu không tìm thấy câu trả lời trong tài liệu, hãy nói thẳng thắn\n"
        "- Giao tiếp thân thiện, giữ ngữ cảnh xuyên suốt cuộc trò chuyện\n\n"
        "Quy trình trả lời:\n"
        "1. Tìm kiếm thông tin trong FAQ bằng 'search_faq_docs'\n"
        "2. Kiểm tra memory xem có thông tin liên quan về người dùng này không\n"
        "3. Kết hợp cả hai nguồn để đưa ra câu trả lời cá nhân hóa, chính xác\n"
        "4. Nhớ các thông tin quan trọng về nhu cầu hoặc sở thích của người dùng\n\n"
        "QUY TẮC FORMAT OUTPUT (RẤT QUAN TRỌNG):\n"
        "- KHÔNG tự thêm markdown syntax (**, *, _, ~) vào nội dung từ FAQ\n"
        "- Trả lời CHÍNH XÁC theo nội dung trong FAQ, giữ nguyên format có sẵn\n"
        "- Nếu FAQ có HTML table (<table>), giữ nguyên không thay đổi\n"
        "- Nếu FAQ có bullet points (•, -), giữ nguyên không thay đổi\n"
        "- Nếu FAQ có emoji và icon, giữ nguyên không thay đổi\n"
        "- Chỉ tóm tắt hoặc diễn giải KHI THẬT SỰ CẦN THIẾT, ưu tiên trích dẫn nguyên văn\n"
        "- Khi cần nhấn mạnh, dùng emoji thay vì markdown (✓, ✗, 💡, ⚠️, 📌)\n\n"
        "FORMAT CHO CÂU HỎI TỔNG HỢP (nhiều sản phẩm):\n"
        "Khi trả lời về NHIỀU sản phẩm bảo hiểm, BẮT BUỘC dùng format phân cấp rõ ràng:\n\n"
        "🔹 TÊN SẢN PHẨM 1 (Đối tác):\n"
        "   • Chi phí: ...\n"
        "   • Quyền lợi: ...\n"
        "   • Đặc điểm: ...\n\n"
        "🔹 TÊN SẢN PHẨM 2 (Đối tác):\n"
        "   • Chi phí: ...\n"
        "   • Quyền lợi: ...\n"
        "   • Đặc điểm: ...\n\n"
        "Lưu ý: Các thông tin chi tiết PHẢI được indent với 3 SPACES và bullet point (•)\n\n"
        "VÍ DỤ FORMAT ĐÚNG:\n\n"
        "Câu hỏi đơn lẻ về 1 sản phẩm:\n"
        "→ Trích nguyên văn từ FAQ, giữ nguyên format HTML table/bullets\n\n"
        "Câu hỏi tổng hợp về nhiều sản phẩm:\n"
        "→ Dùng format phân cấp với icon 🔹 và indent 3 spaces\n\n"
        "Lưu ý:\n"
        "- Luôn trả lời bằng tiếng Việt\n"
        "- Thân thiện, nhiệt tình, chuyên nghiệp\n"
        "- Nếu người dùng chào hỏi, hãy giới thiệu bản thân và dịch vụ\n"
        "- Khi so sánh giữa các đối tác, trình bày khách quan, không thiên vị"
    ),
    checkpointer=checkpointer,
)


def format_response(text: str) -> str:
    """
    Post-process response to ensure consistent formatting.
    - Preserve HTML tables
    - Preserve bullet points and emojis
    - Clean up extra whitespace
    - Auto-format multi-product responses with proper indentation
    """
    import re
    
    # Preserve existing line breaks and structure
    lines = text.split('\n')
    formatted_lines = []
    in_product_section = False
    
    for i, line in enumerate(lines):
        # Skip empty lines (but keep them)
        if not line.strip():
            formatted_lines.append(line)
            in_product_section = False
            continue
        
        # Don't modify HTML table lines
        if any(tag in line for tag in ['<table>', '</table>', '<tr>', '</tr>', '<th>', '</th>', '<td>', '</td>']):
            formatted_lines.append(line)
            continue
        
        # Detect product headers (usually start with emoji or product names)
        product_indicators = ['🔹', '💼', '🏥', '🛡️', '💳', 'Bảo hiểm', 'Gói']
        is_product_header = any(indicator in line for indicator in product_indicators) and (
            'VBI' in line or 'MSIG' in line or 'GIC' in line or 
            'Cyber' in line or 'Sức khỏe' in line or 'Credit' in line
        )
        
        if is_product_header:
            # Product header - no indent
            formatted_lines.append(line)
            in_product_section = True
            continue
        
        # If we're in a product section and line starts with bullet/dash without proper indent
        if in_product_section and re.match(r'^[•\-\*]\s', line):
            # Add proper indent (3 spaces) if not already indented
            if not line.startswith('   '):
                formatted_lines.append('   ' + line)
            else:
                formatted_lines.append(line)
            continue
        
        # If line doesn't start with bullet but is clearly a detail line (Chi phí, Quyền lợi, etc.)
        detail_keywords = ['Chi phí', 'Quyền lợi', 'Đặc điểm', 'Thời hạn', 'Độ tuổi', 'Phí bảo hiểm']
        if in_product_section and any(keyword in line for keyword in detail_keywords):
            # Convert to bullet point with indent if not already formatted
            if not re.match(r'^\s+[•\-\*]', line):
                formatted_lines.append('   • ' + line.strip())
            else:
                formatted_lines.append(line)
            continue
        
        # Don't modify lines that already have bullet points or numbered lists
        if re.match(r'^\s*[•\-\*\d\.]\s', line):
            formatted_lines.append(line)
            continue
        
        # Clean up excessive whitespace but preserve intentional spacing
        cleaned = re.sub(r'\s+', ' ', line).strip()
        formatted_lines.append(cleaned)
    
    return '\n'.join(formatted_lines)


@app.entrypoint
async def handler(payload: dict, context: RequestContext) -> dict:
    """Main agent entrypoint with LangChain + Memory support.

    Args:
        payload: JSON body with "message"
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
    t_start = time.monotonic()

    logger.info(
        "[handler] user=%s session=%s msg=%r",
        context.user_id, context.session_id, message[:100],
    )

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
        {"messages": [{"role": "user", "content": message}]},
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
        "[handler] done user=%s tool_calls=%d elapsed=%.2fs",
        context.user_id, tool_calls, elapsed,
    )

    return {
        "status": "success",
        "response": format_response(ai_message.content),
        "timestamp": datetime.now().isoformat(),
    }


@app.ping
def health_check() -> PingStatus:
    """Custom health check for GET /health endpoint."""
    return PingStatus.HEALTHY


if __name__ == "__main__":
    port = int(os.environ.get("AGENT_PORT", 8080))
    app.run(port=port, host="0.0.0.0")
