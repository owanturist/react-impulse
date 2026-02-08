# Fumadocs MDX Reference

## Table of Contents

- [Setup](#setup)
- [Collections](#collections)
- [Frontmatter & Meta](#frontmatter--meta)
- [MDX Plugins](#mdx-plugins)
- [Markdown Features](#markdown-features)

## Setup

### source.config.ts

Central configuration file. Uses `defineConfig()` for global options and `defineDocs()`/`defineCollections()` for content:

```ts
import { defineConfig, defineDocs, defineCollections, frontmatterSchema } from "fumadocs-mdx/config";

// Global config (optional)
export default defineConfig({
  mdxOptions: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
  // workspaces: { ... },  // for monorepo
  // buildCache: ".cache",  // experimental
});
```

Collections:

```ts
import { defineDocs, defineCollections } from "fumadocs-mdx/config";
import { z } from "zod";

// Required for Fumadocs - combines doc + meta collections
export const docs = defineDocs({
  dir: "content/docs",
  docs: { /* doc collection options */ },
  meta: { /* meta collection options */ },
});

// Standalone collections (e.g., blog)
export const blog = defineCollections({
  type: "doc",
  dir: "./content/blog",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
});
```

### Next.js Integration

```js
// next.config.mjs
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();
export default withMDX({
  output: "export", // optional: static export
  // other Next.js config
});
```

### Source Loader

```ts
// app/source.ts
import { loader } from "fumadocs-core/source";
import { docs } from "@/.source/server";

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "/docs",
});
```

### Generated Files (.source/)

Fumadocs MDX generates files in `.source/`:
- `server.ts` - Server-side source loader
- `browser.ts` - Client-side source with lazy imports
- `dynamic.ts` - Dynamic loading utilities

These are auto-generated; add `.source/` to `.gitignore`.

## Collections

### defineCollections

Create standalone content collections:

```ts
export const blog = defineCollections({
  type: "doc",       // "doc" for MDX/MD, "meta" for JSON/YAML
  dir: "./content/blog",
  schema: z.object({ /* validation */ }),
  files: ["**/*.mdx"], // optional glob filter
  mdxOptions: {},    // doc-only: MDX compiler config
  postprocess: {},   // doc-only: build-time data
  async: false,      // optional: async loading
  dynamic: false,    // optional: on-demand compilation
});
```

**Doc type** processes `.md`/`.mdx` files into React Server Components.
**Meta type** processes `.json`/`.yaml` files into data arrays.

### defineDocs

Create Fumadocs-specific doc + meta collection pair:

```ts
export const docs = defineDocs({
  dir: "content/docs",
  docs: { schema: frontmatterSchema.extend({ /* extra fields */ }) },
  meta: { schema: metaSchema.extend({ /* extra fields */ }) },
});
```

Import `frontmatterSchema` and `metaSchema` from `fumadocs-mdx/config` to extend defaults.

### Schema Validation

- Uses Zod or any Standard Schema-compatible library
- Validated at build time; output must be serializable
- Schema can be a function receiving context:

```ts
schema: (ctx) => z.object({
  title: z.string(),
  slug: z.string().default(ctx.path),
})
```

Context provides `ctx.path` (file path) and `ctx.source`.

### Built-in Exports from Doc Collections

Each MDX file automatically exports:
- `frontmatter` - Parsed frontmatter data
- `toc` - Table of contents array
- `structuredData` - Search indexing data
- `extractedReferences` - Analyzed href links

### mdxOptions

Customize MDX compiler per-collection. **Warning:** This removes all defaults.
Use `applyMdxPreset()` to extend rather than replace:

```ts
import { applyMdxPreset } from "fumadocs-mdx/config";

mdxOptions: applyMdxPreset({
  remarkPlugins: [myPlugin],
})
```

### postprocess

- `includeProcessedMarkdown: true` - Access via `getText('processed')`
- `valueToExport: [...]` - Export `vfile.data` properties as ESM exports

## Frontmatter & Meta

### Frontmatter Fields

```yaml
---
title: Page Title           # Required - used as page heading
description: Brief summary   # Optional - meta description
icon: IconName              # Optional - requires custom icon handler
---
```

The `title` frontmatter field renders as the page heading, so h1 (`# Heading`) is unnecessary.

### meta.json Format

Controls folder behavior in page tree:

```json
{
  "title": "Section Name",
  "description": "For root folders only",
  "icon": "IconName",
  "root": true,
  "defaultOpen": true,
  "collapsible": true,
  "pages": [
    "index",
    "getting-started",
    "---Concepts---",
    "...concepts",
    "---API Reference---",
    "...api"
  ]
}
```

### Pages Array Syntax

| Syntax | Effect |
|--------|--------|
| `"page-name"` or `"./path/to/page"` | Reference a page or folder |
| `"---Label---"` | Separator with label |
| `"---[Icon]Label---"` | Separator with icon |
| `"..."` | Include remaining items alphabetically |
| `"z...a"` | Remaining items reverse-alphabetically |
| `"...folder"` | Extract items from subfolder |
| `"!item"` | Exclude from rest queries |
| `"[Text](url)"` | Embedded link |
| `"external:[Text](url)"` | External link |

### File Naming & Slugs

- `./dir/page.mdx` -> slugs `['dir', 'page']`
- `./dir/index.mdx` -> slugs `['dir']`
- Folder groups: `./(group-name)/page.mdx` -> slugs `['page']` (parentheses prevent slug)

### i18n File Conventions

**Dot parser** (default): `page.mdx`, `page.cn.mdx`
**Dir parser**: `/en/page.mdx`, `/cn/page.mdx`

## MDX Plugins

### Default Preset (auto-applied)

Remark plugins:
- **remarkImage** - Handle images, add size attributes
- **remarkHeading** - Extract TOC
- **remarkStructure** - Generate search indexes
- **remarkExports** - Export generated data

Default rehype plugin:
- **rehypeCode** - Syntax highlighting via Shiki

### Available Plugins

| Plugin | Import | Purpose |
|--------|--------|---------|
| `remarkAdmonition` | `fumadocs-core/mdx-plugins` | Docusaurus `:::` syntax -> Callout |
| `remarkImage` | `fumadocs-core/mdx-plugins` | Image size attributes |
| `remarkInstall` | `fumadocs-core/mdx-plugins` | Package install code blocks |
| `remarkTypeScript` | `fumadocs-core/mdx-plugins` | TS -> JS tab conversion |
| `remarkNpm` | `fumadocs-core/mdx-plugins` | NPM command generation |
| `remarkMdxFiles` | `fumadocs-core/mdx-plugins` | Convert ASCII file trees to `<Files>` components |
| `rehypeCode` | `fumadocs-core/mdx-plugins` | Shiki syntax highlighting |

### rehypeCode Configuration

```ts
import { rehypeCode } from "fumadocs-core/mdx-plugins";

rehypeCode({
  themes: { light: "github-light", dark: "github-dark" },
  transformers: [...],
  langs: ["js", "jsx", "ts", "tsx"],
  inline: "tailing-curly-colon", // enable inline code highlighting
})
```

**Fumadocs-specific options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `themes` | object | — | Light/dark theme pair, e.g. `{ light: "github-light", dark: "github-dark" }` |
| `langs` | string[] | — | Pre-loaded languages (required for Twoslash popups) |
| `transformers` | array | — | Shiki transformers (highlight, diff, focus, etc.) |
| `inline` | `false \| "tailing-curly-colon"` | `false` | Enable inline code highlighting with `{:lang}` syntax |
| `lazy` | boolean | `true` | Load languages/themes on-demand |
| `engine` | `"js" \| "oniguruma"` | `"js"` | Shiki regex engine |
| `tab` | boolean | `true` | Enable `tab="..."` meta string for tabbed code blocks |
| `icon` | IconOptions \| false | — | Add language SVG icons to code blocks |
| `filterMetaString` | function | — | Pre-process meta strings |
| `defaultLanguage` | string | — | Fallback language when none specified |

## Markdown Features

### Code Blocks

**Line numbers:** ` ```ts lineNumbers ` or ` ```ts lineNumbers=4 `

**Title:** ` ```ts title="utils.ts" `

**Inline code highlighting:** When `inline: "tailing-curly-colon"` is enabled, append `{:lang}` inside backticks:

```md
Use `console.log("hello"){:js}` to print to the console.
The type is `Array<string>{:ts}` in TypeScript.
```

The `{:lang}` suffix is consumed by the plugin and does not appear in rendered output. The inline code receives full Shiki syntax highlighting.

**Shiki transformers:**
- `// [!code highlight]` - Highlight line
- `// [!code word:Text]` - Highlight word
- `// [!code ++]` / `// [!code --]` - Diff markers
- `// [!code focus]` - Focus line

**Tabbed code blocks** (in MDX):
````md
```ts tab="TypeScript"
const x: number = 1;
```
```js tab="JavaScript"
const x = 1;
```
````

**Package install blocks:**
````md
```package-install
npm i fumadocs-core fumadocs-ui
```
````
Auto-generates tabs for npm, pnpm, yarn, bun.

### Headings

- Auto-generated anchors from heading text
- Custom anchors: `## Heading [#custom-id]`
- Hide from TOC: `## Heading [!toc]`
- TOC-only entry: `## Heading [toc]`
- Combine: `## Heading [toc] [#custom-id]`

### Links

- Internal links use framework router (prefetch-enabled)
- External links auto-get `rel="noreferrer noopener" target="_blank"`

### Include Directive (Fumadocs MDX only)

```mdx
<include>./shared-section.mdx</include>
```

References external MDX files relative to current document.
