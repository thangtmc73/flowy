# Import Partner FAQs from PDF/DOCX

Hướng dẫn import tài liệu FAQ từ PDF hoặc DOCX của đối tác vào hệ thống.

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements-import.txt
```

Hoặc cài riêng lẻ:
```bash
pip install python-docx PyPDF2
```

### 2. Prepare your file

Hỗ trợ 2 định dạng:
- **DOCX**: Word documents (`.docx`)
- **PDF**: PDF files (`.pdf`)

### 3. Run import script

**Basic (manual parsing)**:
```bash
python scripts/import_partner_docs.py \
  --file /path/to/faq_pvi.docx \
  --partner-id pvi \
  --partner-name "PVI Insurance" \
  --product-id health_premium \
  --product-name "PVI Care"
```

**Recommended (with LLM parsing)**:
```bash
python scripts/import_partner_docs.py \
  --file /path/to/faq_pvi.docx \
  --partner-id pvi \
  --partner-name "PVI Insurance" \
  --product-id health_premium \
  --product-name "PVI Care" \
  --use-llm
```

### 4. Review output

Script tạo file tại: `knowledge/partners/{partner_id}/{product_id}.json`

### 5. Test

```bash
python -c "from main import load_knowledge_base; load_knowledge_base()"
```

---

## Parsing Modes

### Mode 1: Manual Parsing (Basic)

**Pros**:
- Không cần LLM API key
- Nhanh (< 1s)

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
python scripts/import_partner_docs.py \
  --file faq.docx \
  --partner-id pvi \
  --partner-name "PVI" \
  --product-id health \
  --product-name "PVI Care"
```

### Mode 2: LLM Parsing (Recommended)

**Pros**:
- Xử lý được format phức tạp
- Tự động tạo nhiều user_questions variants
- Tự động phân loại category
- Hiểu context, merge duplicate questions

**Cons**:
- Cần LLM API key (OpenAI hoặc compatible)
- Chậm hơn (30-60s tùy độ dài file)
- Tốn phí API (~$0.01-0.10 per file)

**Setup**:
1. Set env vars trong `.env`:
   ```
   LLM_MODEL=gpt-4
   LLM_BASE_URL=https://api.openai.com/v1
   LLM_API_KEY=sk-...
   ```

2. Run với flag `--use-llm`:
   ```bash
   python scripts/import_partner_docs.py \
     --file faq_pvi.docx \
     --partner-id pvi \
     --partner-name "PVI Insurance" \
     --product-id health_premium \
     --product-name "PVI Care" \
     --use-llm
   ```

---

## Document Format Requirements

### Best Format (works well with both modes)

**Option 1: Q&A pairs**
```
Q: Bảo hiểm PVI Care là gì?
A: PVI Care là sản phẩm bảo hiểm sức khỏe...

Q: Quyền lợi bảo hiểm gồm những gì?
A: Quyền lợi chính bao gồm: Nội trú, Ngoại trú...
```

**Option 2: Numbered**
```
1. Bảo hiểm PVI Care là gì?
   PVI Care là sản phẩm bảo hiểm sức khỏe...

2. Quyền lợi bảo hiểm gồm những gì?
   Quyền lợi chính bao gồm...
```

**Option 3: Heading + content** (LLM mode only)
```
# Giới thiệu

## Bảo hiểm PVI Care là gì?
PVI Care là sản phẩm bảo hiểm sức khỏe...

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

---

## Post-Processing (Recommended)

Sau khi import, nên review và edit JSON để cải thiện chất lượng:

### 1. Add more user_questions variants

```json
{
  "canonical_question": "Bảo hiểm PVI Care là gì?",
  "user_questions": [
    "Bảo hiểm PVI Care là gì?",
    "PVI Care là gì?",               // Thêm: Short form
    "Cho tôi hỏi về PVI Care",       // Thêm: Conversational
    "Gói bảo hiểm PVI là gì?",       // Thêm: Variant
    "Bao hiem PVI care la gi"        // Thêm: Typo
  ]
}
```

### 2. Improve categories

```json
{
  "category": "Giới thiệu"  // Thay vì "General"
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
  "tags": ["pvi", "sức khỏe", "nội trú", "ngoại trú"]
}
```

### 4. Set priority

```json
{
  "priority": 10  // For top FAQs (default: 5)
}
```

### 5. Link related FAQs

```json
{
  "id": "pvi_health_premium_001",
  "related_faq_ids": [
    "pvi_health_premium_002",  // Quyền lợi
    "pvi_health_premium_005"   // Pricing
  ]
}
```

---

## Batch Import (Multiple Files)

Import nhiều files cùng lúc:

```bash
#!/bin/bash
# import_all_partners.sh

