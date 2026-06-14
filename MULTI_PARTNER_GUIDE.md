# Multi-Partner Insurance Chatbot - Complete Guide

## Overview

This project has been upgraded from a single-partner (MSIG only) to a **multi-partner architecture**, supporting multiple insurance providers and products on the Zalopay platform.

### Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Structure** | Flat JSON array | Hierarchical (partners → products → FAQs) |
| **Partners** | 1 (MSIG hardcoded) | Unlimited (add via JSON) |
| **Products** | 1 (Health 24/7) | Unlimited per partner |
| **FAQ format** | Duplicate questions | Grouped by canonical + variants |
| **Comparison** | ❌ Not supported | ✅ Cross-product FAQs |
| **Search** | Basic fuzzy match | Fuzzy + partner filter + category |
| **Maintenance** | Edit 283 lines | Edit by product file |

---

## Directory Structure

```
knowledge/
├── _index.json                           # Metadata: partners, products, categories
├── partners/
│   ├── msig/
│   │   └── health_247.json               # 34 FAQs, 283 user questions
│   ├── gic/
│   │   └── credit_topup.json             # 12 FAQs, 96 user questions
│   ├── vbi/
│   │   └── cyber.json                    # 6 FAQs, 78 user questions
│   └── TEMPLATE.json                     # Template for new partners
├── cross_product/
│   ├── comparisons.json                  # Cross-partner comparisons
│   └── general_faqs.json                 # General FAQs (cost, age, exclusions)
├── README.md                             # Full documentation
├── QUICKSTART.md                         # Quick guide to add partner
└── faq.json                              # (Legacy) Backward compatibility
```

---

## Current Partners

| Partner | Product | FAQs | User Questions | Category |
|---------|---------|------|----------------|----------|
| **MSIG Việt Nam** | Bảo hiểm Sức khỏe 24/7 | 34 | 283 | Health |
| **GIC Insurance** | Credit Topup Insurance | 12 | 96 | Financial |
| **VBI Insurance** | Bảo hiểm Cyber | 6 | 78 | Cyber Security |

**Total**: 52 FAQs, 457 user question variants

---

## Use Cases Supported

### ✅ 1. Multiple Insurance Partners
```json
{
  "partners": [
    {"partner_id": "msig", "products": [...]},
    {"partner_id": "gic", "products": [...]},
    {"partner_id": "vbi", "products": [...]}
  ]
}
```

### ✅ 2. Diverse Question Phrasing
```json
"user_questions": [
  "Bảo hiểm VBI là gì?",
  "VBI bảo hiểm những gì?",
  "Bảo hiểm cyber VBI là gì?",
  "Phí bảo hiểm VBI cyber là bao nhiêu?"
]
```

### ✅ 3. Partner/Product-Specific FAQs
Each partner has dedicated FAQ files with detailed product information.

### ✅ 4. Cross-Product Comparisons
```json
{
  "canonical_question": "So sánh chi phí các gói bảo hiểm sức khỏe",
  "answer": "Comparison across MSIG, GIC, VBI..."
}
```

---

## Migration Summary

### 1. Data Migration
**Script**: `scripts/migrate_faq.py`

- **Input**: 283 flat FAQ entries (duplicated questions)
- **Output**: 34 grouped FAQs with `user_questions[]` arrays
- **Process**: Group by `canonical_question`, flatten `instruction` → `user_questions`

**Result**:
```
Before: 283 entries (many duplicates)
After:  34 unique FAQs with 283 user question variants
```

### 2. Code Updates (`main.py`)

**New Functions**:
- `load_knowledge_base()`: Loads multi-partner structure from `_index.json`
- `load_legacy_format()`: Fallback for old `faq.json` format
- `search_faq_fuzzy()`: Added `partner_filter` and `category_filter` parameters
- `search_faq_docs()` tool: Auto-detects partner context from query

**Updated System Prompt**: 
```python
"Bạn là trợ lý tư vấn bảo hiểm trên nền tảng Zalopay.
- Trả lời về các sản phẩm từ nhiều đối tác
- So sánh khách quan giữa các gói bảo hiểm khi được hỏi
..."
```

**Smart Context Detection**:
```python
partner_patterns = {
    "msig": ["msig", "sức khỏe 24/7"],
    "gic": ["gic", "credit topup"],
    "vbi": ["vbi", "cyber"],
}
```

### 3. UI Updates

**Sidebar**:
- Before: "Quyền lợi rõ ràng", "MSIG Việt Nam"
- After: "Đa dạng sản phẩm", "So sánh dễ dàng"

**Welcome Message**:
- Before: "Tư vấn Bảo hiểm Sức khỏe 24/7 từ MSIG"
- After: "Tư vấn Bảo hiểm trên Zalopay" (generic)

**Suggestions**:
```javascript
[
  'Chi phí bảo hiểm trên Zalopay là bao nhiêu?',
  'Có những gói bảo hiểm nào?',
  'So sánh các gói bảo hiểm sức khỏe?',
  // Cross-partner questions
]
```

---

## Testing Results

### Load Knowledge Base
```bash
python -c "from main import load_knowledge_base; load_knowledge_base()"
```
**Result**: ✓ Loaded 457 FAQ entries from 3 partner(s)

### Query Tests

**MSIG**:
```bash
curl -X POST http://127.0.0.1:8080/invocations \
  -d '{"message": "MSIG bảo hiểm sức khỏe 24/7 là gì?"}'
```
✅ Returns: MSIG Việt Nam, Bảo hiểm toàn diện: Nội trú + Ngoại trú + Telemed + Pharmacity

