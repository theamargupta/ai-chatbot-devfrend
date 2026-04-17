---
description: Add a ShadCN UI component via the official CLI
---

Run `npx shadcn@latest add $ARGUMENTS --yes` from the repo root. Do NOT hand-write ShadCN components. The `components.json` is already configured. Verify the component lands in `src/components/ui/` and is exported with `cn()` using `@/lib/utils`. Never edit files in `src/components/ui/` by hand unless the user explicitly asks.
