#!/usr/bin/env bash
# PreToolUse hook for Bash — blocks commits/adds that touch .env files.
set -euo pipefail
input="$(cat)"
command="$(printf '%s' "$input" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
case "$command" in
  *"git add"*|*"git commit"*)
    if printf '%s' "$command" | grep -qE '(^|[[:space:]/])\.env(\.|$|[[:space:]])'; then
      echo "Blocked: command references .env — never commit env files." >&2
      exit 2
    fi
    ;;
esac
exit 0
