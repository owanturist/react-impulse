---
name: fumadocs
description: Expert knowledge for building documentation sites with Fumadocs (fumadocs-core, fumadocs-ui, fumadocs-mdx). Use when working with Fumadocs documentation framework, including creating/editing MDX docs pages, configuring layouts (DocsLayout, HomeLayout), setting up source.config.ts, page trees, meta.json files, sidebar navigation, search, theming, MDX components (Tabs, Callout, Cards, Files, TypeTable, CodeBlock), i18n, collections, frontmatter schemas, and any fumadocs-related configuration or content authoring.
---

# Fumadocs

Fumadocs is a React-based documentation framework with three layers: **Content** (fumadocs-mdx) -> **Core** (fumadocs-core) -> **UI** (fumadocs-ui). Each layer is independent and composable.

## Architecture

```
source.config.ts          -> defines collections (MDX content)
.source/                  -> auto-generated loaders (gitignore this)
app/source.ts             -> loader() creates unified source API
app/docs/layout.tsx       -> DocsLayout with page tree
app/docs/[[...slug]]/page.tsx -> DocsPage renders MDX
content/docs/             -> MDX files + meta.json
```

## Key File Patterns

### source.config.ts

```ts
import { defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
});
```

### next.config.mjs

```js
import { createMDX } from "fumadocs-mdx/next";
const withMDX = createMDX();
export default withMDX({ /* next config */ });
```

### app/source.ts

```ts
import { loader } from "fumadocs-core/source";
import { docs } from "@/.source/server";

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "/docs",
});
```

### Layout

```tsx
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/app/source";

export default function Layout({ children }) {
  return (
    <DocsLayout tree={source.getPageTree()} nav={{ title: "My Docs" }}>
      {children}
    </DocsLayout>
  );
}
```

### Page

```tsx
import { source } from "@/app/source";
import { notFound } from "next/navigation";
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from "fumadocs-ui/page";

export default async function Page({ params }) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const MDXContent = page.data.body;
  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent components={mdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  return { title: page.data.title, description: page.data.description };
}
```

### MDX Components

```tsx
import defaultMdxComponents from "fumadocs-ui/mdx";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";

export function getMDXComponents(components) {
  return { ...defaultMdxComponents, ...TabsComponents, TypeTable, ...components };
}
```

### CSS (Tailwind v4)

```css
@import 'tailwindcss';
@import 'fumadocs-ui/css/neutral.css';  /* or: solar, ocean, purple, etc. */
@import 'fumadocs-ui/css/preset.css';
```

### RootProvider

```tsx
import { RootProvider } from "fumadocs-ui/provider/next";
// Wrap app in layout.tsx; configures search, theme, etc.
```

## Content Structure

### Frontmatter

```yaml
---
title: Page Title          # renders as heading, no need for # h1
description: Brief summary
icon: IconName             # requires custom icon handler in loader()
---
```

### meta.json (folder configuration)

```json
{
  "title": "Section Name",
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

**Pages array syntax:**
- `"page-name"` or `"./path/to/page"` - reference page or folder
- `"---Label---"` - separator
- `"..."` - remaining items alphabetically
- `"z...a"` - remaining reverse-alphabetically
- `"...folder"` - extract items from subfolder
- `"!item"` - exclude from rest
- `"[Text](url)"` - embedded link
- `"external:[Text](url)"` - external link

**Root folders:** Add `"root": true` to create sidebar tabs.

### File Naming -> Slugs

- `./dir/page.mdx` -> `['dir', 'page']`
- `./dir/index.mdx` -> `['dir']`
- `./(group)/page.mdx` -> `['page']` (parentheses = no slug)

## Search Setup

```ts
// app/api/search/route.ts
import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/app/source";
export const { GET } = createFromSource(source);
```

Static search works automatically when the API route exists. No extra RootProvider config needed.

## Common MDX Syntax

**Callout:** `<Callout type="warn" title="Title">Content</Callout>`
Types: `info`, `warn`/`warning`, `error`, `success`, `idea`

**Tabs:**
```mdx
<Tabs items={['npm', 'pnpm']}>
  <Tab value="npm">npm install pkg</Tab>
  <Tab value="pnpm">pnpm add pkg</Tab>
</Tabs>
```

**Code block tabs:** ` ```ts tab="TypeScript" `

**Package install:** ` ```package-install ` auto-generates npm/pnpm/yarn/bun tabs

**Line numbers:** ` ```ts lineNumbers `

**Title:** ` ```ts title="utils.ts" `

**Inline code highlighting:** With `inline: "tailing-curly-colon"` in rehypeCode config, use `` `code{:lang}` `` syntax for highlighted inline code (e.g. `` `Array<string>{:ts}` ``). The `{:lang}` suffix is stripped from output.

**Twoslash:** Add `twoslash` meta string to code fences for inline type information (e.g. `` ```ts twoslash ``). Requires `fumadocs-twoslash` package. See the [twoslash skill](../twoslash/SKILL.md) for notation reference (`^?`, `^|`, `@errors`, `---cut---`, etc.).

**Shiki transformers:** `// [!code highlight]`, `// [!code ++]`, `// [!code --]`, `// [!code focus]`

**Custom heading anchor:** `## Heading [#custom-id]`

**Hide from TOC:** `## Heading [!toc]`

**Include file:** `<include>./shared.mdx</include>` (fumadocs-mdx only)

## Detailed References

- **UI components, layouts, theming, search dialog**: See [references/ui.md](references/ui.md)
- **MDX collections, plugins, markdown features, source.config.ts**: See [references/mdx.md](references/mdx.md)
- **Core source API, page tree types, i18n, search backends**: See [references/headless.md](references/headless.md)