python scripts/import_partner_docs.py \
  --file docs/faq_pvi.docx \
  --partner-id pvi \
  --partner-name "PVI Insurance" \
  --product-id health_premium \
  --product-name "PVI Care" \
  --use-llm

python scripts/import_partner_docs.py \
  --file docs/faq_bao_viet.pdf \
  --partner-id bao_viet \
  --partner-name "Bảo Việt" \
  --product-id health_basic \
  --product-name "Bảo Việt An Gia" \
  --use-llm

python scripts/import_partner_docs.py \
  --file docs/faq_generali.docx \
  --partner-id generali \
  --partner-name "Generali Vietnam" \
  --product-id health_360 \
  --product-name "Generali 360" \
  --use-llm
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

**Cause**: Chưa cài langchain hoặc chưa set API key

**Solutions**:
```bash
pip install langchain-openai
# Edit .env file với LLM_API_KEY
```

### "python-docx not installed"

**Cause**: Thiếu dependency

**Solutions**:
```bash
pip install python-docx
```

### "PyPDF2 not installed"

**Cause**: Thiếu dependency

**Solutions**:
```bash
pip install PyPDF2
```

### "JSON parsing error from LLM"

**Cause**: LLM trả về format không đúng

**Solutions**:
1. Thử lại (LLM đôi khi không ổn định)
2. Giảm độ dài file (split thành nhiều phần)
3. Dùng manual mode rồi edit sau

### Scanned PDF without text

**Cause**: PDF là ảnh scan, không có text layer

**Solutions**:
1. Dùng OCR tool: `ocrmypdf input.pdf output.pdf`
2. Hoặc manual copy-paste từ PDF viewer

---

## Examples

### Example 1: DOCX with Q&A format

**Input** (`faq_pvi.docx`):
```
Q: PVI Care là gì?
A: PVI Care là sản phẩm bảo hiểm sức khỏe toàn diện...

Q: Quyền lợi bảo hiểm gồm gì?
A: Nội trú, Ngoại trú, Telemed...
```

**Command**:
```bash
python scripts/import_partner_docs.py \
  --file faq_pvi.docx \
  --partner-id pvi \
  --partner-name "PVI Insurance" \
  --product-id health_premium \
  --product-name "PVI Care" \
  --use-llm
```

**Output** (`knowledge/partners/pvi/health_premium.json`):
```json
{
  "product_id": "health_premium",
  "partner_id": "pvi",
  "faqs": [
    {
      "id": "pvi_health_premium_001",
      "canonical_question": "PVI Care là gì?",
      "user_questions": [
        "PVI Care là gì?",
        "Bảo hiểm PVI Care là gì?",
        "Cho tôi hỏi về PVI Care"
      ],
      "answer": "PVI Care là sản phẩm bảo hiểm sức khỏe toàn diện...",
      "category": "Giới thiệu"
    }
  ]
}
```

### Example 2: PDF with complex format

**Input** (`faq_generali.pdf`): Mixed headings, bullets, tables

**Command**:
```bash
python scripts/import_partner_docs.py \
  --file faq_generali.pdf \
  --partner-id generali \
  --partner-name "Generali Vietnam" \
  --product-id health_360 \
  --product-name "Generali 360" \
  --category health \
  --use-llm
```

**Output**: LLM tự động parse và structure hóa

---

## Best Practices

1. **Always use `--use-llm`** if possible (chính xác hơn nhiều)
2. **Review output JSON** sau khi import
3. **Add 5-10 user_questions variants** per FAQ
4. **Set proper priority** (10 for top FAQs)
5. **Link related FAQs** via `related_faq_ids`
6. **Consistent naming**:
   - partner_id: lowercase, no spaces (`pvi`, `bao_viet`)
   - product_id: lowercase_underscore (`health_premium`)
7. **Backup original files** trước khi xóa

---

## API Usage & Cost

Nếu dùng OpenAI GPT-4 với `--use-llm`:

| File size | Tokens | Cost (USD) |
|-----------|--------|------------|
| 1-2 pages | ~2K    | $0.02      |
| 5-10 pages | ~8K   | $0.08      |
| 20-30 pages | ~20K | $0.20      |

Tips để tiết kiệm:
- Dùng GPT-3.5-turbo thay GPT-4 (rẻ hơn 10x)
- Split file lớn thành nhiều phần nhỏ
- Manual parsing cho format đơn giản

---

## Support

- Script issues: Check `scripts/import_partner_docs.py --help`
- Format questions: See examples above
- Can't parse: Try manual mode → edit JSON sau
