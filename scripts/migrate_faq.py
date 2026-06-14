#!/usr/bin/env python3
"""
Migration script: Convert old FAQ format to new multi-partner structure.

Old format: Array of {id, category, instruction, input, output}
New format: Grouped by product with canonical_question + user_questions[]
"""

import json
import sys
from pathlib import Path
from collections import defaultdict

def migrate_old_to_new(input_file, output_dir):
    """
    Migrate old FAQ format to new multi-partner structure.
    
    Args:
        input_file: Path to old faq.json
        output_dir: Directory for new structure (e.g., knowledge/partners/msig)
    """
    print(f"Loading old FAQ data from {input_file}...")
    with open(input_file, "r", encoding="utf-8") as f:
        old_data = json.load(f)
    
    print(f"Found {len(old_data)} entries in old format")
    
    # Group by id
    grouped = defaultdict(lambda: {
        "user_questions": [],
        "answer": None,
        "category": None,
        "source": None
    })
    
    for item in old_data:
        faq_id = item.get("id", "unknown")
        question = item.get("instruction", "").strip()
        
        if question:
            grouped[faq_id]["user_questions"].append(question)
        
        # Store answer and metadata from first occurrence
        if not grouped[faq_id]["answer"]:
            grouped[faq_id]["answer"] = item.get("output", "").strip()
            grouped[faq_id]["category"] = item.get("category", "General")
            grouped[faq_id]["source"] = item.get("source", "")
    
    print(f"Grouped into {len(grouped)} unique FAQ entries")
    
    # Generate new format
    new_faqs = []
    for faq_id, data in sorted(grouped.items()):
        if not data["answer"]:
            print(f"Warning: FAQ {faq_id} has no answer, skipping")
            continue
        
        # Use first question as canonical
        canonical = data["user_questions"][0] if data["user_questions"] else "Untitled"
        
        new_faqs.append({
            "id": f"msig_health_247_{faq_id}",
            "canonical_question": canonical,
            "user_questions": data["user_questions"],
            "answer": data["answer"],
            "category": data["category"],
            "tags": ["sức khỏe", "msig"],
            "related_faq_ids": [],
            "source": data["source"] or "migrated",
            "priority": 5
        })
    
    # Create product file
    output = {
        "product_id": "health_247",
        "partner_id": "msig",
        "product_name": "Bảo hiểm Sức khỏe 24/7",
        "partner_name": "MSIG Việt Nam",
        "version": "1.0",
        "last_updated": "2026-06-14",
        "faqs": new_faqs
    }
    
    # Write to new location
    output_path = Path(output_dir) / "health_247.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Migrated {len(new_faqs)} FAQ entries to {output_path}")
    
    # Create index file
    create_index_file(output_dir)
    
    return len(new_faqs)


def create_index_file(knowledge_base_dir):
    """Create _index.json file for the knowledge base."""
    index = {
        "version": "2.0",
        "last_updated": "2026-06-14",
        "partners": [
            {
                "partner_id": "msig",
                "partner_name": "MSIG Việt Nam",
                "active": True,
                "products": [
                    {
                        "product_id": "health_247",
                        "product_name": "Bảo hiểm Sức khỏe 24/7",
                        "category": "health",
                        "file": "partners/msig/health_247.json",
                        "priority": 10,
                        "keywords": ["sức khỏe", "nội trú", "ngoại trú", "telemed", "pharmacity", "whitecoat"]
                    }
                ]
            }
        ],
        "categories": [
            {"id": "health", "name": "Bảo hiểm sức khỏe"},
            {"id": "car", "name": "Bảo hiểm xe cơ giới"},
            {"id": "travel", "name": "Bảo hiểm du lịch"},
            {"id": "home", "name": "Bảo hiểm nhà ở"},
            {"id": "life", "name": "Bảo hiểm nhân thọ"}
        ]
    }
    
    # Write index to knowledge base root
    index_path = Path(knowledge_base_dir).parent / "_index.json"
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Created index file at {index_path}")


if __name__ == "__main__":
    # Default paths
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    
    old_faq_path = project_dir / "knowledge" / "faq.json"
    new_output_dir = project_dir / "knowledge" / "partners" / "msig"
    
    if not old_faq_path.exists():
        print(f"Error: Old FAQ file not found at {old_faq_path}")
        sys.exit(1)
    
    print("=" * 60)
    print("FAQ Migration Script - Old Format → New Multi-Partner Format")
    print("=" * 60)
    
    count = migrate_old_to_new(str(old_faq_path), str(new_output_dir))
    
    print("\n" + "=" * 60)
    print(f"✓ Migration completed successfully!")
    print(f"  Migrated: {count} FAQ entries")
    print(f"  Output: {new_output_dir}/health_247.json")
    print(f"  Index: {new_output_dir.parent.parent}/_index.json")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Review the migrated files in knowledge/partners/msig/")
    print("2. Update main.py to use the new loader")
    print("3. Test with: python main.py")
