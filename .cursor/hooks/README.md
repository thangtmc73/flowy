# Cursor Hooks

This directory contains automation hooks that run during development.

## Hooks Overview

### 1. `validate-knowledge.sh`
**Trigger:** After editing any `.json` file in `knowledge/`  
**Purpose:** Auto-validate knowledge base structure using `scripts/validate_knowledge.py`  
**Output:** Shows validation result in context

**Example:**
```
✅ Knowledge base validation passed after editing knowledge/partners/msig/health_247.json
```

---

### 2. `dangerous-commands.sh`
**Trigger:** Before executing shell commands matching dangerous patterns  
**Purpose:** Protect against destructive operations  
**Blocks:**
- `rm -rf` (file deletion)
- `DROP TABLE`, `truncate` (database operations)
- `docker system prune` (Docker cleanup)

**Behavior:** Shows confirmation dialog before allowing command

---

### 3. `check-secrets.sh`
**Trigger:** Before submitting any prompt to the agent  
**Purpose:** Detect potential secrets in chat input  
**Detects:**
- OpenAI API keys (`sk-...`)
- GitHub Personal Access Tokens (`ghp_...`)
- AWS Access Keys (`AKIA...`)
- Generic API key patterns
- Client secrets, passwords, bearer tokens

**Output:** Warning message if secrets detected

---

## Testing Hooks

### Test knowledge validation
```bash
# Edit any JSON file in knowledge/
# The hook will run automatically after save
```

### Test dangerous command guard
```bash
# Try running (in agent chat or terminal)
rm -rf /some/path
# You should see a confirmation dialog
```

### Test secret detection
```bash
# Try pasting text with API key pattern in chat
# Example: "sk-1234567890abcdefghij"
# You should see a security warning
```

---

## Troubleshooting

If hooks don't run:

1. **Check Cursor Hooks tab:**
   - Open Command Palette (Cmd+Shift+P)
   - Search "Hooks"
   - Check for errors

2. **Verify executability:**
   ```bash
   ls -la .cursor/hooks/
   # All .sh files should have 'x' permission
   ```

3. **Reload hooks:**
   - Cursor watches `hooks.json` automatically
   - If needed, restart Cursor

4. **Check dependencies:**
   ```bash
   # Ensure these are installed
   command -v jq         # JSON parser
   command -v python3    # For validation script
   ```

---

## Modifying Hooks

Edit `.cursor/hooks.json` to:
- Add new hooks
- Change matchers (regex patterns)
- Adjust timeouts
- Enable/disable hooks

After editing `hooks.json`, Cursor will reload automatically.

---

## Hook Events Reference

See full list at: https://docs.cursor.com/hooks

Common events:
- `afterFileEdit` - After any file edit
- `beforeShellExecution` - Before running shell command
- `beforeSubmitPrompt` - Before submitting chat prompt
- `preToolUse` - Before agent uses any tool
- `postToolUse` - After tool execution
