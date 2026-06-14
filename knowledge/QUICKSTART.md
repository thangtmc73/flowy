# Quick Start: Adding New Insurance Partner

Hướng dẫn nhanh thêm đối tác bảo hiểm mới vào hệ thống.

## Bước 1: Tạo file sản phẩm

Copy template và điền thông tin:

```bash
cd knowledge/partners
mkdir new_partner_id  # Ví dụ: pvi, bao_viet
cp TEMPLATE.json new_partner_id/product_name.json
```

Sửa file vừa tạo với thông tin đối tác:

```json
{
  "product_id": "health_premium",
  "partner_id": "pvi",
  "product_name": "PVI Care",
  "partner_name": "PVI Insurance",
  "version": "1.0",
  "last_updated": "2026-06-14",
  "faqs": [
    {
      "id": "pvi_health_premium_001",
      "canonical_question": "PVI Care là gì?",
      "user_questions": [
        "PVI Care là gì?",
        "Bảo hiểm sức khỏe PVI là gì?",
        "Cho tôi hỏi về PVI Care"
      ],
      "answer": "PVI Care là sản phẩm bảo hiểm...",
      "category": "Giới thiệu",
      "tags": ["pvi", "sức khỏe"],
      "priority": 10
    }
  ]
}
```

## Bước 2: Cập nhật _index.json

Thêm partner mới vào `knowledge/_index.json`:

```json
{
  "version": "2.0",
  "partners": [
    {
      "partner_id": "msig",
      "partner_name": "MSIG Việt Nam",
      "active": true,
      "products": [...]
    },
    {
      "partner_id": "pvi",
      "partner_name": "PVI Insurance",
      "active": true,
      "products": [
        {
          "product_id": "health_premium",
          "product_name": "PVI Care",
          "category": "health",
          "file": "partners/pvi/health_premium.json",
          "priority": 8,
          "keywords": ["pvi", "sức khỏe", "premium"]
        }
      ]
    }
  ],
  "categories": [...]
}
```

## Bước 3: Test

```bash
source venv/bin/activate
python -c "from main import load_knowledge_base; load_knowledge_base()"
```

Kết quả mong đợi:
```
✓ Loaded XXX FAQ entries from 2 partner(s)
```

## Bước 4: Update system prompt (optional)

Nếu muốn agent mention partner mới trong giới thiệu, sửa `main.py`:

```python
system_prompt=(
    "Sản phẩm hiện có:\n"
    "- Bảo hiểm Sức khỏe 24/7 (MSIG Việt Nam)\n"
    "- PVI Care (PVI Insurance)\n"  # <-- Thêm dòng này
)
```

## Bước 5: Deploy

### Local test:
```bash
python main.py
```

### Deploy to AgentBase:
```bash
./scripts/deploy_agentbase.sh
```

---

## Checklist khi thêm partner

- [ ] Tạo folder `knowledge/partners/{partner_id}/`
- [ ] Tạo file product JSON với >= 5 FAQs
- [ ] Mỗi FAQ có >= 3 user_questions variants
- [ ] Update `knowledge/_index.json` với partner mới
- [ ] Test loader: `load_knowledge_base()`
- [ ] Test query: curl với câu hỏi về partner mới
- [ ] (Optional) Update system prompt
- [ ] Deploy

---

## Troubleshooting

**FAQ không load?**
- Kiểm tra JSON syntax: `python -m json.tool knowledge/partners/pvi/health_premium.json`
- Kiểm tra path trong `_index.json` đúng chưa
- Kiểm tra `active: true` cho partner

**Search không tìm thấy?**
- Thêm nhiều variants trong `user_questions[]`
- Thêm keywords phù hợp vào `tags[]`
- Kiểm tra `priority` >= 5

**Cần help?**
- Xem docs: `knowledge/README.md`
- Xem example: `knowledge/partners/msig/health_247.json`
