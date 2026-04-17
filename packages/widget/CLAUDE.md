# Widget Rules

## Budget
3.9KB gzipped (3993 bytes). Check with `gzip -c public/widget.js | wc -c` after every build.

## Build
- Vite 6 IIFE build — single file output `public/widget.js`.
- `target: es2020`, minified, no source maps in production.
- NO external imports at runtime. No React, no frameworks. Vanilla TS only.

## DOM
- Render inside a Shadow DOM root. Never touch the host page's DOM outside the container element.
- CSS is inlined into the shadow root.

## API
- Calls `POST /api/chat` and `POST /api/chat/escalate` only.
- Must send `X-Visitor-ID` header (persisted via localStorage under `devfrend_visitor_id`).

## Release
1. `npm run widget:build`
2. `gzip -c public/widget.js | wc -c` — verify <= 3993 bytes
3. Commit `public/widget.js` if you ship the built file; otherwise rely on Vercel's `buildCommand`.
