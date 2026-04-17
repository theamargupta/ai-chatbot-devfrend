#!/usr/bin/env bash
# PostToolUse hook for Edit/Write — typechecks when an API route changes (advisory only).
set -euo pipefail
input="$(cat)"
file="$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
case "$file" in
  */src/app/api/*/route.ts)
    (cd "$(dirname "$0")/../.." && npx --no-install tsc --noEmit -p tsconfig.json 2>&1 | head -30) || true
    ;;
esac
exit 0
