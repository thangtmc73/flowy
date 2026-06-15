#!/usr/bin/env python3
"""Generate manifest.json for the frontend knowledge browser."""

from __future__ import annotations

import json
from pathlib import Path

CROSS_PRODUCT_META = {
    "general_faqs": {
        "product_name": "General FAQs",
        "category": "General",
    },
    "comparisons": {
        "product_name": "Product Comparisons",
        "category": "Comparisons",
    },
}


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    knowledge_dir = repo_root / "knowledge"
    output_path = repo_root / "frontend" / "public" / "knowledge" / "manifest.json"
    files: list[dict[str, str]] = []

    cross_dir = knowledge_dir / "cross_product"
    if cross_dir.exists():
        for json_file in sorted(cross_dir.glob("*.json")):
            if json_file.name.startswith("_"):
                continue

            meta = CROSS_PRODUCT_META.get(json_file.stem, {})
            route_path = f"cross_product/{json_file.stem}"
            files.append(
                {
                    "path": route_path,
                    "file": f"{route_path}.json",
                    "name": json_file.stem,
                    "product_name": meta.get("product_name", json_file.stem.replace("_", " ").title()),
                    "partner_name": "Cross Product",
                    "category": meta.get("category", "General"),
                }
            )

    index_path = knowledge_dir / "_index.json"
    if index_path.exists():
        index = json.loads(index_path.read_text(encoding="utf-8"))
        for partner in index.get("partners", []):
            partner_name = partner.get("partner_name", "")
            for product in partner.get("products", []):
                file_rel = product["file"]
                route_path = file_rel[:-5] if file_rel.endswith(".json") else file_rel
                files.append(
                    {
                        "path": route_path,
                        "file": file_rel,
                        "name": product.get("product_id", ""),
                        "product_name": product.get("product_name", ""),
                        "partner_name": partner_name,
                        "category": product.get("category", ""),
                    }
                )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps({"files": files}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Generated {output_path} with {len(files)} files")


if __name__ == "__main__":
    main()
