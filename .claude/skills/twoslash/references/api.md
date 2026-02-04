# Twoslash API Reference

## Table of Contents

- [Core API](#core-api)
- [Options](#options)
- [Return Types](#return-types)
- [Node Types](#node-types)
- [Shiki Integration](#shiki-integration)
- [Fumadocs Integration](#fumadocs-integration)

## Core API

### createTwoslasher(opts?)

Factory that creates a cached instance. Reuses TypeScript language services across calls (5-20x faster):

```ts
import { createTwoslasher } from "twoslash"

const twoslasher = createTwoslasher()
const result = twoslasher("const x = 1", "ts")

// Clear cache when done
twoslasher.getCacheMap()?.clear()
```

### twoslasher(code, lang, opts?)

One-shot function. Creates fresh language server per call:

```ts
import { twoslasher } from "twoslash"
const result = twoslasher(code, "ts", { compilerOptions: { strict: true } })
```

### twoslash/core

Dependency-free entry point (bring your own TypeScript):

```ts
import { createTwoslasher } from "twoslash/core"
import ts from "typescript"

const twoslasher = createTwoslasher({
  tsModule: ts,
  tsLibDirectory: "/path/to/lib",
})
```

## Options

### TwoslashExecuteOptions (per-call)

| Option | Type | Description |
|--------|------|-------------|
| `compilerOptions` | `CompilerOptions` | TypeScript compiler options |
| `handbookOptions` | `Partial<HandbookOptions>` | Twoslash behavior options |
| `customTags` | `string[]` | Custom `@tag` names to extract as `NodeTag` |
| `shouldGetHoverInfo` | `(id, pos, file) => boolean` | Filter which identifiers get hover info |
| `filterNode` | `(node) => boolean` | Filter output nodes |
| `extraFiles` | `Record<string, string \| { prepend?, append? }>` | Additional virtual files |

### CreateTwoslashOptions (extends TwoslashExecuteOptions)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tsModule` | `typeof import("typescript")` | auto | TypeScript instance |
| `cache` | `boolean \| Map` | `true` | Cache language server environments |
| `fsCache` | `boolean` | `true` | Cache filesystem requests |
| `vfsRoot` | `string` | — | Root directory for virtual filesystem |
| `fsMap` | `Map<string, string>` | — | Virtual filesystem (for browser usage) |

### HandbookOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `errors` | `number[]` | `[]` | Expected error codes |
| `noErrors` | `boolean \| number[]` | `false` | Suppress errors (all or specific codes) |
| `noErrorValidation` | `boolean` | `false` | Disable error validation |
| `noStaticSemanticInfo` | `boolean` | `false` | Disable auto hover info |
| `showEmit` | `boolean` | `false` | Show compiled JS output |
| `showEmittedFile` | `string` | `"index.js"` | Which emitted file to show |
| `keepNotations` | `boolean` | `false` | Preserve notations in output |
| `noErrorsCutted` | `boolean` | `false` | Ignore errors in cut sections |

### Default Compiler Options

```ts
{
  strict: true,
  module: 99,          // ESNext
  target: 99,          // ESNext
  allowJs: true,
  skipDefaultLibCheck: true,
  skipLibCheck: true,
  moduleDetection: 3,  // Force
}
```

## Return Types

### TwoslashReturn

```ts
interface TwoslashReturn {
  code: string               // Output code (notations removed)
  nodes: TwoslashNode[]      // All information nodes

  // Convenience getters:
  get queries(): NodeQuery[]
  get completions(): NodeCompletion[]
  get errors(): NodeError[]
  get highlights(): NodeHighlight[]
  get hovers(): NodeHover[]
  get tags(): NodeTag[]

  meta: TwoslashReturnMeta
}
```

### TwoslashReturnMeta

```ts
interface TwoslashReturnMeta {
  extension: string
  removals: [start: number, end: number][]
  compilerOptions: CompilerOptions
  handbookOptions: HandbookOptions
  flagNotations: ParsedFlagNotation[]
  virtualFiles: VirtualFile[]
  positionQueries: number[]
  positionCompletions: number[]
  positionHighlights: number[]
}
```

## Node Types

All nodes share: `start`, `length`, `line`, `character` (0-indexed).

| Type | `type` | Key Fields |
|------|--------|------------|
| `NodeHover` | `"hover"` | `target`, `text` (type info), `docs?`, `tags?` |
| `NodeQuery` | `"query"` | Same as NodeHover (from `^?`) |
| `NodeCompletion` | `"completion"` | `completions: CompletionEntry[]`, `completionsPrefix` |
| `NodeError` | `"error"` | `text` (message), `code?`, `level?` ("warning"\|"error"\|"suggestion"\|"message") |
| `NodeHighlight` | `"highlight"` | `text?` (annotation) |
| `NodeTag` | `"tag"` | `name`, `text?` (requires `customTags` option) |

## Shiki Integration

### transformerTwoslash (from @shikijs/twoslash)

```ts
import { transformerTwoslash } from "@shikijs/twoslash"
import { codeToHtml } from "shiki"

const html = await codeToHtml(code, {
  lang: "ts",
  theme: "vitesse-dark",
  transformers: [transformerTwoslash()],
})
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `explicitTrigger` | `boolean` | `false` | Only process blocks with `twoslash` meta |
| `renderer` | Renderer | `rendererRich()` | Output renderer |

**Renderers:**

| Renderer | Import | Description |
|----------|--------|-------------|
| `rendererRich()` | `@shikijs/twoslash` | Default. `twoslash-` CSS classes, syntax-highlighted hover popups |
| `rendererClassic()` | `@shikijs/twoslash` | Legacy `shiki-twoslash` compatible output |

**CSS** (required, output is unstyled by default):
- Rich: `@shikijs/twoslash/style-rich.css`
- Classic: `@shikijs/twoslash/style-classic.css`

## Fumadocs Integration

### Package: `fumadocs-twoslash`

Wraps `@shikijs/twoslash` with Fumadocs-specific React popup components and Tailwind CSS styling.

### Setup

**source.config.ts:**

```ts
import { transformerTwoslash } from "fumadocs-twoslash"
import { createFileSystemTypesCache } from "fumadocs-twoslash/cache-fs"
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins"

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash({
          typesCache: createFileSystemTypesCache(),
        }),
      ],
      langs: ["js", "jsx", "ts", "tsx"], // must be explicit for Twoslash
    },
  },
})
```

**next.config.mjs:**

```js
serverExternalPackages: ["typescript", "twoslash"]
```

**CSS (Tailwind v4):**

```css
@import 'fumadocs-twoslash/twoslash.css';
```

**mdx-components.tsx:**

```tsx
import * as Twoslash from "fumadocs-twoslash/ui"
import defaultComponents from "fumadocs-ui/mdx"

export function getMDXComponents(components?: MDXComponents) {
  return { ...defaultComponents, ...Twoslash, ...components }
}
```

### Components

`fumadocs-twoslash/ui` exports:
- `Popup` — wrapper container
- `PopupContent` — hover content (type information)
- `PopupTrigger` — element triggering popup on hover

### Supported Languages

Shiki cannot lazy-load languages for Twoslash hover popups. All languages used in code blocks must be listed in `langs`. Common set: `["js", "jsx", "ts", "tsx"]`.
