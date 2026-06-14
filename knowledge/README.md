# Knowledge Base - Multi-Partner FAQ Structure

Cấu trúc tổ chức FAQ cho nhiều đối tác bảo hiểm trên nền tảng Zalopay.

## Cấu trúc thư mục

```
knowledge/
├── _index.json                     # Metadata tổng (partners, products, categories)
├── partners/                       # FAQ riêng từng đối tác
│   ├── msig/
│   │   ├── health_247.json         # Bảo hiểm Sức khỏe 24/7
│   │   ├── travel_protect.json     # (Example) Bảo hiểm du lịch
│   │   └── car_insurance.json      # (Example) Bảo hiểm xe
│   ├── pvi/
│   │   └── health_premium.json     # (Example) Bảo hiểm PVI
│   └── bao_viet/
│       └── health_basic.json       # (Example) Bảo hiểm Bảo Việt
├── cross_product/                  # FAQ so sánh / chung
│   ├── comparisons.json            # So sánh giữa các sản phẩm
│   └── general_zalopay.json        # FAQ chung Zalopay
└── faq.json                        # (Legacy) Old format - dùng cho backward compat
```

## Schema

### `_index.json` - Metadata tổng

```json
{
  "version": "2.0",
  "last_updated": "2026-06-14",
  "partners": [
    {
      "partner_id": "msig",
      "partner_name": "MSIG Việt Nam",
      "active": true,
      "products": [
        {
          "product_id": "health_247",
          "product_name": "Bảo hiểm Sức khỏe 24/7",
          "category": "health",
          "file": "partners/msig/health_247.json",
          "priority": 10,
          "keywords": ["sức khỏe", "nội trú", "ngoại trú"]
        }
      ]
    }
  ],
  "categories": [
    {"id": "health", "name": "Bảo hiểm sức khỏe"},
    {"id": "car", "name": "Bảo hiểm xe cơ giới"},
    {"id": "travel", "name": "Bảo hiểm du lịch"}
  ]
}
```

### Product file - `partners/{partner_id}/{product_id}.json`

```json
{
  "product_id": "health_247",
  "partner_id": "msig",
  "product_name": "Bảo hiểm Sức khỏe 24/7",
  "partner_name": "MSIG Việt Nam",
  "version": "1.0",
  "last_updated": "2026-06-14",
  "faqs": [
    {
      "id": "msig_health_247_faq_001",
      "canonical_question": "Bảo hiểm Sức khỏe 24/7 là gì?",
      "user_questions": [
        "Ai phát hành bảo hiểm Sức khỏe 24/7?",
        "Bảo hiểm Sức khỏe 24/7 là gì?",
        "Gói Sức khỏe 24/7 là bảo hiểm gì?"
      ],
      "answer": "Sức khỏe 24/7 là sản phẩm...",
      "category": "Giới thiệu chung",
      "tags": ["sức khỏe", "msig", "nội trú"],
      "related_faq_ids": ["msig_health_247_faq_002"],
      "source": "FAQ_MSIG_2026.docx",
      "priority": 10
    }
  ]
}
```

## Workflow thêm đối tác mới

### Bước 1: Tạo file sản phẩm

```bash
mkdir -p knowledge/partners/pvi
```

Tạo file `knowledge/partners/pvi/health_premium.json`:

```json
{
  "product_id": "health_premium",
  "partner_id": "pvi",
  "product_name": "Bảo hiểm Sức khỏe PVI Care",
  "partner_name": "PVI Insurance",
  "version": "1.0",
  "last_updated": "2026-06-14",
  "faqs": [
    {
      "id": "pvi_health_premium_001",
      "canonical_question": "PVI Care là gì?",
      "user_questions": [
        "PVI Care là gì?",
        "Bảo hiểm PVI có những quyền lợi gì?"
      ],
      "answer": "PVI Care là sản phẩm bảo hiểm sức khỏe...",
      "category": "Giới thiệu",
      "tags": ["pvi", "sức khỏe"],
      "priority": 5
    }
  ]
}
```

### Bước 2: Cập nhật `_index.json`

