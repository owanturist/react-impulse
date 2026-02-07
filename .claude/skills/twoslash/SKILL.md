---
name: twoslash
description: Twoslash markup for TypeScript code samples in documentation. Use when writing or editing MDX code blocks with twoslash annotations, configuring fumadocs-twoslash, or adding type queries, completions, error annotations, highlights, virtual files, or cut markers to TypeScript/JavaScript code examples. Triggers on twoslash notations like ^?, ^|, @errors, @filename, ---cut---, or the `twoslash` code fence meta string.
---

# Twoslash

Twoslash processes TypeScript code blocks through the real TypeScript compiler to extract type information, autocompletions, and error diagnostics for rich documentation.

## Activating Twoslash

Add `twoslash` to the code fence meta string:

````md
```ts twoslash
const msg = "hello"
//    ^?
```
````

## Notation Reference

### Type Query: `^?`

Extract type info for the identifier above. Align `^` under the target identifier:

```ts twoslash
const msg = "hello"
//    ^?
```

### Completions: `^|`

Show autocompletion at position. Use with `// @noErrors`:

```ts twoslash
// @noErrors
console.l
//       ^|
```

### Highlight: `^^^`

Highlight a range on the line above. Length = number of carets. Optional annotation text:

```ts twoslash
function greet(name: string) {
  //     ^^^^^ This is the function name
  return `Hello, ${name}`
}
```

### Compiler Options: `// @flag` / `// @flag: value`

Override TypeScript options inline (removed from output):

```ts twoslash
// @target: esnext
// @noImplicitAny: false
// @strict: false
const fn = (a) => a + 1
```

### Expected Errors: `// @errors: <codes>`

Declare expected TS error codes (space-separated):

```ts twoslash
// @errors: 2322
const x: string = 123
```

### Suppress Errors: `// @noErrors`

Suppress all errors, or specific codes with `// @noErrors: 2322 2588`.

### Virtual Files: `// @filename: <name>`

Split code block into multiple files for import/export:

```ts twoslash
// @filename: utils.ts
export function add(a: number, b: number) {
  return a + b
}

// @filename: index.ts
import { add } from "./utils"
const result = add(1, 2)
//    ^?
```

### Cut Markers (hide setup code)

| Marker | Effect |
|--------|--------|
| `// ---cut---` or `// ---cut-before---` | Remove everything above |
| `// ---cut-after---` | Remove everything below |
| `// ---cut-start---` / `// ---cut-end---` | Remove section between (pairs) |

```ts twoslash
import { Signal } from "@owanturist/signal"
const count = Signal(0)
// ---cut---
count.set(1)
//    ^?
```

### Show Emitted JS: `// @showEmit`

Replace output with compiled JavaScript. Use `// @showEmittedFile: index.d.ts` for other emit targets.

### Keep Notations: `// @keepNotations`

Preserve twoslash comments in output instead of stripping them.

## Fumadocs Integration

This project uses `fumadocs-twoslash`. Configuration is in `docs/source.config.ts`. Key points:

- **Transformer**: `transformerTwoslash()` from `fumadocs-twoslash` added to `rehypeCodeOptions.transformers`
- **Cache**: `createFileSystemTypesCache()` from `fumadocs-twoslash/cache-fs` for build performance
- **Languages**: `langs: ["js", "jsx", "ts", "tsx"]` must be explicit (no lazy loading in Twoslash popups)
- **CSS**: `fumadocs-twoslash/twoslash.css` imported in styles
- **Components**: `Popup`, `PopupContent`, `PopupTrigger` from `fumadocs-twoslash/ui` registered in `mdx-components.tsx`
- **Next.js**: `serverExternalPackages: ['typescript', 'twoslash']` in `next.config.mjs`

For detailed API types, options, and renderers, see [references/api.md](references/api.md).
