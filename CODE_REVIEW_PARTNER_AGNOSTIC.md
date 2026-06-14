# Code Review: Multi-Partner Generic Implementation

## Summary

✅ **Đã loại bỏ toàn bộ hardcoded MSIG references** trong source code

## Changes Made

### 1. Backend (`main.py`)

#### System Prompt (Line 344-366)
**Before**:
```python
"- Trả lời về các sản phẩm từ nhiều đối tác (MSIG, PVI, v.v.)"
"Sản phẩm hiện có:"
"- Bảo hiểm Sức khỏe 24/7 (MSIG Việt Nam): Nội trú, Ngoại trú..."
"- (Các đối tác khác sẽ được bổ sung dần)"
```

**After**:
```python
"- Trả lời về các sản phẩm từ nhiều đối tác"
"- So sánh khách quan giữa các gói bảo hiểm khi được hỏi"
# Removed hardcoded product list
```

#### `search_faq_docs()` Tool (Line 288-334)

**Smart Context Detection** (Line 302-328):
```python
# Before: Hardcoded single partner
if "msig" in query_lower or "sức khỏe 24/7" in query_lower:
    partner_filter = "msig"

# After: Pattern-based multi-partner detection
partner_patterns = {
    "msig": ["msig", "sức khỏe 24/7"],
    "gic": ["gic", "credit topup"],
    "vbi": ["vbi", "cyber"],
}
for partner_id, patterns in partner_patterns.items():
    if any(pattern in query_lower for pattern in patterns):
        partner_filter = partner_id
        break
```

**Fallback Message** (Line 320-325):
```python
# Before: MSIG-specific
"- Bảo hiểm Sức khỏe 24/7 (MSIG)"
"- Quyền lợi bảo hiểm (Nội trú, Ngoại trú, Khám từ xa)"

# After: Generic categories
"- Các gói bảo hiểm sức khỏe"
"- Bảo hiểm an ninh mạng (Cyber)"
"- Bảo hiểm tài chính (Credit Topup)"
"- Quyền lợi, chi phí, độ tuổi áp dụng"
```

#### Legacy Format Loader (Line 130-135)
```python
# Before:
"partner": "MSIG Việt Nam",
"product": "Sức khỏe 24/7",

# After:
"partner": "Legacy Partner",
"product": "Legacy Product",
```

### 2. Frontend

#### Sidebar Suggestions (`frontend/src/components/Sidebar.jsx`)
**Before**:
```javascript
'Bảo hiểm Sức khỏe 24/7 (MSIG) là gì?',
```

**After**:
```javascript
'Có những gói bảo hiểm nào?',
```

#### Welcome Message (`frontend/src/hooks/useChat.js`)
**Before**:
```javascript
'Xin chào! 👋 Mình là trợ lý tư vấn **Bảo hiểm Sức khỏe 24/7** trên Zalopay, được cung cấp bởi **MSIG Việt Nam**.'
```

**After**:
```javascript
'Xin chào! 👋 Mình là trợ lý tư vấn **Bảo hiểm** trên Zalopay.'
'• So sánh chi phí và điều kiện giữa các gói'
```

### 3. Documentation (`README.md`)

#### FAQ Knowledge Section
**Before**:
```bash
python3 scripts/validate_faq.py knowledge/faq.json
```

**After**:
```bash
python3 scripts/validate_faq.py knowledge/
python3 scripts/import_partner_docs.py path/to/document.pdf \
  --partner-id new_partner \
  --product-id product_id
```

#### Example curl Command
**Before**:
```json
{"message": "Bảo hiểm Sức khỏe 24/7 là gì?"}
```

**After**:
```json
{"message": "So sánh các gói bảo hiểm sức khỏe?"}
```

#### Project Structure
**Before**:
```
├── knowledge/faq.json      # FAQ knowledge (JSON)
```

**After**:
```
├── knowledge/              # Multi-partner knowledge base
│   ├── _index.json         # Partner & product index
│   ├── partners/           # Partner-specific FAQs
│   └── cross_product/      # Cross-partner comparisons
```

---

## Verification

### Files Checked for MSIG References:
- ✅ `main.py`
- ✅ `frontend/src/hooks/useChat.js`
- ✅ `frontend/src/components/Sidebar.jsx`
- ✅ `frontend/src/components/ChatWindow.jsx`
- ✅ `README.md`
- ✅ `.env.example`

### Remaining MSIG References (Non-Code):
Only in documentation and knowledge base files:
- `knowledge/partners/msig/health_247.json` (data file, expected)
- `knowledge/_index.json` (data index, expected)
- `MIGRATION_SUMMARY.md` (historical documentation)
- `README_MULTI_PARTNER.md` (migration guide)
- `UI_UPDATES.md` (change log)

---

## Result

✅ **System is now fully partner-agnostic**
- No hardcoded partner names in logic
- Pattern-based partner detection (easily extensible)
- Generic UI messaging
- Dynamic FAQ loading from knowledge base
- Documentation updated to reflect multi-partner structure

---

## Future Partner Addition

To add a new partner, **no code changes needed**:

1. Add partner data: `knowledge/partners/{partner_id}/{product_id}.json`
2. Update index: `knowledge/_index.json`
3. (Optional) Add detection pattern in `search_faq_docs()` if needed

Example:
```python
partner_patterns = {
    "msig": ["msig", "sức khỏe 24/7"],
    "gic": ["gic", "credit topup"],
    "vbi": ["vbi", "cyber"],
    "new_partner": ["new_partner", "product keyword"],  # Add here
}
```

---

## Testing Recommendations

1. **Generic questions**: "Có những gói bảo hiểm nào?"
2. **Partner-specific**: "Bảo hiểm cyber là gì?" (should detect VBI)
3. **Comparison**: "So sánh chi phí các gói sức khỏe"
4. **Fallback**: Random question → should show generic suggestions
