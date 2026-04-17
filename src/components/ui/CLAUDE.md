# ShadCN — DO NOT EDIT BY HAND

Every file in this directory is managed by the ShadCN CLI. To add a component:

```
npx shadcn@latest add <name> --yes
```

If you need to customize, wrap the component in a sibling directory (`src/components/chat/`, etc.). Do NOT fork the ShadCN output.

- Tailwind v4, uses `@theme` in `src/app/globals.css`.
- Unified `radix-ui` package import.
- All components use `cn()` from `@/lib/utils`.
