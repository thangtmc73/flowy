#!/bin/bash
# Auto-validate knowledge base after editing JSON files

set -euo pipefail

input=$(cat)
path=$(echo "$input" | jq -r '.path // empty')

# Only validate if the edited file is in knowledge/
if [[ ! "$path" =~ knowledge/.*\.json$ ]]; then
  echo '{"additional_context": ""}'
  exit 0
fi

# Run validation script
echo "🔍 Validating knowledge base..." >&2
if python3 scripts/validate_knowledge.py > /tmp/validation_output.txt 2>&1; then
  echo '{
    "additional_context": "✅ Knowledge base validation passed after editing '"$path"'"
  }'
else
  validation_errors=$(cat /tmp/validation_output.txt | tail -n 20)
  echo '{
    "additional_context": "⚠️ Knowledge base validation FAILED after editing '"$path"'\n\nErrors:\n'"$(echo "$validation_errors" | jq -Rs .)"'"
  }'
fi

exit 0
