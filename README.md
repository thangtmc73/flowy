# faq-support-agent

Monorepo gồm agent tư vấn FAQ (Python/LangChain) và giao diện chat (React), triển khai trên GreenNode AgentBase.

## Tech stack

- **LLM**: OpenAI-compatible provider (GreenNode AI Platform khuyến nghị)
- **Memory**: AgentBase Memory (SEMANTIC strategy)
- **Framework**: LangChain + LangGraph
- **FAQ**: JSON tĩnh trong `knowledge/faq.json`

## Features

- Tìm kiếm FAQ kết hợp fuzzy matching và LLM
- Ghi nhớ ngữ cảnh hội thoại và long-term memory theo user
- Hỗ trợ tiếng Việt
- Frontend chat tích hợp trong Docker image

## Prerequisites

- Python 3.10+
- Node.js 24+ (chỉ khi phát triển frontend local)
- Docker (deploy)
- GreenNode IAM Service Account — [tạo tại đây](https://iam.console.vngcloud.vn/service-accounts)

## Local setup

1. Tạo virtual environment và cài dependencies:

```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

2. Copy file env mẫu và điền giá trị **trên máy local** (không commit):

```bash
cp .env.example .env
cp agentbase.config.example.json agentbase.config.json
```

3. Cấu hình credentials (chọn một):

- **Option A**: biến môi trường `GREENNODE_CLIENT_ID` / `GREENNODE_CLIENT_SECRET`
- **Option B**: file `.greennode.json` (đã nằm trong `.gitignore`)

> Trên AgentBase Runtime, IAM và Agent Identity được platform inject tự động — không cần cấu hình thủ công trong container.

4. Biến môi trường bắt buộc trong `.env`:

| Variable | Mô tả |
|----------|--------|
| `MEMORY_ID` | ID memory store trên AgentBase |
| `MEMORY_STRATEGY_ID` | Strategy ID cho long-term memory |
| `LLM_BASE_URL` | Base URL OpenAI-compatible |
| `LLM_MODEL` | Tên model |
| `LLM_API_KEY` | API key LLM |

## Run locally

```bash
source venv/bin/activate
python3 main.py
```

Agent chạy tại `http://127.0.0.1:8080`.

```bash
curl -X POST http://127.0.0.1:8080/invocations \
  -H "Content-Type: application/json" \
  -H "X-GreenNode-AgentBase-User-Id: test-user" \
  -H "X-GreenNode-AgentBase-Session-Id: test-session-1" \
  -d '{"message": "So sánh các gói bảo hiểm sức khỏe?"}'
```

Health check:

```bash
curl http://127.0.0.1:8080/health
```

### Memory headers

Khi bật memory, bắt buộc có cả hai header:

- `X-GreenNode-AgentBase-User-Id`
- `X-GreenNode-AgentBase-Session-Id`

## FAQ knowledge

File `knowledge/_index.json` định nghĩa cấu trúc multi-partner. Mỗi đối tác có file JSON riêng trong `knowledge/partners/{partner_id}/{product_id}.json`.

Xem chi tiết schema và hướng dẫn trong `knowledge/README.md` và `knowledge/QUICKSTART.md`.

**Validate trước khi deploy:**

```bash
python3 scripts/validate_faq.py knowledge/
```

**Thêm đối tác mới:**

Xem `knowledge/QUICKSTART.md` hoặc dùng script import:

```bash
python3 scripts/import_partner_docs.py path/to/document.pdf \
  --partner-id new_partner \
  --partner-name "Partner Name" \
  --product-id product_id \
  --product-name "Product Name"
```

## Deploy

### GitHub Actions (khuyến nghị)

Push lên `main` → workflow validate FAQ → build Docker → push Container Registry → update AgentBase runtime.

**Repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Mô tả |
|--------|--------|
| `GREENNODE_CLIENT_ID` | IAM client ID |
| `GREENNODE_CLIENT_SECRET` | IAM client secret |
| `AGENTBASE_RUNTIME_ID` | Runtime ID trên AgentBase |
| `MEMORY_ID` | Memory store ID |
| `MEMORY_STRATEGY_ID` | Memory strategy ID |
| `LLM_BASE_URL` | LLM base URL |
| `LLM_MODEL` | LLM model name |
| `LLM_API_KEY` | LLM API key |

### Deploy thủ công

```bash
cp .env .env.deploy   # hoặc tạo file env riêng cho runtime
export GREENNODE_CLIENT_ID=...
export GREENNODE_CLIENT_SECRET=...
bash scripts/deploy_agentbase.sh
```

## Frontend (dev)

```bash
cd frontend
npm install
npm run dev
```

## Project structure

```
├── main.py                 # Agent entrypoint
├── knowledge/              # Multi-partner knowledge base
│   ├── _index.json         # Partner & product index
│   ├── partners/           # Partner-specific FAQs
│   └── cross_product/      # Cross-partner comparisons
├── frontend/               # React chat UI
├── scripts/
│   ├── validate_faq.py     # Validate FAQ JSON
│   ├── import_partner_docs.py  # Import from PDF/DOCX
│   └── deploy_agentbase.sh # Build + deploy script
├── Dockerfile
├── agentbase.config.example.json
└── .github/workflows/      # CI/CD
```

## Security

**Không commit** các file sau:

- `.env`, `.env.deploy`, `.env.local`
- `.greennode.json`
- `agentbase.config.json` (copy từ `agentbase.config.example.json`)

Nếu secret đã lộ trên GitHub, hãy **rotate ngay** LLM API key và IAM credentials trên VNG Cloud console.

## Links

- [AgentBase Console](https://aiplatform.console.vngcloud.vn/agent-runtime)
- [Memory Dashboard](https://aiplatform.console.vngcloud.vn/memory)
- [Model Browser](https://aiplatform.console.vngcloud.vn/models)
