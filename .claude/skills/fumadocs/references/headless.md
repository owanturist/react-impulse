# Fumadocs Core (Headless) Reference

## Table of Contents

- [Source API](#source-api)
- [Page Tree](#page-tree)
- [Internationalization](#internationalization)
- [Search](#search)

## Source API

### loader()

Import: `fumadocs-core/source`

Transforms content sources into a unified interface. Server-side only, in-memory storage.

```ts
import { loader } from "fumadocs-core/source";

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "/docs",
});
```

### Configuration

| Option | Type | Description |
|--------|------|-------------|
| `source` | Source | Content source (from `.toFumadocsSource()`) |
| `baseUrl` | string | URL prefix (e.g., "/docs") |
| `url` | `(slugs: string[], locale?: string) => string` | Custom URL generation |
| `slugs` | `(file: { path, data }) => string[] \| undefined` | Custom slug generation |
| `icon` | `(icon: string) => ReactElement` | Map icon names to JSX |
| `i18n` | I18nConfig | Enable multi-language support |
| `plugins` | LoaderPlugin[] | Extend loader (e.g., `lucideIconsPlugin()`) |

### Return Methods

```ts
const source = loader({ ... });

// Retrieve pages
source.getPage(slugs: string[], locale?: string)
source.getPages(locale?: string)
source.getPageTree(locale?: string)

// Tree utilities
source.getNodePage(pageNode)
source.getNodeMeta(folderNode)

// Static generation
source.generateParams()  // Returns { slug: string[], lang?: string }[]

// Language utilities
source.getLanguages()

// Serialization (for non-RSC)
await source.serializePageTree(pageTree)
```

### Client-Side Usage

For non-RSC frameworks, serialize the page tree:

```ts
// Server
const serialized = await source.serializePageTree(source.getPageTree());

// Client
import { useFumadocsLoader } from "fumadocs-core/source";
const data = useFumadocsLoader(serializedData);
```

### Standard Page Pattern (Next.js App Router)

```tsx
// app/docs/[[...slug]]/page.tsx
import { source } from "@/app/source";
import { notFound } from "next/navigation";
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from "fumadocs-ui/page";

export default async function Page({ params }) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDXContent = page.data.body;

  return (
    <DocsPage toc={page.data.toc} tableOfContent={{ style: "clerk" }}>
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

## Page Tree

### Structure

The page tree is a serializable tree for sidebar navigation and breadcrumbs.

**Import types:**
```ts
import type * as PageTree from "fumadocs-core/page-tree";
```

### Node Types

**Root:**
```ts
{
  name: ReactNode,
  children: PageTree.Node[],
  fallback?: PageTree.Root,  // secondary tree
  $id?: string,
}
```

**Page:**
```ts
{
  type: "page",
  name: ReactNode,
  url: string,
  external?: boolean,
  description?: ReactNode,
  icon?: ReactElement,
  $id?: string,
}
```

**Folder:**
```ts
{
  type: "folder",
  name: ReactNode,
  children: PageTree.Node[],
  index?: PageTree.Page,     // folder landing page
  defaultOpen?: boolean,
  collapsible?: boolean,
  root?: boolean,            // root folder (tab-like)
  description?: ReactNode,
  icon?: ReactElement,
  $id?: string,
}
```

**Separator:**
```ts
{
  type: "separator",
  name?: ReactNode,
  icon?: ReactElement,
  $id?: string,
}
```

### Constraints

- Only serializable data (no functions)
- Sent to client for sidebar/breadcrumbs - avoid sensitive/large data
- `$ref` is internal; omit when hardcoding trees

## Internationalization

### Setup

```ts
import { defineI18n } from "fumadocs-core/i18n";

export const i18n = defineI18n({
  defaultLanguage: "en",
  languages: ["en", "cn"],
  hideLocale: "default-locale", // "never" (default) | "default-locale" | "always"
});
```

### Locale Prefix Modes

Configure via `hideLocale` option:

| Mode | Behavior |
|------|----------|
| `"never"` | Never hide the prefix (default) |
| `"default-locale"` | Only hide the prefix for the default locale |
| `"always"` | Always hide the prefix; detect locale from cookies |

**Caveat:** `"always"` mode uses cookies, creating caching and SEO issues for static sites.

### Middleware

```ts
// middleware.ts
import { createI18nMiddleware } from "fumadocs-core/i18n/middleware";
import { i18n } from "@/lib/i18n";

export default createI18nMiddleware(i18n);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### Loader Integration

```ts
export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "/docs",
  i18n,
});
```

### Fallback

When translations are unavailable, falls back to `fallbackLanguage` (defaults to `defaultLanguage`). Set to `null` to disable.

## Search

### Static Search (built-in)

```ts
// app/api/search/route.ts
import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/app/source";

export const { GET } = createFromSource(source);
```

### Provider Configuration

Static search works automatically when the API route exists. Optionally disable or customize:

```tsx
<RootProvider search={{ enabled: true, hotKey: [...], preload: true }}>
```

### Orama Search

Alternative to static search with better full-text capabilities.

### Algolia Search

For production-scale search. Requires Algolia account and API keys.

### Custom Search

Use `useDocsSearch({ type: 'fetch', locale })` hook with a custom search endpoint.
