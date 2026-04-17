#!/usr/bin/env bash
# PreToolUse hook for Write — blocks creating tailwind.config.js/ts (v4 uses @theme in globals.css).
set -euo pipefail
input="$(cat)"
file="$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
case "$file" in
  */tailwind.config.js|*/tailwind.config.ts|*/tailwind.config.mjs|*/tailwind.config.cjs)
    echo "Blocked: Tailwind v4 uses @theme in src/app/globals.css — do NOT create tailwind.config.*" >&2
    exit 2
    ;;
esac
exit 0
