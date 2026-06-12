# faq-support-agent

A GreenNode AgentBase agent with LangChain and Memory support for FAQ documentation about Bảo hiểm Sức khỏe 24/7 (Zalopay).

## 🔗 Quick Links

- **Production Endpoint**: https://endpoint-5d12d628-f18b-46d6-be03-c1da5d44770a.agentbase-runtime.aiplatform.vngcloud.vn
- **Management Console**: https://aiplatform.console.vngcloud.vn/agent-runtime
- **Memory Dashboard**: https://aiplatform.console.vngcloud.vn/memory
- **Model Browser**: https://aiplatform.console.vngcloud.vn/models

**Tech Stack:**
- 🤖 **LLM**: Qwen 3.5 27B (FREE, 262K context)
- 🧠 **Memory**: AgentBase Memory (SEMANTIC strategy)
- 🔧 **Framework**: LangChain + LangGraph
- 📚 **FAQ Data**: 283 question variants

## ✨ Features

- ✅ **Intelligent FAQ Search**: Combines fuzzy matching with LLM semantic understanding
- ✅ **Conversation Memory**: Remembers context across multi-turn conversations (30 days retention)
- ✅ **Long-term Learning**: Extracts and recalls important user preferences and facts
- ✅ **Vietnamese Language**: Native support for Vietnamese questions and answers
- ✅ **Tool-based Architecture**: Modular tools for search, remember, and recall
- ✅ **Production Ready**: Deployed on AgentBase Runtime with auto-scaling

## Prerequisites

