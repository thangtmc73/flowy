#!/usr/bin/env python3
"""Validate multi-partner knowledge base structure before deploy."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def validate_index(index_path: Path) -> list[str]:
    """Validate _index.json structure."""
    errors: list[str] = []

    if not index_path.exists():
        return [f"Index file not found: {index_path}"]

    try:
        data = json.loads(index_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [f"Invalid JSON in {index_path}: {exc}"]

    if not isinstance(data, dict):
        return [f"{index_path}: root must be an object"]

    partners = data.get("partners")
    if not isinstance(partners, list):
        return [f"{index_path}: 'partners' must be an array"]

    if not partners:
        errors.append(f"{index_path}: 'partners' is empty")

    for idx, partner_info in enumerate(partners):
        prefix = f"{index_path} partner #{idx}"
        
        if not isinstance(partner_info, dict):
            errors.append(f"{prefix}: must be an object")
            continue

        partner_id = partner_info.get("partner_id")
        if not partner_id or not isinstance(partner_id, str):
            errors.append(f"{prefix}: missing or invalid 'partner_id'")

        if "partner_name" not in partner_info:
            errors.append(f"{prefix}: missing 'partner_name'")

        products = partner_info.get("products")
        if not isinstance(products, list):
            errors.append(f"{prefix}: 'products' must be an array")
            continue

        if not products:
            errors.append(f"{prefix}: 'products' is empty")

        for prod_idx, product_info in enumerate(products):
            prod_prefix = f"{prefix} product #{prod_idx}"
            
            if not isinstance(product_info, dict):
                errors.append(f"{prod_prefix}: must be an object")
                continue

            if "product_id" not in product_info:
                errors.append(f"{prod_prefix}: missing 'product_id'")

            if "product_name" not in product_info:
                errors.append(f"{prod_prefix}: missing 'product_name'")

            if "file" not in product_info:
                errors.append(f"{prod_prefix}: missing 'file'")

    return errors


def validate_product_file(file_path: Path, require_metadata: bool = True) -> list[str]:
    """Validate a product FAQ JSON file."""
    errors: list[str] = []

    if not file_path.exists():
        return [f"Product file not found: {file_path}"]

    try:
        data = json.loads(file_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [f"Invalid JSON in {file_path}: {exc}"]

    if not isinstance(data, dict):
        return [f"{file_path}: root must be an object"]

    # Check metadata (optional for cross-product files)
    if require_metadata:
        partner_id = data.get("partner_id")
        if not partner_id or not isinstance(partner_id, str):
            errors.append(f"{file_path}: missing or invalid 'partner_id'")

        product_id = data.get("product_id")
        if not product_id or not isinstance(product_id, str):
            errors.append(f"{file_path}: missing or invalid 'product_id'")

    # Check FAQs
    faqs = data.get("faqs")
    if not isinstance(faqs, list):
        return errors + [f"{file_path}: 'faqs' must be an array"]

    if not faqs:
        errors.append(f"{file_path}: 'faqs' array is empty")

    for idx, faq in enumerate(faqs):
        prefix = f"{file_path} FAQ #{idx}"

        if not isinstance(faq, dict):
            errors.append(f"{prefix}: must be an object")
            continue

        # Required fields
        canonical = faq.get("canonical_question")
        if not canonical or not isinstance(canonical, str):
            errors.append(f"{prefix}: missing or invalid 'canonical_question'")

        answer = faq.get("answer")
        if not answer or not isinstance(answer, str):
            errors.append(f"{prefix}: missing or invalid 'answer'")

        # User questions
        user_qs = faq.get("user_questions")
        if not isinstance(user_qs, list):
            errors.append(f"{prefix}: 'user_questions' must be an array")
        elif not user_qs:
            errors.append(f"{prefix}: 'user_questions' array is empty")

    return errors


def main() -> int:
    knowledge_dir = Path("knowledge")

    if not knowledge_dir.exists():
        print("ERROR: knowledge/ directory not found")
        return 1

    all_errors: list[str] = []

    # Validate _index.json
    index_path = knowledge_dir / "_index.json"
    print(f"Validating {index_path}...")
    index_errors = validate_index(index_path)
    all_errors.extend(index_errors)

    if index_errors:
        print("  ❌ Index validation failed")
    else:
        print("  ✅ Index validation passed")

        # Load index to find product files
        try:
            index_data = json.loads(index_path.read_text(encoding="utf-8"))
            partners = index_data.get("partners", [])

            # Validate each product file
            for partner_info in partners:
                products = partner_info.get("products", [])
                for product_info in products:
                    product_file = product_info.get("file")
                    if not product_file:
                        continue

                    product_path = knowledge_dir / product_file
                    print(f"Validating {product_path}...")
                    product_errors = validate_product_file(product_path, require_metadata=True)
                    all_errors.extend(product_errors)

                    if product_errors:
                        print(f"  ❌ Product validation failed")
                    else:
                        # Count FAQs
                        data = json.loads(product_path.read_text(encoding="utf-8"))
                        faq_count = len(data.get("faqs", []))
                        print(f"  ✅ Product validation passed ({faq_count} FAQs)")
        except Exception as exc:
            all_errors.append(f"Error processing index: {exc}")

    # Check for cross-product FAQs (optional, no metadata required)
    cross_product_dir = knowledge_dir / "cross_product"
    if cross_product_dir.exists():
        print(f"\nValidating cross-product FAQs in {cross_product_dir}...")
        for cross_file in cross_product_dir.glob("*.json"):
            cross_errors = validate_product_file(cross_file, require_metadata=False)
            all_errors.extend(cross_errors)
            if cross_errors:
                print(f"  ❌ {cross_file.name} validation failed")
            else:
                data = json.loads(cross_file.read_text(encoding="utf-8"))
                faq_count = len(data.get("faqs", []))
                print(f"  ✅ {cross_file.name} validation passed ({faq_count} FAQs)")

    # Summary
    print("\n" + "=" * 60)
    if all_errors:
        print("❌ VALIDATION FAILED")
        print("\nErrors:")
        for error in all_errors:
            print(f"  - {error}")
        return 1

    print("✅ ALL VALIDATIONS PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
