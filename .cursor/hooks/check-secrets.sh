#!/bin/bash
# Check for potential secrets before submitting prompts

set -euo pipefail

input=$(cat)
user_prompt=$(echo "$input" | jq -r '.userPrompt // empty')

# Patterns that might indicate secrets
secret_patterns=(
  "sk-[a-zA-Z0-9]{20,}"           # OpenAI API keys
  "ghp_[a-zA-Z0-9]{36,}"          # GitHub PAT
  "AKIA[A-Z0-9]{16}"              # AWS Access Key
  "[0-9]{12,}-[a-z0-9]{32,}"      # Generic API key pattern
  "client_secret.*['\"].*['\"]"   # Client secrets
  "password.*['\"].*['\"]"        # Passwords
  "Bearer [A-Za-z0-9\-\._~\+\/]+"  # Bearer tokens
)

# Check each pattern
for pattern in "${secret_patterns[@]}"; do
  if echo "$user_prompt" | grep -qiE "$pattern"; then
    echo '{
      "additional_context": "🔐 **Security Warning**: Your prompt may contain sensitive credentials or API keys.\n\nPlease review before submitting:\n- Remove any API keys, tokens, or passwords\n- Use environment variables or secure vaults instead\n- Never paste raw secrets into chat"
    }'
    exit 0
  fi
done

# No secrets detected
echo '{"additional_context": ""}'
exit 0
