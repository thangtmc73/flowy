# Import Partner FAQs from PDF/DOCX

Hướng dẫn import tài liệu FAQ từ PDF hoặc DOCX của đối tác vào hệ thống.

## Quick Start

### 1. Install dependencies

Cài dependencies chính (bao gồm LLM cho `--use-llm`):

```bash
pip install -r requirements.txt
pip install -r requirements-import.txt
```

Hoặc cài riêng lẻ cho parsing tài liệu:

```bash
pip install python-docx PyPDF2
```

> **Lưu ý:** `langchain-openai` nằm trong `requirements.txt`, không nằm trong `requirements-import.txt`. Chỉ cài `requirements-import.txt` thì mode `--use-llm` sẽ không chạy được.

### 2. Prepare your file

Hỗ trợ 2 định dạng:
- **DOCX**: Word documents (`.docx`)
- **PDF**: PDF files (`.pdf`)

### 3. Run import script

Chạy từ **thư mục gốc repo** (`flowy-agent/`).

**Basic (manual parsing)**:

```bash
python3 scripts/import_partner_docs.py \
  --file /path/to/gic_faq.docx \
  --partner-id gic \
  --partner-name "GIC Insurance" \
  --product-id credit_topup \
  --product-name "Credit Topup Insurance" \
  --category financial
```

**Recommended (with LLM parsing)**:

```bash
python3 scripts/import_partner_docs.py \
  --file /path/to/baoviet_faq.pdf \
  --partner-id baoviet \
  --partner-name "Bảo Việt Insurance" \
  --product-id flight_delay_cancel \
  --product-name "Bảo hiểm trễ và hủy chuyến bay" \
  --category travel \
  --use-llm
```

### 4. Review output

Script tạo / ghi đè file tại:

```
knowledge/partners/{partner_id}_{product_id}.json
```

Đồng thời **tự cập nhật** `knowledge/_index.json` — thêm partner hoặc product mới nếu chưa có. Không cần sửa index thủ công trừ khi muốn chỉnh `keywords`, `priority`, hoặc metadata khác.

> **Lưu ý:** Nếu `product_id` đã tồn tại trong index, script vẫn ghi đè JSON nhưng **không** cập nhật lại entry index (chỉ thêm khi product mới).

### 5. Validate

```bash
python3 scripts/validate_knowledge.py
```

CI deploy cũng dùng script này. Nên chạy trước khi commit.

### 6. Sync to frontend

```bash
bash scripts/sync_knowledge.sh
```

Copy knowledge sang `frontend/public/knowledge/` và tạo `manifest.json` cho Knowledge Browser. Bỏ qua bước này thì frontend không thấy file mới.

### 7. Test agent load

```bash
python3 -c "from main import load_knowledge_base; load_knowledge_base()"
```

Kỳ vọng output dạng: `✓ Loaded N FAQ entries from X partner(s)`

---

## CLI Reference

| Flag | Required | Default | Mô tả |
|------|----------|---------|-------|
| `--file` | Yes | — | Path tới file `.pdf` hoặc `.docx` |
| `--partner-id` | Yes | — | ID đối tác, lowercase không space (vd. `gic`, `baoviet`, `msig`) |
| `--partner-name` | Yes | — | Tên hiển thị |
| `--product-id` | Yes | — | ID sản phẩm, snake_case (vd. `credit_topup`) |
| `--product-name` | Yes | — | Tên sản phẩm hiển thị |
| `--category` | No | `health` | Category trong `_index.json` (`health`, `travel`, `financial`, …) |
| `--use-llm` | No | off | Bật LLM parsing (khuyến nghị) |
| `--output-dir` | No | `knowledge` | Thư mục knowledge gốc |

Xem thêm: `python3 scripts/import_partner_docs.py --help`

---

## Parsing Modes

### Mode 1: Manual Parsing (Basic)

**Pros**:
- Không cần LLM API key
- Nhanh (< 1s)
- Parse toàn bộ text (không bị giới hạn 8K)

**Cons**:
- Chỉ hỗ trợ format đơn giản:
  ```
  Q: Câu hỏi 1?
  A: Trả lời 1.
  
  Q: Câu hỏi 2?
  A: Trả lời 2.
  ```
- Ít user_questions variants (chỉ 1 variant)
- Phải manual edit sau

**Usage**:

```bash
python3 scripts/import_partner_docs.py \
  --file faq.docx \
  --partner-id msig \
  --partner-name "MSIG Việt Nam" \
  --product-id health_247 \
  --product-name "Bảo hiểm Sức khỏe 24/7"
```

### Mode 2: LLM Parsing (Recommended)

**Pros**:
- Xử lý được format phức tạp
- Tự động tạo nhiều user_questions variants
- Tự động phân loại category
- Hiểu context, merge duplicate questions

**Cons**:
- Cần LLM API key (GreenNode AI Platform hoặc OpenAI-compatible)
- Chậm hơn (30–60s tùy độ dài file)
- **Chỉ gửi ~8.000 ký tự đầu** của tài liệu vào LLM — file dài cần split hoặc dùng manual mode

**Setup**:

