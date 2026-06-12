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

# --- FAQ Data Loading ---
FAQ_DATA_PATH = os.environ.get("FAQ_DATA_PATH", "knowledge/faq.json")
FAQ_VARIANTS = []

def load_faq_data():
    """Load FAQ question variants from JSON file."""
    global FAQ_VARIANTS
    try:
        with open(FAQ_DATA_PATH, "r", encoding="utf-8") as f:
            FAQ_VARIANTS = json.load(f)
        print(f"✓ Loaded {len(FAQ_VARIANTS)} FAQ entries from {FAQ_DATA_PATH}")
    except Exception as e:
        print(f"Warning: Could not load FAQ data from {FAQ_DATA_PATH}: {e}")
        FAQ_VARIANTS = []

def similarity_score(str1: str, str2: str) -> float:
    """Calculate similarity between two strings (0-1)"""
    return SequenceMatcher(None, str1.lower(), str2.lower()).ratio()

def search_faq_fuzzy(question: str, threshold: float = 0.4, top_k: int = 3) -> list:
    """
    Search FAQ using fuzzy matching
    Returns top_k most similar Q&A pairs
    """
    results = []
    
    for item in FAQ_VARIANTS:
        score = similarity_score(question, item['instruction'])
        if score >= threshold:
            results.append({
                'question': item['instruction'],
                'answer': item['output'],
                'category': item.get('category', 'General'),
                'score': score
            })
    
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:top_k]

# Load FAQ data on startup
load_faq_data()

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


def _get_actor_id() -> str:
    """Get actor_id from LangGraph configurable (set during graph.invoke)."""
    config = get_config()
    return config["configurable"].get("actor_id", "default")


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
    """Search FAQ documentation for answers to user questions about Bảo hiểm Sức khỏe 24/7.

    Args:
        query: The user's question or topic to search for in the FAQ docs.
    """
    logger.info("[tool:search_faq] query=%r", query[:80])
    if not FAQ_VARIANTS:
        return f"FAQ database is not loaded. Please check if {FAQ_DATA_PATH} exists."

    t0 = time.monotonic()
    results = search_faq_fuzzy(query, threshold=0.4, top_k=5)
    logger.info("[tool:search_faq] matched %d results (%.2fs)", len(results), time.monotonic() - t0)

    if not results:
        return (
            "Không tìm thấy thông tin phù hợp trong FAQ về Bảo hiểm Sức khỏe 24/7.\n"
            "Có thể hỏi về:\n"
            "- Bảo hiểm Sức khỏe 24/7 là gì?\n"
            "- Quyền lợi bảo hiểm (Nội trú, Ngoại trú, Khám từ xa)\n"
            "- Quy trình mua và sử dụng\n"
            "- Quy trình bồi thường\n"
            "- Thời hạn bảo hiểm"
        )

    response = f"Tìm thấy {len(results)} kết quả liên quan:\n\n"
    for i, result in enumerate(results, 1):
        confidence_pct = int(result['score'] * 100)
        response += f"[{i}] Câu hỏi: {result['question']}\n"
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
        "Bạn là trợ lý tư vấn Bảo hiểm Sức khỏe 24/7 trên Zalopay, được cung cấp bởi MSIG Việt Nam.\n\n"
        "Vai trò của bạn:\n"
        "- Trả lời câu hỏi về Bảo hiểm Sức khỏe 24/7 bằng cách tìm kiếm trong FAQ với tool 'search_faq_docs'\n"
        "- Nhớ thông tin quan trọng về người dùng với tool 'remember'\n"
        "- Tra cứu lại các tương tác và thông tin đã học với tool 'recall'\n"
        "- Cung cấp câu trả lời chính xác, rõ ràng dựa trên tài liệu FAQ\n"
        "- Nếu không tìm thấy câu trả lời trong tài liệu, hãy nói thẳng thắn\n"
        "- Giao tiếp thân thiện, giữ ngữ cảnh xuyên suốt cuộc trò chuyện\n\n"
        "Quy trình trả lời:\n"
        "1. Tìm kiếm thông tin trong FAQ bằng 'search_faq_docs'\n"
        "2. Kiểm tra memory xem có thông tin liên quan về người dùng này không\n"
        "3. Kết hợp cả hai nguồn để đưa ra câu trả lời cá nhân hóa, chính xác\n"
        "4. Nhớ các thông tin quan trọng về nhu cầu hoặc sở thích của người dùng\n\n"
        "Lưu ý:\n"
        "- Luôn trả lời bằng tiếng Việt\n"
        "- Thân thiện, nhiệt tình, chuyên nghiệp\n"
        "- Nếu người dùng chào hỏi, hãy giới thiệu bản thân và dịch vụ"
    ),
    checkpointer=checkpointer,
)


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
        "response": ai_message.content,
        "timestamp": datetime.now().isoformat(),
    }


@app.ping
def health_check() -> PingStatus:
    """Custom health check for GET /health endpoint."""
    return PingStatus.HEALTHY


if __name__ == "__main__":
    port = int(os.environ.get("AGENT_PORT", 8080))
    app.run(port=port, host="0.0.0.0")
