# Flowy Agent - Multi-Partner Insurance FAQ Chatbot

Agent tư vấn bảo hiểm đa đối tác với giao diện chat, tích hợp upload file và so sánh sản phẩm. Được xây dựng trên nền tảng GreenNode AgentBase.

## Tech Stack

- **Backend**: Python 3.13 + LangChain + LangGraph
- **Frontend**: React 19 + Vite + TailwindCSS
- **LLM**: OpenAI-compatible API (GreenNode AI Platform)
- **Memory**: AgentBase Memory (SEMANTIC strategy)
- **Deployment**: Docker + AgentBase Runtime
- **Knowledge Base**: Multi-partner JSON structure

## Features

### Core Capabilities
- **Multi-Partner Support**: Quản lý FAQ từ nhiều đối tác bảo hiểm (MSIG, VBI, PVI, Bảo Việt)
- **Intelligent Search**: Kết hợp fuzzy matching và LLM để tìm câu trả lời chính xác
- **Long-term Memory**: Ghi nhớ ngữ cảnh hội thoại và preferences theo user
- **Product Comparison**: So sánh các gói bảo hiểm khác nhau
- **File Upload**: Upload và phân tích tài liệu (PDF, JSON, TXT, CSV, Excel, Word)
- **Vietnamese Support**: Tối ưu cho tiếng Việt

### UI Features
- Modern chat interface với Zalopay branding
- Drag & drop file upload (tối đa 10MB)
- Real-time typing indicators
- Responsive design cho mobile và desktop

## Prerequisites