1. Set env vars trong `.env` (GreenNode Claw-a-thon):

   ```
   LLM_MODEL=google/gemma-4-31b-it
   LLM_BASE_URL=https://<your-greennode-endpoint>/v1
   LLM_API_KEY=<your-api-key>
   ```

   Các model BTC hỗ trợ: `qwen/qwen3-5-27b`, `google/gemma-4-31b-it`, `minimax/minimax-m2.5`

2. Run với flag `--use-llm`:

   ```bash
   python3 scripts/import_partner_docs.py \
     --file gic_faq.docx \
     --partner-id gic \
     --partner-name "GIC Insurance" \
     --product-id credit_topup \
     --product-name "Credit Topup Insurance" \
     --category financial \
     --use-llm
   ```

---

## Document Format Requirements

### Best Format (works well with both modes)

**Option 1: Q&A pairs**

```
Q: Bảo hiểm Sống tự tin là gì?
A: Bảo hiểm Sống tự tin được cung cấp bởi GIC...

Q: Quyền lợi bảo hiểm gồm những gì?
A: Quyền lợi chính bao gồm...
```

**Option 2: Numbered**

```
1. Bảo hiểm trễ chuyến bay là gì?
   Sản phẩm bảo vệ khi chuyến bay bị trễ...

2. Điều kiện tham gia là gì?
   Khách hàng mua qua Zalopay...
```

**Option 3: Heading + content** (LLM mode only)

```
# Giới thiệu

## Bảo hiểm MSIG Sức khỏe 24/7 là gì?
MSIG Sức khỏe 24/7 là sản phẩm...

## Quyền lợi bảo hiểm
Quyền lợi chính bao gồm:
- Nội trú
- Ngoại trú
```

### Supported but may need manual review

- Tabular format (LLM mode)
- Bullet points with implied questions
- Mixed Vietnamese/English
- Scanned PDFs (with OCR text layer)

### Not supported

- Image-only PDFs without text layer
- Tables as images
- Complex multi-column layouts
- Password-protected files

### File quá dài (LLM mode)

Script cắt text tại `text[:8000]` trước khi gửi LLM. Với tài liệu > ~8K ký tự:

1. Split thành nhiều file nhỏ, import từng phần rồi merge JSON thủ công
2. Hoặc dùng manual mode (parse hết text) rồi edit JSON
3. Hoặc import từng section (Giới thiệu, Quyền lợi, Bồi thường…) thành các lần chạy riêng

---

## Post-Processing (Recommended)

Sau khi import, nên review và edit JSON để cải thiện chất lượng:

### 1. Add more user_questions variants

```json
{
  "canonical_question": "Bảo hiểm Sống tự tin là gì?",
  "user_questions": [
    "Bảo hiểm Sống tự tin là gì?",
    "GIC Credit Topup là gì?",
    "Cho tôi hỏi về bảo hiểm GIC",
    "Bao hiem song tu tin la gi"
  ]
}
```

### 2. Improve categories

```json
{
  "category": "Giới thiệu"
}
```

Common categories:
- `Giới thiệu` / `Về sản phẩm`
- `Quyền lợi` / `Benefits`
- `Điều kiện tham gia`
- `Quy trình mua` / `Mua bảo hiểm`
- `Bồi thường` / `Claims`
- `Phí bảo hiểm` / `Pricing`

### 3. Add tags

```json
{
  "tags": ["gic", "financial", "credit topup"]
}
```

### 4. Set priority

```json
{
  "priority": 10
}
```

Default từ import script là `5`. Dùng `10` cho FAQ quan trọng (giới thiệu, mua hàng, hotline).

### 5. Link related FAQs

```json
{
  "id": "gic_credit_topup_001",
  "related_faq_ids": [
    "gic_credit_topup_002",
    "gic_credit_topup_005"
  ]
}
```

Sau khi chỉnh JSON, chạy lại validate + sync:

```bash
python3 scripts/validate_knowledge.py
bash scripts/sync_knowledge.sh
```

---

## Batch Import (Multiple Files)

Import nhiều files cùng lúc:

```bash
#!/bin/bash
# import_all_partners.sh

python3 scripts/import_partner_docs.py \
  --file docs/faq_msig.docx \
  --partner-id msig \
  --partner-name "MSIG Việt Nam" \
  --product-id health_247 \
  --product-name "Bảo hiểm Sức khỏe 24/7" \
  --category health \
  --use-llm

python3 scripts/import_partner_docs.py \
  --file docs/faq_gic.docx \
  --partner-id gic \
  --partner-name "GIC Insurance" \
  --product-id credit_topup \
  --product-name "Credit Topup Insurance" \
  --category financial \
  --use-llm

python3 scripts/import_partner_docs.py \
  --file docs/faq_baoviet.pdf \
  --partner-id baoviet \
  --partner-name "Bảo Việt Insurance" \
  --product-id flight_delay_cancel \
  --product-name "Bảo hiểm trễ và hủy chuyến bay" \
  --category travel \
  --use-llm

python3 scripts/validate_knowledge.py
bash scripts/sync_knowledge.sh
```

---

## Troubleshooting

### "No FAQs extracted"

