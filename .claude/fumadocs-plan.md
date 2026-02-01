# Plan: Documentation Website with Fumadocs

## Goal
Create a documentation website for @owanturist/signal using Fumadocs at root-level `docs/` folder.

## Dependencies to Install

```bash
pnpm add fumadocs-core fumadocs-mdx fumadocs-ui @types/mdx next react react-dom tailwindcss postcss autoprefixer
```

## Files to Create/Modify

### 1. Workspace Configuration
**pnpm-workspace.yaml** - Add docs to workspace:
```yaml
packages:
  - "packages/*"
  - "docs"
```

### 2. Docs Package Structure
```
docs/
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── mdx-components.tsx
├── source.config.ts
├── content/
│   └── docs/
│       ├── meta.json
│       ├── index.mdx              # Introduction
│       ├── getting-started.mdx    # Installation & quick start
│       ├── concepts/
│       │   ├── meta.json
│       │   ├── signals.mdx        # Signal, ReadableSignal, WritableSignal
│       │   ├── derived.mdx        # Derived signals
│       │   └── effects.mdx        # effect() and cleanup
│       └── api/
│           ├── meta.json
│           ├── signal.mdx         # Signal() function
│           ├── batch.mdx          # batch()
│           ├── effect.mdx         # effect()
│           ├── untracked.mdx      # untracked()
│           └── monitor-factory.mdx # MonitorFactory
└── src/
    └── app/
        ├── layout.tsx             # Root layout with RootProvider
        ├── page.tsx               # Redirect to /docs
        ├── global.css
        ├── source.ts              # Content source configuration
        ├── docs/
        │   ├── layout.tsx         # DocsLayout with sidebar
        │   └── [[...slug]]/
        │       └── page.tsx       # Dynamic docs page
        └── api/
            └── search/
                └── route.ts       # Search API endpoint
```

### 3. Configuration Files

**docs/next.config.mjs**
- Enable MDX via fumadocs-mdx/config
- Configure for static export if needed later

**docs/tailwind.config.ts**
- Add fumadocs-ui preset
- Include fumadocs-ui dist in content paths

**docs/source.config.ts**
- Define frontmatter schema
- Configure content directory

## Signal Package API to Document

Based on exploration, these exports need documentation:

| Export | Type | Description |
|--------|------|-------------|
| `Signal()` | Function | Create signals (4 overloads) |
| `ReadableSignal` | Interface | Read-only signal interface |
| `WritableSignal` | Interface | Writable signal interface |
| `ReadonlySignal` | Type | Signal without write method |
| `effect()` | Function | Reactive side effects with cleanup |
| `batch()` | Function | Batch multiple signal updates |
| `untracked()` | Function | Read without tracking (2 overloads) |
| `isSignal()` | Function | Type guard for signals |
| `isDerivedSignal()` | Function | Type guard for derived signals |
| `Monitor` | Type | Dependency tracking interface |
| `Equal` | Type | Custom equality function |
| `SignalOptions` | Interface | Signal creation options |
| `Destructor` | Type | Cleanup function type |
| `MonitorFactory` | Class | Advanced: Create monitors (separate export) |

## Documentation Content Plan

1. **Introduction** - What is @owanturist/signal, why use it
2. **Getting Started** - Installation, basic counter example
3. **Core Concepts**
   - Signals (creating, reading, writing)
   - Derived signals (computed values)
   - Effects (side effects and cleanup)
4. **API Reference** - Each function with signatures and examples

## Verification

1. Run `pnpm install` from root
2. Run `pnpm --filter docs dev`
3. Open http://localhost:3000/docs
4. Verify:
   - All pages render correctly
   - Sidebar navigation works
   - Search functionality works
   - Code syntax highlighting works
