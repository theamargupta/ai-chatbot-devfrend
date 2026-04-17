#!/usr/bin/env bash
# PostToolUse hook for Edit/Write — runs eslint on .ts/.tsx files (advisory only).
set -euo pipefail
input="$(cat)"
file="$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
case "$file" in
  *.ts|*.tsx)
    if [ -f "$file" ]; then
      (cd "$(dirname "$0")/../.." && npx --no-install eslint "$file" 2>&1) || true
    fi
    ;;
esac
exit 0
