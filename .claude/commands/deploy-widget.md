---
description: Build the widget and report gzipped size
---

Run:

1. `npm run widget:build`
2. `gzip -c public/widget.js | wc -c` — record gzipped size in bytes
3. Compare to the 3.9KB (3993 byte) budget from `packages/widget/CLAUDE.md`
4. If over budget, list suspected culprits (new imports, un-minified blobs) and suggest fixes; do NOT auto-refactor.

Report final size in bytes AND KB.
