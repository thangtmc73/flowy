#!/usr/bin/env python3
"""
Import partner FAQ from PDF/DOCX files into multi-partner JSON format.

Usage:
    python scripts/import_partner_docs.py \
        --file faq_pvi.docx \
        --partner-id pvi \
        --partner-name "PVI Insurance" \
        --product-id health_premium \
        --product-name "PVI Care"

Requirements:
    pip install python-docx PyPDF2 langchain-openai
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import List, Dict
import re

# Document parsers
try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    print("Warning: python-docx not installed. DOCX support disabled.")

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("Warning: PyPDF2 not installed. PDF support disabled.")

# LLM for parsing (optional but recommended)
try:
    from langchain_openai import ChatOpenAI
    from dotenv import load_dotenv
    load_dotenv()
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    print("Warning: LangChain not installed. Manual parsing mode only.")


def extract_text_from_docx(file_path):
    """Extract text from DOCX file."""
    if not DOCX_AVAILABLE:
        raise RuntimeError("python-docx not installed. Run: pip install python-docx")
    
    doc = Document(file_path)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text


def extract_text_from_pdf(file_path):
    """Extract text from PDF file."""
    if not PDF_AVAILABLE:
        raise RuntimeError("PyPDF2 not installed. Run: pip install PyPDF2")
    
    text = ""
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    return text


def extract_text(file_path):
    """Extract text from PDF or DOCX file."""
    file_path = Path(file_path)
    ext = file_path.suffix.lower()
    
    if ext == '.docx':
        return extract_text_from_docx(file_path)
    elif ext == '.pdf':
        return extract_text_from_pdf(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}. Use .pdf or .docx")


def parse_faqs_with_llm(text, partner_id, product_id):
    """
    Parse FAQ text using LLM to extract Q&A pairs.
    
    Returns list of FAQ dicts with canonical_question, user_questions, answer.
    """
    if not LLM_AVAILABLE:
        raise RuntimeError("LangChain not installed. Run: pip install langchain-openai")
    
    llm = ChatOpenAI(
        model=os.environ.get("LLM_MODEL", "gpt-4"),
        base_url=os.environ.get("LLM_BASE_URL"),
        api_key=os.environ.get("LLM_API_KEY"),
        temperature=0
    )
    
    prompt = f"""Bạn là chuyên gia xử lý tài liệu FAQ bảo hiểm.

Nhiệm vụ: Trích xuất các cặp câu hỏi-trả lời từ tài liệu FAQ dưới đây thành JSON format.

Yêu cầu:
1. Mỗi FAQ gồm:
   - canonical_question: Câu hỏi chính, rõ ràng nhất
   - user_questions: Array các cách hỏi khác nhau (tối thiểu 3 variants)
   - answer: Câu trả lời đầy đủ, giữ nguyên format
   - category: Phân loại (Giới thiệu, Quyền lợi, Bồi thường, etc.)

2. Format JSON:
```json
[
  {{
    "canonical_question": "...",
    "user_questions": ["...", "...", "..."],
    "answer": "...",
    "category": "..."
  }}
]
```

3. Lưu ý:
   - Giữ nguyên nội dung trả lời, đừng tóm tắt
   - Thêm nhiều variants cho user_questions (formal, casual, typo)
   - Nếu có nhiều câu hỏi giống nhau, gộp lại thành 1 FAQ
   - Category phổ biến: "Giới thiệu", "Quyền lợi", "Điều kiện", "Quy trình mua", "Bồi thường"

Tài liệu FAQ:
---
{text[:8000]}
---

