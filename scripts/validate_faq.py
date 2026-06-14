#!/usr/bin/env python3
"""Validate FAQ knowledge JSON before deploy."""

from __future__ import annotations

import json
import sys
from pathlib import Path

# Legacy format fields (instruction/output)
LEGACY_REQUIRED_FIELDS = ("instruction", "output", "category")

# New format fields (canonical_question/answer)
NEW_FAQ_REQUIRED_FIELDS = ("id", "canonical_question", "user_questions", "answer", "category")


def validate_legacy_faq(data: list) -> list[str]:
    """Validate legacy FAQ format (instruction/output/category)."""
    errors: list[str] = []

    for index, item in enumerate(data):
        prefix = f"Entry #{index}"
        if not isinstance(item, dict):
            errors.append(f"{prefix}: must be an object")
            continue

        for field in LEGACY_REQUIRED_FIELDS:
            value = item.get(field)
            if value is None:
                errors.append(f"{prefix}: missing required field '{field}'")
            elif not isinstance(value, str) or not value.strip():
                errors.append(f"{prefix}: '{field}' must be a non-empty string")

        item_id = item.get("id")
        if item_id is not None and not isinstance(item_id, str):
            errors.append(f"{prefix}: 'id' must be a string when provided")

        item_input = item.get("input")
        if item_input is not None and not isinstance(item_input, str):
            errors.append(f"{prefix}: 'input' must be a string when provided")

    return errors


def validate_new_faq_entry(faq: dict, index: int) -> list[str]:
    """Validate a single FAQ entry in new format."""
    errors: list[str] = []
    prefix = f"FAQ #{index}"

    if not isinstance(faq, dict):
        return [f"{prefix}: must be an object"]

    for field in NEW_FAQ_REQUIRED_FIELDS:
        value = faq.get(field)
        if value is None:
            errors.append(f"{prefix}: missing required field '{field}'")
        elif field == "user_questions":
            if not isinstance(value, list) or not value:
                errors.append(f"{prefix}: 'user_questions' must be a non-empty array")
            elif not all(isinstance(q, str) and q.strip() for q in value):
                errors.append(f"{prefix}: all items in 'user_questions' must be non-empty strings")
        elif not isinstance(value, str) or not value.strip():
            errors.append(f"{prefix}: '{field}' must be a non-empty string")

    tags = faq.get("tags")
    if tags is not None:
        if not isinstance(tags, list):
            errors.append(f"{prefix}: 'tags' must be an array")
        elif not all(isinstance(t, str) for t in tags):
            errors.append(f"{prefix}: all items in 'tags' must be strings")

    priority = faq.get("priority")
    if priority is not None and not isinstance(priority, (int, float)):
        errors.append(f"{prefix}: 'priority' must be a number")

    related_faq_ids = faq.get("related_faq_ids")
    if related_faq_ids is not None:
        if not isinstance(related_faq_ids, list):
            errors.append(f"{prefix}: 'related_faq_ids' must be an array")
        elif not all(isinstance(id, str) for id in related_faq_ids):
            errors.append(f"{prefix}: all items in 'related_faq_ids' must be strings")

    return errors


def validate_product_file(data: dict) -> list[str]:
    """Validate product knowledge file (partners/*/product.json)."""
    errors: list[str] = []

    required_top_fields = ("product_id", "partner_id", "product_name", "partner_name", "faqs")
    for field in required_top_fields:
        value = data.get(field)
        if value is None:
            errors.append(f"Missing required field '{field}'")
        elif field == "faqs":
            if not isinstance(value, list):
                errors.append("'faqs' must be an array")
        elif not isinstance(value, str) or not value.strip():
            errors.append(f"'{field}' must be a non-empty string")

    if "faqs" in data and isinstance(data["faqs"], list):
        if not data["faqs"]:
            errors.append("'faqs' array must not be empty")
        else:
            for index, faq in enumerate(data["faqs"]):
                errors.extend(validate_new_faq_entry(faq, index))

    return errors


def validate_cross_product_file(data: dict) -> list[str]:
    """Validate cross-product knowledge file (cross_product/*.json)."""
    errors: list[str] = []

    if "faqs" not in data:
        return ["Missing required field 'faqs'"]

    faqs = data["faqs"]
    if not isinstance(faqs, list):
        return ["'faqs' must be an array"]

    if not faqs:
        return ["'faqs' array must not be empty"]

    for index, faq in enumerate(faqs):
        errors.extend(validate_new_faq_entry(faq, index))

        scope = faq.get("scope")
        if scope is not None and not isinstance(scope, str):
            errors.append(f"FAQ #{index}: 'scope' must be a string")

    return errors


def validate_index_file(data: dict) -> list[str]:
    """Validate knowledge/_index.json file."""
    errors: list[str] = []

    if "partners" not in data:
        return ["Missing required field 'partners'"]

    partners = data["partners"]
    if not isinstance(partners, list):
        return ["'partners' must be an array"]

    for idx, partner in enumerate(partners):
        prefix = f"Partner #{idx}"
        if not isinstance(partner, dict):
            errors.append(f"{prefix}: must be an object")
            continue

        for field in ("partner_id", "partner_name", "products"):
            if field not in partner:
                errors.append(f"{prefix}: missing required field '{field}'")

        products = partner.get("products")
        if products is not None and not isinstance(products, list):
            errors.append(f"{prefix}: 'products' must be an array")

    return errors


def detect_and_validate(path: Path) -> list[str]:
    """Detect file format and validate accordingly."""
    if not path.exists():
        return [f"File not found: {path}"]

    try:
        raw = path.read_text(encoding="utf-8")
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        return [f"Invalid JSON: {exc}"]

    # Detect format based on structure
    if path.name == "_index.json":
        return validate_index_file(data)
    elif isinstance(data, list):
        # Legacy format: array of FAQs with instruction/output
        if not data:
            return ["FAQ array must not be empty"]
        return validate_legacy_faq(data)
    elif isinstance(data, dict):
        if "product_id" in data and "partner_id" in data:
            # Product file format
            return validate_product_file(data)
        elif "faqs" in data:
            # Cross-product file format
            return validate_cross_product_file(data)
        else:
            return ["Unknown format: expected product file, cross-product file, or legacy FAQ array"]
    else:
        return ["Root element must be a JSON object or array"]


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: validate_faq.py <file_or_directory>")
        return 1

    target = Path(sys.argv[1])

    if target.is_file():
        files_to_validate = [target]
    elif target.is_dir():
        files_to_validate = sorted(target.rglob("*.json"))
        if not files_to_validate:
            print(f"No JSON files found in {target}")
            return 1
    else:
        print(f"Error: {target} is not a valid file or directory")
        return 1

    total_errors = 0
    validated_count = 0

    for file_path in files_to_validate:
        errors = detect_and_validate(file_path)

        if errors:
            print(f"\n❌ Validation failed for {file_path}:")
            for error in errors:
                print(f"  - {error}")
            total_errors += len(errors)
        else:
            validated_count += 1
            with file_path.open(encoding="utf-8") as handle:
                data = json.load(handle)
                if isinstance(data, list):
                    count = len(data)
                    print(f"✓ {file_path}: {count} entries")
                elif "faqs" in data:
                    count = len(data["faqs"])
                    print(f"✓ {file_path}: {count} FAQs")
                else:
                    print(f"✓ {file_path}: valid")

    print(f"\n{'='*60}")
    if total_errors > 0:
        print(f"❌ Validation failed: {total_errors} errors in {len(files_to_validate)} files")
        return 1
    else:
        print(f"✅ All {validated_count} files validated successfully")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