**GIC**:
```bash
curl -X POST http://127.0.0.1:8080/invocations \
  -d '{"message": "Bảo hiểm GIC là gì?"}'
```
✅ Returns: GIC là Tổng Công Ty Cổ Phần Bảo Hiểm Toàn Cầu, Bảo hiểm Sống tự tin

**VBI**:
```bash
curl -X POST http://127.0.0.1:8080/invocations \
  -d '{"message": "Bảo hiểm VBI là gì?"}'
```
✅ Returns: VBI là Tổng Công Ty CP Bảo Hiểm Ngân Hàng..., Bảo hiểm An ninh mạng (Cyber)

**Cross-Product Comparison**:
```bash
curl -X POST http://127.0.0.1:8080/invocations \
  -d '{"message": "So sánh chi phí các gói bảo hiểm sức khỏe"}'
```
✅ Returns: Detailed comparison across MSIG, GIC, VBI

---

## Adding New Partners

### Quick Method (Recommended)
Use the import script for PDF/DOCX documents:

```bash
python scripts/import_partner_docs.py \
  --file "/path/to/document.pdf" \
  --partner-id new_partner \
  --partner-name "Partner Name" \
  --product-id product_id \
  --product-name "Product Name" \
  --category health \
  --use-llm  # For better quality extraction
```

**Documentation**: See `docs/IMPORT_FROM_DOCS.md` for detailed guide

### Manual Method
1. Create product JSON: `knowledge/partners/{partner_id}/{product_id}.json`
2. Follow schema in `knowledge/partners/TEMPLATE.json`
3. Update `knowledge/_index.json`
4. **Important**: Add partner-branded user question variants:
   ```json
   "user_questions": [
     "Generic question",
     "{PARTNER_NAME} question variant",
     "{PRODUCT_NAME} question variant"
   ]
   ```

**Documentation**: See `knowledge/QUICKSTART.md` for step-by-step guide

---

## Key Learnings

### Problem: Partner-Branded Search
Users naturally ask:
- "Bảo hiểm VBI là gì?" ✅
- "Hotline GIC" ✅

But imported docs have generic questions:
- "Bảo hiểm an ninh mạng là gì?" ❌
- "Tổng đài dịch vụ hỗ trợ" ❌

### Solution: Auto-Add Partner Variants
When importing or creating FAQs, always include:
```python
user_questions = [
    # Generic
    "Original question from document",
    
    # Partner-branded
    f"{PARTNER_NAME} {question}",
    f"Bảo hiểm {PARTNER_NAME} {keywords}",
    
    # Product-branded
    f"{PRODUCT_NAME} là gì?",
    f"Quyền lợi {PRODUCT_NAME}?",
    
    # Shortcuts
    f"Hotline {PARTNER_NAME}",
    f"Chi phí {PRODUCT_NAME}",
]
```

---

## Architecture Benefits

### Scalability
- ✅ Add unlimited partners without code changes
- ✅ Each partner maintains separate FAQ files
- ✅ Cross-product FAQs for comparisons

### Maintainability
- ✅ Edit by product file instead of monolithic JSON
- ✅ Clear separation of concerns
- ✅ Easy to review/update specific products

### Search Quality
- ✅ Smart context detection (auto-filters by partner)
- ✅ Priority scoring for ranking
- ✅ Fuzzy matching with configurable threshold
- ✅ Support for multiple question variants

### Future Enhancements (Optional)
1. **Vector search**: Replace fuzzy matching with semantic embeddings
2. **Dynamic loading**: Load partner data from external API
3. **A/B testing**: Track which partners users ask about most
4. **Analytics**: Partner-specific query metrics

---

## Files Modified

### Core
- ✅ `main.py` - Multi-partner loading + search logic
- ✅ `knowledge/_index.json` - Partner metadata
- ✅ `knowledge/partners/*/` - Partner-specific FAQs

### UI
- ✅ `frontend/src/App.jsx` - Conditional suggestions
- ✅ `frontend/src/components/Sidebar.jsx` - Generic highlights
- ✅ `frontend/src/components/ChatWindow.jsx` - Generic welcome
- ✅ `frontend/src/hooks/useChat.js` - Generic initial message
- ✅ `frontend/index.html` - Generic page title

### Scripts
- ✅ `scripts/migrate_faq.py` - Migration from old format
- ✅ `scripts/import_partner_docs.py` - Import from PDF/DOCX

### Documentation
- ✅ `knowledge/README.md` - Knowledge base guide
- ✅ `knowledge/QUICKSTART.md` - Quick add partner guide
- ✅ `docs/IMPORT_FROM_DOCS.md` - Import documentation
- ✅ `README.md` - Updated main README

---

## Quick Reference

### Check Loaded Data
```bash
python -c "from main import load_knowledge_base, FAQ_ALL_ENTRIES; load_knowledge_base(); print(f'Total: {len(FAQ_ALL_ENTRIES)} FAQs')"
```

### Test Specific Partner
```bash
curl -X POST http://127.0.0.1:8080/invocations \
  -H "Content-Type: application/json" \
  -H "X-GreenNode-AgentBase-User-Id: test-user" \
  -H "X-GreenNode-AgentBase-Session-Id: test-session" \
  -d '{"message": "YOUR_QUESTION_HERE"}'
```

### Validate FAQ Structure
```bash
python scripts/validate_faq.py knowledge/
```

### Add New Partner (LLM mode)
```bash
python scripts/import_partner_docs.py \
  --file "/path/to/doc.pdf" \
  --partner-id partner_id \
  --partner-name "Partner Name" \
  --product-id product_id \
  --product-name "Product Name" \
  --use-llm
```

---

**Status**: ✅ Production Ready  
**Last Updated**: June 14, 2026  
**Version**: 2.0