- Python 3.10+
- A GreenNode IAM Service Account ([create one here](https://iam.console.vngcloud.vn/service-accounts))

## Setup

1. Create and activate a virtual environment:
   ```bash
   # macOS/Linux:
   python3 -m venv venv && source venv/bin/activate

   # Windows (PowerShell):
   python -m venv venv; venv\Scripts\Activate.ps1
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure credentials for **local development** (choose one method):

   **Option A** - Environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

   **Option B** - Config file (already created):
   Edit `.greennode.json` with your `client_id` and `client_secret` from your IAM Service Account.

   > **Note**: When deployed on AgentBase Runtime, the IAM service account and Agent Identity are managed by the runtime system and automatically available to the SDK — no manual credential configuration needed in the container.

4. (Optional, for local dev) Create an Agent Identity at https://aiplatform.console.vngcloud.vn/access-control and set `agent_identity` in `.greennode.json` or `GREENNODE_AGENT_IDENTITY` env var. On AgentBase Runtime, this is managed automatically by the runtime system.

## Configure LLM

This project uses GreenNode AI Platform (AgentBase). The LLM and Memory are already configured:

**Current Setup:**
- **LLM Model**: Qwen 3.5 27B (FREE, 262K context, multilingual)
- **API Key**: `claw26-team155` (configured in `.env`)
- **Base URL**: `https://maas-llm-aiplatform-hcm.api.vngcloud.vn/v1`
- **Memory**: `faq-support-agent-memory` with SEMANTIC strategy

All environment variables are set in `.env`:
```
MEMORY_ID=memory-a8b8b7b9-3f79-4497-83b7-bacfdb8c27f8
MEMORY_STRATEGY_ID=ltms-a1efe41c-101c-444b-b678-6702df8ae600
LLM_BASE_URL=https://maas-llm-aiplatform-hcm.api.vngcloud.vn/v1
LLM_MODEL=qwen/qwen3-5-27b
LLM_API_KEY=<your-key>
```

To use a different model, run `/agentbase-llm` skill to browse and select models.

## Run Locally

**Prerequisites:**
- Python 3.10+ with virtual environment
- All dependencies installed: `pip install -r requirements.txt`

**Start the agent:**
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
python3 main.py
```

The agent starts on `http://127.0.0.1:8080`.

**Test the FAQ agent with AI:**
```bash
curl -X POST http://127.0.0.1:8080/invocations \
  -H "Content-Type: application/json" \
  -H "X-GreenNode-AgentBase-User-Id: test-user" \
  -H "X-GreenNode-AgentBase-Session-Id: test-session-1" \
  -d '{"message": "Bảo hiểm Sức khỏe 24/7 là gì?"}'
```

Expected response: The agent uses Qwen 3.5 27B to search FAQ data and provide an intelligent, contextual answer in Vietnamese.

## 🚀 Production Deployment

**Status**: ✅ Deployed on AgentBase Runtime

**Public Endpoint**: https://endpoint-5d12d628-f18b-46d6-be03-c1da5d44770a.agentbase-runtime.aiplatform.vngcloud.vn

**Deployment Info:**
- **Deployed Date**: June 12, 2026
- **Runtime**: AgentBase Runtime (VNG Cloud)
- **LLM**: Qwen 3.5 27B (FREE, multilingual, 262K context)
- **Memory**: Enabled (SEMANTIC strategy, 30 days event retention)
- **API Key**: `claw26-team155`

**Test Production Endpoint:**
```bash
curl -X POST https://endpoint-5d12d628-f18b-46d6-be03-c1da5d44770a.agentbase-runtime.aiplatform.vngcloud.vn/invocations \
  -H "Content-Type: application/json" \
  -H "X-GreenNode-AgentBase-User-Id: user123" \
  -H "X-GreenNode-AgentBase-Session-Id: session1" \
  -d '{"message": "Bảo hiểm Sức khỏe 24/7 là gì?"}'
```

**Web Interface**: Visit the endpoint URL in browser to see the interactive FAQ testing interface.

**Management Console**: https://aiplatform.console.vngcloud.vn/agent-runtime

---

**Testing tips** — the SDK extracts metadata from request headers (defined in `greennode_agentbase.runtime.models`):
- If the agent uses **memory** (short-term or long-term), **both headers are required** — the agent will return an error without them:
  `-H "X-GreenNode-AgentBase-User-Id: test-user"` `-H "X-GreenNode-AgentBase-Session-Id: test-session-1"`
- If the agent uses **user identity features** (delegated API key, OAuth2 3LO token), pass a user header so credentials resolve correctly:
  `-H "X-GreenNode-AgentBase-User-Id: user-abc"`
- To pass **custom headers** to the agent, use the `X-GreenNode-AgentBase-Custom-` prefix. The SDK collects all headers with this prefix (plus `Authorization`) into `context.request_headers`:
  `-H "X-GreenNode-AgentBase-Custom-My-Key: some-value"`
  Then access in handler: `context.request_headers.get("X-GreenNode-AgentBase-Custom-My-Key")`

Health check:
```bash
curl http://127.0.0.1:8080/health
```

## Deploy to AgentBase Runtime (Already Deployed ✅)

**Current deployment** is live at the production endpoint above. To redeploy or update:

1. Build and push your Docker image:
   ```bash
   docker build -t faq-agent .
   # Tag and push to your registry
   ```

2. Use the `/agentbase-deploy` skill in Cursor to automate deployment:
   ```
   /agentbase-deploy
   ```

3. Or manually via [AgentBase Console](https://aiplatform.console.vngcloud.vn):
   - Create/Update Runtime at https://aiplatform.console.vngcloud.vn/agent-runtime?tab=runtime
   - Create/Update Endpoint pointing to your Runtime

**Resources:**
- **Memory**: `memory-a8b8b7b9-3f79-4497-83b7-bacfdb8c27f8` (faq-support-agent-memory)
- **LLM API Key**: `claw26-team155` (managed via `/agentbase-llm`)
- **Model**: Qwen 3.5 27B (enabled)

## Add Conversation Memory (Optional)

When you need conversation history or long-term memory, use `/agentbase-memory` to set up AgentBase Memory and integrate it with your agent.

## Project Structure

- `main.py` - Agent entrypoint with handler and health check
- `Dockerfile` - Container image definition
- `requirements.txt` - Python dependencies
- `.greennode.json` - AgentBase configuration
- `.env.example` - Environment variable template