Thêm partner mới vào `knowledge/_index.json`:

```json
{
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
  ]
}
```

### Bước 3: Test

```bash
source venv/bin/activate
python -c "from main import load_knowledge_base; load_knowledge_base()"
```

Kết quả mong đợi:
```
✓ Loaded XXX FAQ entries from 2 partner(s)
```

### Bước 4: Deploy

Restart agent hoặc deploy lên AgentBase Runtime.

## Migration từ format cũ

Nếu có file FAQ format cũ (array flat):

```bash
python scripts/migrate_faq.py
```

Script sẽ:
- Convert từ `knowledge/faq.json` (old) → `knowledge/partners/msig/health_247.json` (new)
- Tự động tạo `knowledge/_index.json`
- Backup file cũ (không xóa)

## Best Practices

### 1. Naming convention

- **Partner ID**: lowercase, no spaces (ví dụ: `msig`, `pvi`, `bao_viet`)
- **Product ID**: lowercase_underscore (ví dụ: `health_247`, `car_premium`)
- **FAQ ID**: `{partner_id}_{product_id}_{faq_number}` (ví dụ: `msig_health_247_001`)

### 2. Priority scoring

| Priority | Mô tả | Ví dụ |
|----------|-------|-------|
| 10 | Câu hỏi top, intro sản phẩm | "Sản phẩm X là gì?" |
| 8-9 | Quyền lợi chính, giá | "Tôi được bảo vệ gì?" |
| 5-7 | FAQ thông thường | "Quy trình bồi thường?" |
| 1-4 | Edge cases, niche | "Loại trừ gì?" |

### 3. User questions

- Thêm **nhiều variants** cho mỗi `user_questions[]`: formal, casual, typos, abbreviations
- Bao gồm cả câu hỏi có context: "Bảo hiểm MSIG có nội trú không?"
- Ví dụ:
  ```json
  "user_questions": [
    "Bảo hiểm Sức khỏe 24/7 là gì?",
    "Sức khỏe 24/7 là gì?",
    "BHSK 24/7 là gì?",
    "Gói MSIG là gì?",
    "Cho tôi hỏi về sản phẩm Sức khỏe 24/7"
  ]
  ```

### 4. Related FAQs

Sử dụng `related_faq_ids` để link giữa các FAQ liên quan:

```json
{
  "id": "msig_health_247_001",
  "canonical_question": "Sản phẩm là gì?",
  "related_faq_ids": [
    "msig_health_247_002",  // Quyền lợi
    "msig_health_247_010"   // Giá
  ]
}
```

## Troubleshooting

### FAQ không được load

1. Kiểm tra `_index.json` có đúng path không
2. Kiểm tra `active: true` cho partner
3. Kiểm tra JSON syntax (dùng jsonlint)

### Search không tìm thấy kết quả

1. Thêm nhiều `user_questions` variants
2. Giảm threshold trong `search_faq_fuzzy()` (mặc định 0.4)
3. Thêm tags/keywords phù hợp

### Duplicate results

- Kiểm tra không có duplicate trong `user_questions[]`
- Mỗi FAQ ID phải unique

## Advanced: Cross-product FAQs

Tạo file `knowledge/cross_product/comparisons.json` cho câu hỏi so sánh:

```json
{
  "faqs": [
    {
      "id": "compare_health_msig_pvi",
      "canonical_question": "So sánh bảo hiểm sức khỏe MSIG vs PVI?",
      "user_questions": [
        "So sánh MSIG và PVI?",
        "Nên mua MSIG hay PVI?",
        "Khác biệt giữa Sức khỏe 24/7 và PVI Care?"
      ],
      "answer": "**MSIG Sức khỏe 24/7:**\n- Ưu điểm: ...\n\n**PVI Care:**\n- Ưu điểm: ...",
      "category": "So sánh",
      "priority": 9,
      "scope": "all_partners"
    }
  ]
}
```

## Support

- Migration issues: chạy `python scripts/migrate_faq.py --help`
- Schema questions: xem examples trong `knowledge/partners/msig/`
- Agent không load: check logs khi start `python main.py`
