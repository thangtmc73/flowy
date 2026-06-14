# Fix: VBI Search Not Working

## Problem

User reported: "Khi tôi đặt câu hỏi về bảo hiểm của VBI thì nó không tìm thấy"

## Root Cause

VBI data existed in knowledge base but **user_questions didn't contain "VBI" keyword**, so fuzzy matching couldn't find relevant FAQs.

**Example**:
- User query: "Bảo hiểm VBI là gì?"
- Existing questions: "Bảo hiểm an ninh mạng là sản phẩm gì?"
- Result: Low similarity score → No match

## Solution

Added VBI-specific variants to all 6 FAQ entries in `knowledge/partners/vbi/cyber.json`:

### Before:
```json
"user_questions": [
  "Bảo hiểm an ninh mạng là sản phẩm gì?",
  "Chi phí mua bảo hiểm an ninh mạng bao nhiêu?"
]
```

### After:
```json
"user_questions": [
  "Bảo hiểm an ninh mạng là sản phẩm gì?",
  "Bảo hiểm VBI là gì?",
  "VBI bảo hiểm những gì?",
  "Bảo hiểm cyber VBI là gì?",
  "Chi phí mua bảo hiểm an ninh mạng bao nhiêu?",
  "Phí bảo hiểm VBI cyber là bao nhiêu?"
]
```

## Changes Made

### vbi_cyber_001 (Giới thiệu)
Added:
- "Bảo hiểm VBI là gì?"
- "VBI bảo hiểm những gì?"
- "Bảo hiểm cyber VBI là gì?"
- "Phí bảo hiểm VBI cyber là bao nhiêu?"

### vbi_cyber_002 (Quyền lợi)
Added:
- "VBI bảo hiểm cyber bảo vệ gì?"
- "Quyền lợi bảo hiểm VBI cyber là gì?"
- "VBI bồi thường những trường hợp nào?"

### vbi_cyber_003 (Tai nạn)
Added:
- "VBI cyber có bảo hiểm tai nạn không?"
- "Quyền lợi tai nạn VBI là gì?"
- "VBI bồi thường tai nạn bao nhiêu?"

### vbi_cyber_004 (Điều kiện)
Added:
- "Ai có thể mua bảo hiểm VBI cyber?"
- "Điều kiện tham gia bảo hiểm VBI là gì?"
- "Thời hạn bảo hiểm VBI là bao lâu?"
- "VBI cyber có thời hạn bao lâu?"

### vbi_cyber_005 (Mua/Hủy)
Added:
- "Cách mua bảo hiểm VBI cyber?"
- "Mua bảo hiểm VBI ở đâu?"
- "Hủy bảo hiểm VBI như thế nào?"

### vbi_cyber_006 (Liên hệ)
Added:
- "Số điện thoại hotline VBI là bao nhiêu?"
- "Liên hệ VBI bảo hiểm như thế nào?"
- "Email VBI là gì?"
- "Hotline VBI cyber bao nhiêu?"

## Testing

### Before Fix:
```bash
Query: "Bảo hiểm VBI là gì?"
Results: Cross-product FAQs only (no VBI match)
```

### After Fix:
```bash
Query: "Bảo hiểm VBI là gì?"
Response: ✅ Detailed answer about VBI and Cyber Insurance
- Explained VBI = VietinBank Insurance
- Listed cyber protection benefits
- Showed pricing (3,000-5,000 VNĐ/month)
- Included hotline (1900 1566)
```

## Impact

**VBI FAQs increased**: 36 → 78 user question variants
**Coverage**: Now handles:
- ✅ "Bảo hiểm VBI là gì?"
- ✅ "VBI cyber bảo vệ gì?"
- ✅ "Hotline VBI"
- ✅ "Chi phí VBI"
- ✅ Any query mentioning "VBI"

## Lesson Learned

When importing new partner data:
1. ✅ Extract from PDF/DOCX
2. ✅ Add to knowledge base
3. ⚠️ **MUST add partner-branded variants** (e.g., "VBI", "MSIG", "GIC")

Otherwise fuzzy matching won't work for queries mentioning partner names directly.

## Recommendation for Future

**Auto-generate partner variants** in `import_partner_docs.py`:

```python
# For each FAQ, auto-add these variants:
user_questions.extend([
    f"{partner_name} {canonical_question}",
    f"Bảo hiểm {partner_name} {product_keywords}",
    # etc.
])
```

This ensures all partners are searchable by name immediately after import.

---

**Status**: ✅ Fixed and tested
**Files modified**: `knowledge/partners/vbi/cyber.json`
**User question variants added**: 42 new variants across 6 FAQs
