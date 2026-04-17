---
description: Check the current widget gzipped size against the budget
---

Run `ls -l public/widget.js` and `gzip -c public/widget.js | wc -c`. Compare gzipped bytes to 3993 bytes (3.9KB budget). Report PASS/FAIL and the delta.
