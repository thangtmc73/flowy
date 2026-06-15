#!/bin/sh
# Copy knowledge JSON from repo root into frontend/public for Vite static serving.
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$ROOT/frontend/public"
rm -rf "$ROOT/frontend/public/knowledge"
mkdir -p "$ROOT/frontend/public/knowledge"

rsync -a --delete \
  --exclude='*.md' \
  --exclude='_index.json' \
  --exclude='**/TEMPLATE.json' \
  "$ROOT/knowledge/" "$ROOT/frontend/public/knowledge/"

python3 "$ROOT/scripts/generate_knowledge_manifest.py"