Trả về JSON array của các FAQ:"""

    print("Đang parse FAQ với LLM... (có thể mất 30-60s)")
    response = llm.invoke(prompt)
    
    # Extract JSON from response
    content = response.content
    
    # Try to find JSON array in response
    json_match = re.search(r'\[[\s\S]*\]', content)
    if json_match:
        json_str = json_match.group(0)
        faqs = json.loads(json_str)
        return faqs
    else:
        raise ValueError("LLM không trả về JSON hợp lệ. Thử lại hoặc dùng manual mode.")


def parse_faqs_manual(text, partner_id, product_id):
    """
    Manual parsing mode - extract simple Q&A patterns.
    
    This is a basic regex-based parser. Works for simple formats like:
    Q: Question here?
    A: Answer here.
    
    For complex formats, use LLM mode instead.
    """
    print("Manual parsing mode (basic regex). Khuyến nghị dùng --use-llm để chính xác hơn.")
    
    faqs = []
    
    # Pattern 1: "Q:" or "Câu hỏi:" followed by "A:" or "Trả lời:"
    pattern1 = r'(?:Q:|Câu hỏi:|Question:)\s*(.+?)\s*(?:A:|Trả lời:|Answer:)\s*(.+?)(?=(?:Q:|Câu hỏi:|Question:)|$)'
    matches1 = re.findall(pattern1, text, re.IGNORECASE | re.DOTALL)
    
    for i, (question, answer) in enumerate(matches1, 1):
        faqs.append({
            "canonical_question": question.strip(),
            "user_questions": [question.strip()],
            "answer": answer.strip(),
            "category": "General"
        })
    
    # Pattern 2: Numbered questions "1. " or "1) "
    if not faqs:
        pattern2 = r'\d+[\.)]\s*(.+?)\n(.+?)(?=\d+[\.)]|$)'
        matches2 = re.findall(pattern2, text, re.DOTALL)
        
        for i, (question, answer) in enumerate(matches2, 1):
            if len(question) < 150:  # Likely a question if short
                faqs.append({
                    "canonical_question": question.strip(),
                    "user_questions": [question.strip()],
                    "answer": answer.strip(),
                    "category": "General"
                })
    
    if not faqs:
        print("Warning: Không tìm thấy FAQ pattern nào. Thử:")
        print("1. Dùng --use-llm để parse thông minh hơn")
        print("2. Kiểm tra format của file input")
        print("3. Manual edit output JSON sau")
    
    return faqs


def create_product_json(faqs, partner_id, partner_name, product_id, product_name, source_file):
    """Create product JSON structure with FAQs."""
    product_json = {
        "product_id": product_id,
        "partner_id": partner_id,
        "product_name": product_name,
        "partner_name": partner_name,
        "version": "1.0",
        "last_updated": "2026-06-14",
        "faqs": []
    }
    
    for i, faq in enumerate(faqs, 1):
        faq_id = f"{partner_id}_{product_id}_{str(i).zfill(3)}"
        
        product_json["faqs"].append({
            "id": faq_id,
            "canonical_question": faq.get("canonical_question", ""),
            "user_questions": faq.get("user_questions", []),
            "answer": faq.get("answer", ""),
            "category": faq.get("category", "General"),
            "tags": [partner_id, "imported"],
            "related_faq_ids": [],
            "source": Path(source_file).name,
            "priority": 5
        })
    
    return product_json


def update_index_file(knowledge_dir, partner_id, partner_name, product_id, product_name, category="health"):
    """Update or create _index.json with new partner/product."""
    index_path = Path(knowledge_dir) / "_index.json"
    
    if index_path.exists():
        with open(index_path, "r", encoding="utf-8") as f:
            index = json.load(f)
    else:
        index = {
            "version": "2.0",
            "last_updated": "2026-06-14",
            "partners": [],
            "categories": [
                {"id": "health", "name": "Bảo hiểm sức khỏe"},
                {"id": "car", "name": "Bảo hiểm xe cơ giới"},
                {"id": "travel", "name": "Bảo hiểm du lịch"},
                {"id": "home", "name": "Bảo hiểm nhà ở"},
                {"id": "life", "name": "Bảo hiểm nhân thọ"}
            ]
        }
    
    # Find or create partner
    partner = None
    for p in index["partners"]:
        if p["partner_id"] == partner_id:
            partner = p
            break
    
    if not partner:
        partner = {
            "partner_id": partner_id,
            "partner_name": partner_name,
            "active": True,
            "products": []
        }
        index["partners"].append(partner)
    
    # Add product if not exists
    product_exists = any(p["product_id"] == product_id for p in partner["products"])
    if not product_exists:
        partner["products"].append({
            "product_id": product_id,
            "product_name": product_name,
            "category": category,
            "file": f"partners/{partner_id}_{product_id}.json",
            "priority": 8,
            "keywords": [partner_id, category, "imported"]
        })
    
    # Write back
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Updated {index_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Import partner FAQ from PDF/DOCX into multi-partner JSON format"
    )
    parser.add_argument("--file", required=True, help="Path to PDF or DOCX file")
    parser.add_argument("--partner-id", required=True, help="Partner ID (e.g., pvi, bao_viet)")
    parser.add_argument("--partner-name", required=True, help="Partner display name (e.g., 'PVI Insurance')")
    parser.add_argument("--product-id", required=True, help="Product ID (e.g., health_premium)")
    parser.add_argument("--product-name", required=True, help="Product display name (e.g., 'PVI Care')")
    parser.add_argument("--category", default="health", help="Product category (default: health)")
    parser.add_argument("--use-llm", action="store_true", help="Use LLM for intelligent parsing (recommended)")
    parser.add_argument("--output-dir", default="knowledge", help="Output directory (default: knowledge)")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("Partner FAQ Import Tool")
    print("=" * 60)
    
    # Validate file
    if not Path(args.file).exists():
        print(f"Error: File not found: {args.file}")
        sys.exit(1)
    
    # Extract text
    print(f"\n1. Extracting text from {args.file}...")
    try:
        text = extract_text(args.file)
        print(f"   ✓ Extracted {len(text)} characters")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        sys.exit(1)
    
    # Parse FAQs
    print(f"\n2. Parsing FAQs...")
    try:
        if args.use_llm:
            if not LLM_AVAILABLE:
                print("   ✗ LLM not available. Install: pip install langchain-openai")
                print("   Falling back to manual parsing...")
                faqs = parse_faqs_manual(text, args.partner_id, args.product_id)
            else:
                faqs = parse_faqs_with_llm(text, args.partner_id, args.product_id)
        else:
            faqs = parse_faqs_manual(text, args.partner_id, args.product_id)
        
        print(f"   ✓ Parsed {len(faqs)} FAQs")
    except Exception as e:
        print(f"   ✗ Error: {e}")
        sys.exit(1)
    
    if not faqs:
        print("\n⚠ No FAQs extracted. Check your file format or try --use-llm")
        sys.exit(1)
    
    # Create product JSON
    print(f"\n3. Creating product JSON...")
    product_json = create_product_json(
        faqs, 
        args.partner_id, 
        args.partner_name, 
        args.product_id, 
        args.product_name,
        args.file
    )
    
    # Write product file
    output_dir = Path(args.output_dir) / "partners"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"{args.partner_id}_{args.product_id}.json"
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(product_json, f, ensure_ascii=False, indent=2)
    
    print(f"   ✓ Written to {output_file}")
    
    # Update index
    print(f"\n4. Updating index...")
    update_index_file(
        args.output_dir,
        args.partner_id,
        args.partner_name,
        args.product_id,
        args.product_name,
        args.category
    )
    
    # Summary
    print("\n" + "=" * 60)
    print("✓ Import completed successfully!")
    print("=" * 60)
    print(f"Partner:  {args.partner_name} ({args.partner_id})")
    print(f"Product:  {args.product_name} ({args.product_id})")
    print(f"FAQs:     {len(faqs)}")
    print(f"Output:   {output_file}")
    print("\nNext steps:")
    print("1. Review the generated JSON file")
    print("2. Edit/add more user_questions variants if needed")
    print("3. Test: python -c \"from main import load_knowledge_base; load_knowledge_base()\"")
    print("4. Deploy!")


if __name__ == "__main__":
    main()
