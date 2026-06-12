#!/usr/bin/env python3
"""Validate FAQ knowledge JSON before deploy."""

from __future__ import annotations

import json
import sys
from pathlib import Path

REQUIRED_FIELDS = ("instruction", "output", "category")


def validate_faq(path: Path) -> list[str]:
    errors: list[str] = []

    if not path.exists():
        return [f"File not found: {path}"]

    try:
        raw = path.read_text(encoding="utf-8")
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        return [f"Invalid JSON: {exc}"]

    if not isinstance(data, list):
        return ["Root element must be a JSON array"]
    if not data:
        return ["FAQ array must not be empty"]

    for index, item in enumerate(data):
        prefix = f"Entry #{index}"
        if not isinstance(item, dict):
            errors.append(f"{prefix}: must be an object")
            continue

        for field in REQUIRED_FIELDS:
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


def main() -> int:
    target = Path(sys.argv[1] if len(sys.argv) > 1 else "knowledge/faq.json")
    errors = validate_faq(target)

    if errors:
        print(f"FAQ validation failed for {target}:")
        for error in errors:
            print(f"  - {error}")
        return 1

    with target.open(encoding="utf-8") as handle:
        count = len(json.load(handle))

    print(f"FAQ validation passed: {count} entries in {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