**Cause**: File format không match với parser

**Solutions**:
1. Thử `--use-llm` mode
2. Kiểm tra file có text layer (dùng `pdftotext` để test)
3. Convert format về Q&A pairs đơn giản
4. Manual extract → paste vào text file

### "LLM not available"

**Cause**: Chưa cài `langchain-openai` hoặc chưa set API key trong `.env`

**Solutions**:

```bash
pip install -r requirements.txt
# Kiểm tra .env có LLM_MODEL, LLM_BASE_URL, LLM_API_KEY
```

### "python-docx not installed" / "PyPDF2 not installed"

**Cause**: Thiếu dependency parsing

**Solutions**:

```bash
pip install -r requirements-import.txt
```

### "JSON parsing error from LLM"

**Cause**: LLM trả về format không đúng

**Solutions**:
1. Thử lại (LLM đôi khi không ổn định)
2. Giảm độ dài file (split thành nhiều phần — nhớ giới hạn 8K chars)
3. Đổi model (vd. `google/gemma-4-31b-it` thay vì Qwen reasoning)
4. Dùng manual mode rồi edit sau

### Scanned PDF without text

**Cause**: PDF là ảnh scan, không có text layer

**Solutions**:
1. Dùng OCR tool: `ocrmypdf input.pdf output.pdf`
2. Hoặc manual copy-paste từ PDF viewer

### Frontend không hiển thị FAQ mới

**Cause**: Chưa sync knowledge sang `frontend/public/`

**Solutions**:

```bash
bash scripts/sync_knowledge.sh
```

---

## Examples

### Example 1: DOCX with Q&A format (GIC)

**Input** (`gic_faq.docx`):

```
Q: Bảo hiểm Sống tự tin là gì?
A: Bảo hiểm Sống tự tin được cung cấp bởi GIC...

Q: Mức phí bảo hiểm là bao nhiêu?
A: Phí từ ...
```

**Command**:

```bash
python3 scripts/import_partner_docs.py \
  --file gic_faq.docx \
  --partner-id gic \
  --partner-name "GIC Insurance" \
  --product-id credit_topup \
  --product-name "Credit Topup Insurance" \
  --category financial \
  --use-llm
```

**Output** (`knowledge/partners/gic_credit_topup.json`):

```json
{
  "product_id": "credit_topup",
  "partner_id": "gic",
  "faqs": [
    {
      "id": "gic_credit_topup_001",
      "canonical_question": "Bảo hiểm Sống tự tin là gì?",
      "user_questions": [
        "Bảo hiểm Sống tự tin là gì?",
        "GIC Credit Topup là gì?",
        "Cho tôi hỏi về bảo hiểm GIC"
      ],
      "answer": "Bảo hiểm Sống tự tin được cung cấp bởi GIC...",
      "category": "Giới thiệu"
    }
  ]
}
```

### Example 2: PDF with complex format (Bảo Việt)

**Input** (`baoviet_faq.pdf`): Mixed headings, bullets, tables

**Command**:

```bash
python3 scripts/import_partner_docs.py \
  --file baoviet_faq.pdf \
  --partner-id baoviet \
  --partner-name "Bảo Việt Insurance" \
  --product-id flight_delay_cancel \
  --product-name "Bảo hiểm trễ và hủy chuyến bay" \
  --category travel \
  --use-llm
```

**Output**: LLM tự động parse và structure hóa. Review JSON, validate, sync frontend.

---

## Best Practices

1. **Always use `--use-llm`** if possible (chính xác hơn nhiều), trừ file rất dài (>8K chars)
2. **Review output JSON** sau khi import
3. **Run validate + sync** trước mỗi commit: `validate_knowledge.py` → `sync_knowledge.sh`
4. **Add 5–10 user_questions variants** per FAQ
5. **Set proper priority** (10 for top FAQs)
6. **Link related FAQs** via `related_faq_ids`
7. **Consistent naming**:
   - `partner_id`: lowercase, no spaces (`gic`, `baoviet`, `msig`, `vbi`)
   - `product_id`: lowercase_underscore (`credit_topup`, `flight_delay_cancel`)
8. **Backup original files** trước khi xóa
9. **Split large docs** khi dùng LLM mode (giới hạn 8.000 ký tự)

---

## LLM Notes (GreenNode Platform)

| Model | Path | Ghi chú |
|-------|------|---------|
| Gemma 4 31B-IT | `google/gemma-4-31b-it` | Khuyến nghị cho import — nhanh, ít reasoning overhead |
| Qwen 3.5 27B | `qwen/qwen3-5-27b` | Có thinking mode, chậm hơn |
| MiniMax M2.5 | `minimax/minimax-m2.5` | Alternative |

Lấy API key tại [Model Browser](https://aiplatform.console.vngcloud.vn/models).

Với file lớn, ưu tiên split document thay vì dựa vào một lần gọi LLM duy nhất.

---

## Support

- Script issues: `python3 scripts/import_partner_docs.py --help`
- Knowledge schema: `knowledge/README.md`
- Validate errors: `python3 scripts/validate_knowledge.py`
- Can't parse: Try manual mode → edit JSON → validate → sync
