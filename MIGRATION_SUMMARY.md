# Migration & Multi-Partner Update - Summary

## ✅ Completed Tasks

### 1. Created Multi-Partner Directory Structure
```
knowledge/
├── _index.json                     # Partner & product metadata
├── partners/
│   ├── msig/
│   │   └── health_247.json         # Migrated: 34 FAQs, 283 user questions
│   └── TEMPLATE.json               # Template for new partners
├── cross_product/
│   └── comparisons.json            # Cross-partner comparison FAQs
└── faq.json                        # (Legacy) Backward compatibility
```

### 2. Migration Script (`scripts/migrate_faq.py`)
- Converted old flat format → grouped by `canonical_question`
- **Input**: 283 entries (duplicated questions)
- **Output**: 34 FAQ groups with `user_questions[]` arrays
- Automatically generates `_index.json`

### 3. Updated Agent Code (`main.py`)
**New functions**:
- `load_knowledge_base()`: Loads multi-partner structure from `_index.json`
- `load_legacy_format()`: Fallback for old `faq.json` format
- `search_faq_fuzzy()`: Added `partner_filter` and `category_filter` parameters
- `search_faq_docs()` tool: Auto-detects partner context from query

**Updated system prompt**: Mentions multi-partner support (MSIG + future partners)

### 4. Documentation
- `knowledge/README.md`: Complete guide for adding partners, schema, best practices
- `knowledge/partners/TEMPLATE.json`: Template for new product files
- `knowledge/cross_product/comparisons.json`: Example comparison FAQ

## 🧪 Testing Results

### Test 1: Load knowledge base
```bash
python -c "from main import load_knowledge_base; load_knowledge_base()"
```
**Result**: ✓ Loaded 283 FAQ entries from 1 partner(s)

### Test 2: Agent query (single product)
```bash
curl -X POST http://127.0.0.1:8080/invocations \
  -d '{"message": "Bảo hiểm Sức khỏe 24/7 là gì?"}'
```
**Result**: ✓ Successfully returned detailed answer with partner info

### Test 3: Multi-partner comparison query
```bash
curl -X POST http://127.0.0.1:8080/invocations \
  -d '{"message": "So sánh bảo hiểm sức khỏe các hãng?"}'
```
**Result**: ✓ Returns comparison FAQ (now included in `cross_product/comparisons.json`)

## 📊 Current State

| Metric | Before | After |
|--------|--------|-------|
| **Partners** | 1 (hardcoded MSIG) | 1+ (extensible) |
| **Products** | 1 (Sức khỏe 24/7) | 1+ (add via JSON) |
| **FAQ Entries** | 283 (flat, duplicated) | 34 (grouped) |
| **User Questions** | 283 | 283 (preserved) |
| **Search Filters** | None | Partner, category |
| **Comparison FAQs** | ❌ Not supported | ✅ Supported |

## 🚀 Next Steps for Adding Partners

### Option 1: Manual (khuyến nghị cho người làm operations)

1. **Chuẩn bị dữ liệu FAQ**: Word/Excel/JSON file từ đối tác mới
2. **Tạo file sản phẩm**: Copy `knowledge/partners/TEMPLATE.json` → điền thông tin
3. **Cập nhật index**: Thêm partner vào `knowledge/_index.json`
4. **Test**: `python -c "from main import load_knowledge_base; load_knowledge_base()"`
5. **Deploy**: Restart agent hoặc redeploy

### Option 2: Script automation (cho bulk import)

Tạo script `scripts/import_partner_faq.py`:
```bash
python scripts/import_partner_faq.py \
  --partner "PVI" \
  --product "PVI Care" \
  --source "faq_pvi.docx"
```

## 🔧 Future Enhancements

### High Priority
1. **PDF/Link comparison tool**: So sánh FAQ từ link external với Zalopay products
2. **Semantic search**: Thay fuzzy matching bằng embedding search (FAISS/Chroma)
3. **Admin API**: REST endpoint để add/update/delete FAQs without restart

### Medium Priority
4. **Multi-language**: Support English FAQs
5. **FAQ analytics**: Track which FAQs are most searched
6. **Auto-categorization**: LLM tự động gán category/tags

### Low Priority
7. **FAQ versioning**: Track changes over time
8. **A/B testing**: Test different answer variants

## 📝 Schema Evolution

### Current (v2.0)
- Multi-partner support
- Grouped by `canonical_question`
- Filter by partner/category
- Cross-product FAQs

### Future (v3.0 - draft)
- Embedding vectors for semantic search
- Confidence scores from LLM
- User feedback loop (thumbs up/down)
- Dynamic FAQ ranking based on usage

## 🛠 Maintenance Guide

### Weekly
- Review agent logs for "FAQ not found" queries
- Add missing FAQs to appropriate partner file

### Monthly
- Audit duplicate FAQs across partners
- Update `related_faq_ids` for better navigation
- Check for outdated answers (regulatory changes)

### Quarterly
- Partner review: Remove inactive partners
- Performance tuning: Adjust `threshold` and `priority` values
- Schema migration if needed

## 📞 Support Contacts

- **Agent maintainer**: Your team
- **Partner onboarding**: Operations team
- **Schema questions**: See `knowledge/README.md`

---

## Quick Commands

```bash
# Migrate old FAQ
python scripts/migrate_faq.py

# Test loader
python -c "from main import load_knowledge_base; load_knowledge_base()"

# Start agent
source venv/bin/activate && python main.py

# Test query
curl -X POST http://127.0.0.1:8080/invocations \
  -H "Content-Type: application/json" \
  -H "X-GreenNode-AgentBase-User-Id: test" \
  -H "X-GreenNode-AgentBase-Session-Id: session1" \
  -d '{"message": "Bảo hiểm là gì?"}'
```

## Files Changed

- ✅ `main.py`: New loader + search functions
- ✅ `scripts/migrate_faq.py`: Migration script
- ✅ `knowledge/_index.json`: Partner metadata
- ✅ `knowledge/partners/msig/health_247.json`: Migrated MSIG FAQs
- ✅ `knowledge/partners/TEMPLATE.json`: Template for new partners
- ✅ `knowledge/cross_product/comparisons.json`: Comparison FAQs
- ✅ `knowledge/README.md`: Documentation
- ✅ `MIGRATION_SUMMARY.md`: This file

## Rollback Plan

If issues occur, rollback to old structure:

1. Restore old `main.py` from git: `git checkout HEAD~1 main.py`
2. Agent will auto-fallback to `knowledge/faq.json` (still exists)
3. No data loss - old file not deleted

---

**Status**: ✅ Ready for production

**Tested on**: Python 3.7, local environment

**Compatible with**: GreenNode AgentBase Runtime