- **Python 3.13+** (hoặc 3.10+)
- **Node.js 24+** (để build frontend)
- **Docker** (để deploy)
- **GreenNode IAM Service Account** — [Tạo tại đây](https://iam.console.vngcloud.vn/service-accounts)

## Quick Start

### 1. Backend Setup

Tạo virtual environment và cài dependencies:

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configuration

Copy file config mẫu:

```bash
cp .env.example .env
cp agentbase.config.example.json agentbase.config.json
```

Cấu hình IAM credentials (chọn một trong hai):

- **Option A**: Biến môi trường

```bash
export GREENNODE_CLIENT_ID="your-client-id"
export GREENNODE_CLIENT_SECRET="your-client-secret"
```

- **Option B**: File `.greennode.json` (khuyến nghị cho local dev)

```json
{
  "client_id": "your-client-id",
  "client_secret": "your-client-secret"
}
```

### 3. Environment Variables

Edit file `.env` với các giá trị sau:

| Variable | Mô tả | Ví dụ |
|----------|--------|-------|
| `MEMORY_ID` | Memory store ID trên AgentBase | `mem_xxx` |
| `MEMORY_STRATEGY_ID` | Strategy ID cho long-term memory | `strat_xxx` |
| `LLM_BASE_URL` | Base URL OpenAI-compatible | `https://api.example.com/v1` |
| `LLM_MODEL` | Tên model | `gpt-4` |
| `LLM_API_KEY` | API key LLM | `sk-xxx` |
| `FAQ_DATA_PATH` | Path đến knowledge base | `knowledge` (default) |

> **Note**: Trên AgentBase Runtime, IAM và Agent Identity được inject tự động. Không cần config thủ công trong container.

## Development

### Run Backend

```bash
source venv/bin/activate
python3 main.py
```

Backend API chạy tại `http://127.0.0.1:8080`

### Run Frontend (Development Mode)

Mở terminal mới:

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server chạy tại `http://localhost:5173`

> **Note**: Cấu hình VITE_API_URL trong `frontend/.env` để kết nối tới backend

### Testing API

Test agent với curl:

```bash
curl -X POST http://127.0.0.1:8080/invocations \
  -H "Content-Type: application/json" \
  -H "X-GreenNode-AgentBase-User-Id: test-user" \
  -H "X-GreenNode-AgentBase-Session-Id: test-session-1" \
  -d '{"message": "So sánh gói bảo hiểm sức khỏe MSIG và VBI?"}'
```

Health check:

```bash
curl http://127.0.0.1:8080/health
# Response: {"status":"healthy"}
```

### Required Headers

Khi sử dụng memory, bắt buộc có cả hai headers:

- `X-GreenNode-AgentBase-User-Id`: Unique user identifier
- `X-GreenNode-AgentBase-Session-Id`: Session/conversation identifier

## Knowledge Base Management

### Structure

Knowledge base sử dụng cấu trúc multi-partner:

```
knowledge/
├── _index.json                    # Partner & product metadata
├── partners/
│   ├── msig/
│   │   └── health_247.json        # MSIG Health 24/7
│   ├── vbi/
│   │   └── cyber.json             # VBI Cyber Insurance
│   └── pvi/
│       └── health_premium.json    # PVI Care
└── cross_product/
    └── comparisons.json           # Cross-partner comparisons
```

### Adding New Partners

**Option 1: Manual (xem `knowledge/README.md`)**

1. Tạo file JSON trong `knowledge/partners/{partner_id}/{product_id}.json`
2. Update `knowledge/_index.json`
3. Validate với script

**Option 2: Import từ document (khuyến nghị)**

```bash
pip install -r requirements-import.txt

python3 scripts/import_partner_docs.py path/to/document.pdf \
  --partner-id new_partner \
  --partner-name "Partner Name" \
  --product-id product_id \
  --product-name "Product Name"
```

### Validation

Validate FAQ structure trước khi deploy:

```bash
python3 scripts/validate_faq.py knowledge/
```

Expected output:

```
✓ Loaded 150 FAQ entries from 3 partner(s)
✓ Validation passed
```

### Schema Documentation

- **Full guide**: `knowledge/README.md`
- **Quick start**: `knowledge/QUICKSTART.md`
- **Multi-partner guide**: `MULTI_PARTNER_GUIDE.md`

## Deployment

### Option 1: GitHub Actions CI/CD (Khuyến nghị)

Workflow tự động khi push lên `main`:

1. **Validate** FAQ structure
2. **Build** Docker image (frontend + backend)
3. **Push** to GreenNode Container Registry
4. **Update** AgentBase Runtime

#### Setup GitHub Secrets

Vào repo **Settings → Secrets and variables → Actions**, thêm:

| Secret Name | Mô tả | Lấy từ đâu |
|-------------|--------|------------|
| `GREENNODE_CLIENT_ID` | IAM Service Account ID | [IAM Console](https://iam.console.vngcloud.vn/service-accounts) |
| `GREENNODE_CLIENT_SECRET` | IAM Service Account Secret | IAM Console |
| `AGENTBASE_RUNTIME_ID` | Runtime ID | [AgentBase Console](https://aiplatform.console.vngcloud.vn/agent-runtime) |
| `MEMORY_ID` | Memory Store ID | [Memory Dashboard](https://aiplatform.console.vngcloud.vn/memory) |
| `MEMORY_STRATEGY_ID` | Memory Strategy ID | Memory Dashboard |
| `LLM_BASE_URL` | LLM API Base URL | GreenNode AI Platform |
| `LLM_MODEL` | Model name | `gpt-4`, `claude-3-sonnet`, etc. |
| `LLM_API_KEY` | LLM API Key | [Model Browser](https://aiplatform.console.vngcloud.vn/models) |

### Option 2: Manual Deployment

Build và deploy bằng script:

```bash
# Tạo file env cho production
cp .env .env.deploy

# Export IAM credentials
export GREENNODE_CLIENT_ID="your-client-id"
export GREENNODE_CLIENT_SECRET="your-client-secret"

# Run deploy script
bash scripts/deploy_agentbase.sh
```

Script sẽ:
1. Build Docker image với multi-stage build
2. Push image lên Container Registry
3. Update AgentBase Runtime với image mới

### Option 3: Local Docker Build

Build image locally để test:

```bash
docker build -t flowy-agent:local .
docker run -p 8080:8080 --env-file .env flowy-agent:local
```

Truy cập:
- API: `http://localhost:8080`
- Frontend: `http://localhost:8080` (nginx serve static files)

## Project Structure

```
flowy-agent/
├── main.py                          # Agent entrypoint + LangChain logic
├── requirements.txt                 # Python dependencies
├── requirements-import.txt          # Optional: document import tools
├── Dockerfile                       # Multi-stage build (frontend + backend)
├── nginx.conf                       # Nginx config for frontend serving
├── start.sh                         # Container startup script
├── .env.example                     # Environment variables template
├── agentbase.config.example.json    # AgentBase config template
│
├── knowledge/                       # Multi-partner knowledge base
│   ├── _index.json                  # Partner & product metadata
│   ├── README.md                    # Schema documentation
│   ├── QUICKSTART.md                # Quick start guide
│   ├── partners/                    # Partner-specific FAQs
│   │   ├── msig/
│   │   │   └── health_247.json
│   │   └── vbi/
│   │       └── cyber.json
│   └── cross_product/               # Cross-partner FAQs
│       └── comparisons.json
│
├── frontend/                        # React chat UI
│   ├── src/
│   │   ├── App.jsx                  # Main app component
│   │   ├── components/
│   │   │   ├── ChatContainer.jsx    # Chat layout
│   │   │   ├── MessageBubble.jsx    # Message component
│   │   │   ├── InputArea.jsx        # Input with file upload
│   │   │   └── FileUpload.jsx       # Drag & drop upload
│   │   ├── hooks/
│   │   │   └── useChat.js           # Chat state management
│   │   └── utils/
│   │       └── api.js               # API client
│   ├── package.json
│   └── vite.config.js
│
├── scripts/
│   ├── validate_faq.py              # Validate FAQ structure
│   ├── import_partner_docs.py       # Import from PDF/DOCX
│   ├── deploy_agentbase.sh          # Build & deploy to AgentBase
│   └── migrate_faq.py               # Migrate old FAQ format
│
├── docs/                            # Additional documentation
├── examples/                        # Example requests/responses
│
└── .github/
    └── workflows/
        └── deploy.yml               # CI/CD workflow
```

## Usage Examples

### Basic Chat Query

```bash
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -H "X-GreenNode-AgentBase-User-Id: user123" \
  -H "X-GreenNode-AgentBase-Session-Id: session456" \
  -d '{
    "message": "Gói bảo hiểm sức khỏe 24/7 của MSIG có những quyền lợi gì?"
  }'
```

### Product Comparison

```bash
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -H "X-GreenNode-AgentBase-User-Id: user123" \
  -H "X-GreenNode-AgentBase-Session-Id: session456" \
  -d '{
    "message": "So sánh gói bảo hiểm MSIG Sức khỏe 24/7 và VBI Cyber"
  }'
```

### File Upload Query

Frontend tự động gửi file content trong request body:

```json
{
  "message": "Phân tích các điều khoản trong file này",
  "file": {
    "name": "terms.pdf",
    "type": "application/pdf",
    "size": 204800,
    "content": "base64_encoded_data"
  }
}
```

## Monitoring & Debugging

### Check Agent Health

```bash
curl http://localhost:8080/health
```

### View Logs

Local development:

```bash
tail -f logs/agent.log  # if logging to file
# or view console output
```

AgentBase Runtime:

```bash
# Via AgentBase Console
# Or use agentbase CLI
agentbase runtime logs <RUNTIME_ID>
```

### Memory Inspection

Check user's long-term memory via AgentBase Memory Dashboard:

1. Go to [Memory Dashboard](https://aiplatform.console.vngcloud.vn/memory)
2. Select your Memory Store
3. Search by User ID or Session ID

### Common Issues

**Issue**: FAQ not found

- **Solution**: 
  - Check `knowledge/_index.json` has correct file paths
  - Validate with `python3 scripts/validate_faq.py knowledge/`
  - Ensure partner is `active: true`

**Issue**: File upload fails

- **Solution**:
  - Check file size < 10MB
  - Verify file type is supported (PDF, JSON, TXT, CSV, Excel, Word)
  - Check frontend VITE_API_URL points to correct backend

**Issue**: Memory not working

- **Solution**:
  - Verify `MEMORY_ID` and `MEMORY_STRATEGY_ID` in `.env`
  - Ensure headers `X-GreenNode-AgentBase-User-Id` and `X-GreenNode-AgentBase-Session-Id` are sent
  - Check IAM credentials have Memory service permissions

## Security Best Practices

### Never Commit These Files

- `.env`, `.env.deploy`, `.env.local`
- `.greennode.json`
- `agentbase.config.json`

All sensitive files are in `.gitignore`. Chỉ commit file `.example`.

### Secret Rotation

Nếu credentials bị lộ trên GitHub:

1. **Immediately rotate**:
   - IAM credentials tại [IAM Console](https://iam.console.vngcloud.vn/service-accounts)
   - LLM API keys tại provider dashboard
2. **Update** GitHub Secrets và `.env` files
3. **Redeploy** agent với credentials mới

### Container Security

- Image không chứa `.env` files (excluded via `.dockerignore`)
- Secrets được inject runtime qua AgentBase
- Nginx chỉ serve static frontend assets

## Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Validate FAQ: `python3 scripts/validate_faq.py knowledge/`
4. Commit with descriptive message
5. Push and create Pull Request

### Code Style

- Python: Follow PEP 8
- JavaScript: ESLint config in `frontend/eslint.config.js`
- Comments in English

## Links & Resources

### GreenNode Platform

- [AgentBase Console](https://aiplatform.console.vngcloud.vn/agent-runtime)
- [Memory Dashboard](https://aiplatform.console.vngcloud.vn/memory)
- [Model Browser](https://aiplatform.console.vngcloud.vn/models)
- [Container Registry](https://aiplatform.console.vngcloud.vn/registry)
- [IAM Service Accounts](https://iam.console.vngcloud.vn/service-accounts)

### Documentation

- [AgentBase Documentation](https://docs.vngcloud.vn/agentbase)
- [LangChain Docs](https://python.langchain.com/)
- [React + Vite](https://vite.dev/)

## License

MIT License

## Support

For issues or questions:
- Create GitHub issue
- Contact: thangtm2@vng.com.vn
