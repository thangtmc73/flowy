#!/bin/bash
# Guard against dangerous shell commands

set -euo pipefail

input=$(cat)
command=$(echo "$input" | jq -r '.command // empty')

# Check for dangerous patterns
if [[ "$command" =~ rm[[:space:]]+-rf ]]; then
  command_escaped=$(echo "$command" | jq -Rs .)
  jq -n \
    --arg msg "⚠️ DESTRUCTIVE COMMAND: rm -rf detected!\n\nCommand: $command\n\nThis will permanently delete files. Please review carefully." \
    --arg agent "Hook blocked a potentially destructive rm -rf command." \
    '{permission: "ask", user_message: $msg, agent_message: $agent}'
  exit 0
fi

if [[ "$command" =~ DROP[[:space:]]+TABLE|truncate ]]; then
  jq -n \
    --arg msg "⚠️ DATABASE OPERATION: Detected DROP TABLE or TRUNCATE!\n\nCommand: $command\n\nThis operation is irreversible. Confirm before proceeding." \
    --arg agent "Hook blocked a database destructive operation." \
    '{permission: "ask", user_message: $msg, agent_message: $agent}'
  exit 0
fi

if [[ "$command" =~ docker[[:space:]]+system[[:space:]]+prune ]]; then
  jq -n \
    --arg msg "⚠️ DOCKER CLEANUP: docker system prune will remove unused containers, networks, and images.\n\nCommand: $command\n\nConfirm if you want to proceed." \
    --arg agent "Hook blocked docker system prune." \
    '{permission: "ask", user_message: $msg, agent_message: $agent}'
  exit 0
fi

# Allow command
echo '{"permission": "allow"}'
exit 0
