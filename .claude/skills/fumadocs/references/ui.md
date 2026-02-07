# Fumadocs UI Reference

## Table of Contents

- [Layouts](#layouts)
- [Theming](#theming)
- [Components](#components)
- [Search](#search)

## Layouts

### DocsLayout

Import: `fumadocs-ui/layouts/docs`

Wraps documentation pages with sidebar and mobile navbar.

**Required props:**
- `tree` (PageTree.Root): Page tree from `source.getPageTree()`

**Key optional props:**

| Prop | Type | Description |
|------|------|-------------|
| `sidebar.enabled` | boolean | Toggle sidebar |
| `sidebar.defaultOpenLevel` | number (default: 0) | Auto-open folders at this depth or below |
| `sidebar.prefetch` | boolean | Link prefetching |
| `sidebar.collapsible` | boolean (default: true) | Collapsible on desktop |
| `sidebar.footer` | ReactNode | Footer content in sidebar |
| `sidebar.banner` | ReactNode | Banner above sidebar items |
| `sidebar.tabs` | false \| array \| object | Root folder tabs config |
| `sidebar.components` | object | Replace tree rendering components |
| `tabMode` | "top" \| "auto" | Tab positioning |
| `nav` | Partial\<NavOptions\> | Replace/disable navbar |
| `links` | LinkItemType[] | Navigation links |
| `githubUrl` | string | GitHub repo URL |
| `i18n` | boolean \| I18nConfig | Internationalization |
| `themeSwitch` | object | Theme toggle config |
| `searchToggle` | object | Search component config |
| `containerProps` | HTMLAttributes | Container div props |

**Sidebar tabs** are root folders with tab-like behavior. Only content of the active tab is visible. Configure via:

1. Root folders: Add `"root": true` to `meta.json`
2. Explicit: `sidebar.tabs` array with `{ title, description, url, urls? }`
3. Transform: `sidebar.tabs.transform` function to customize icons/styles

**Example:**
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

### HomeLayout

Import: `fumadocs-ui/layouts/home`

For home/landing pages. Accepts same base props as DocsLayout minus `tree`.

### BaseLayoutProps (shared)

| Prop | Type | Description |
|------|------|-------------|
| `nav` | Partial | Navbar config |
| `nav.title` | string \| function | Display text |
| `nav.url` | string (default: "/") | Title link destination |
| `nav.transparentMode` | "always" \| "top" \| "none" | Background opacity |
| `nav.component` | ReactNode | Custom navbar replacement |
| `links` | array | Navigation link items |
| `githubUrl` | string | GitHub URL shortcut |
| `i18n` | boolean \| config | i18n settings |
| `themeSwitch` | object | Theme toggle (enabled, component, mode) |
| `themeSwitch.mode` | "light-dark" \| "light-dark-system" | Theme options |
| `searchToggle` | object | Search config with sm/lg components |

**Custom navbar CSS:** Override `--fd-nav-height` to match custom navbar height.

### Link Types

Configure via `links` prop:

1. **Link**: `{ text, url, icon?, secondary?, active? }`
2. **Icon**: `{ type: 'icon', label, icon, text, url }` - shown as icon button
3. **Custom**: `{ type: 'custom', children }` - arbitrary ReactNode
4. **Menu**: `{ type: 'menu', items: [{ text, description, url }] }` - dropdown
5. **Navigation Menu** (HomeLayout only): Animated dropdown using `NavbarMenu*` components with `on: 'nav'`

Active modes: `"url"`, `"nested-url"`, `"none"`

### Page Components

Import from `fumadocs-ui/page`:

- `DocsPage` - Page wrapper
- `DocsTitle` - Page title
- `DocsDescription` - Page description
- `DocsBody` - Content wrapper (applies typography)
- `DocsCategory` - Category navigation

**DocsPage props:**

| Prop | Type | Description |
|------|------|-------------|
| `toc` | TOCItem[] | Table of contents headings array |
| `full` | boolean | Full width mode; TOC becomes popover |
| `tableOfContent` | object | TOC sidebar config |
| `tableOfContent.style` | "normal" \| "clerk" | TOC visual style |
| `tableOfContent.single` | boolean | Limit to one active item |
| `tableOfContent.enabled` | boolean | Toggle TOC |
| `tableOfContent.header` | ReactNode | Content before TOC |
| `tableOfContent.footer` | ReactNode | Content after TOC |
| `tableOfContent.component` | ReactNode | Custom TOC component |
| `tableOfContentPopover` | object | Popover TOC config (mobile/full mode) |
| `footer` | object | Footer navigation config |
| `footer.enabled` | boolean | Toggle prev/next footer |
| `footer.items` | object | Custom next/previous page data |
| `footer.component` | ReactNode | Custom footer |
| `breadcrumb` | object | Breadcrumb config |
| `breadcrumb.enabled` | boolean | Toggle breadcrumb |
| `breadcrumb.includeRoot` | boolean | Include root folders |
| `breadcrumb.includePage` | boolean | Include current page |

**Last modified time:** Use `PageLastUpdate` component. Sources: fumadocs-mdx `lastModified` field or `getGithubLastEdit` utility from `fumadocs-core/utils`.

**Edit on GitHub:** Add a link targeting: `https://github.com/user/repo/blob/main/content/docs/${page.path}`

### Notebook Layout

Import: `fumadocs-ui/layouts/notebook`

Compact variant of DocsLayout. More opinionated - sidebar/navbar cannot be replaced.
Inherits most DocsLayout options. Supports `tabMode: "navbar"` and `nav.mode: "top"`.

## Theming

### CSS Setup (Tailwind CSS v4 required)

```css
@import 'tailwindcss';
@import 'fumadocs-ui/css/neutral.css';  /* or other theme */
@import 'fumadocs-ui/css/preset.css';
```

**For Shadcn UI projects:**
```css
@import 'tailwindcss';
@import 'fumadocs-ui/css/shadcn.css';
@import 'fumadocs-ui/css/preset.css';
```

### Color Presets

11 built-in themes: `neutral`, `black`, `vitepress`, `dusk`, `catppuccin`, `ocean`, `purple`, `solar`, `emerald`, `ruby`, `aspen`

```css
@import 'fumadocs-ui/css/<theme>.css';
@import 'fumadocs-ui/css/preset.css';
```

### CSS Variables

All use `fd-` prefix with HSL values. Key variables:

| Variable | Purpose |
|----------|---------|
| `--color-fd-background` | Page background |
| `--color-fd-foreground` | Text color |
| `--color-fd-primary` | Primary accent |
| `--color-fd-muted` | Muted backgrounds |
| `--color-fd-card` | Card backgrounds |
| `--color-fd-border` | Border color |
| `--color-fd-popover` | Popover background |
| `--color-fd-accent` | Accent highlights |
| `--color-fd-ring` | Focus rings |
| `--color-fd-secondary` | Secondary elements |
| `--fd-layout-width` | Max layout width (default varies) |

Override in light/dark modes using `.dark` selector.

### RTL Support

Set `dir="rtl"` on both `<body>` and `<RootProvider>`.

### Typography

Built-in `prose` class wraps content with typography defaults.

## Components

### Default MDX Components

```tsx
import defaultMdxComponents from 'fumadocs-ui/mdx';
```

Includes: Cards, Callouts, Code Blocks, Headings.

### Tabs

Import: `fumadocs-ui/components/tabs`

```tsx
import * as TabsComponents from 'fumadocs-ui/components/tabs';
// Spread into getMDXComponents
```

**Props:**
- `items` (string[]): Tab labels
- `groupId` (string): Shared state across instances
- `persist` (boolean): Use localStorage instead of sessionStorage
- `defaultIndex` (number): Initial tab
- `updateAnchor` (boolean): Sync URL hash

**Tab component** props: `value`, `id` (for URL hash linking)

**Primitive components:** `TabsList`, `TabsTrigger`, `TabsContent`

### Callout

Import: `fumadocs-ui/components/callout`

Types: `info` (default), `warn`/`warning`, `error`, `success`, `idea`

```mdx
<Callout type="warn" title="Warning">Content</Callout>
```

### Files (File Tree)

Import: `fumadocs-ui/components/files`

```mdx
<Files>
  <Folder name="src" defaultOpen>
    <File name="index.ts" />
  </Folder>
</Files>
```

### TypeTable

Import: `fumadocs-ui/components/type-table`

Display TypeScript type definitions as tables.

### Auto Type Table

Generates tables from TypeScript definitions. Props: `path` (TS file), `name` (exported type).

### Steps

Import: `fumadocs-ui/components/steps`

Also available as CSS-only: use `fd-steps` class on container and `fd-step` on each item.

### Banner

Import: `fumadocs-ui/components/banner`

Props: `id` (string, for persistent dismiss via localStorage), `variant` ("rainbow"), `changeLayout` (boolean, default true - modifies layout styling).

### Accordion

Import: `fumadocs-ui/components/accordion`

Wrapper is `Accordions` (plural), items are `Accordion` (singular). Built on Radix UI.

Props on `Accordions`: `type` ("single" | "multiple")
Props on `Accordion`: `id` (enables hash-based auto-opening via URL), `title`

### Zoomable Image

Import: `fumadocs-ui/components/image-zoom`

Click-to-zoom image component.

### Inline TOC

Inline table of contents component.

### DynamicCodeBlock

Import: `fumadocs-ui/components/dynamic-codeblock`

Client component for code highlighting without MDX. Uses Shiki.

### Relative Links

```tsx
import { createRelativeLink } from 'fumadocs-ui/mdx';
// Override `a` component in getMDXComponents
```

Enables `[Link](./file.mdx)` relative path syntax.

## Search

### Configuration via RootProvider

Framework-specific imports:
- Next.js: `fumadocs-ui/provider/next`
- React Router: `fumadocs-ui/provider/react-router`
- Tanstack: `fumadocs-ui/provider/tanstack`
- Waku: `fumadocs-ui/provider/waku`

```tsx
import { RootProvider } from "fumadocs-ui/provider/next";

<RootProvider
  search={{ enabled: true, hotKey: [...], preload: true }}
  theme={{ enabled: true }}
>
```

**SearchProps:**
- `enabled` (boolean, default: true)
- `preload` (boolean, default: true): Preload search dialog
- `hotKey`: Custom keyboard shortcuts (default: Meta/Ctrl + K)
- `SearchDialog`: Custom search dialog component
- `links`: Links shown when search is empty
- `options`: DefaultSearchDialogProps overrides

### Static Search API Route

```ts
// app/api/search/route.ts
import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/app/source";

export const { GET } = createFromSource(source);
```

### Custom Search Dialog

Subcomponents for building custom search UI:
`SearchDialog`, `SearchDialogOverlay`, `SearchDialogContent`, `SearchDialogHeader`, `SearchDialogInput`, `SearchDialogClose`, `SearchDialogIcon`, `SearchDialogList`, `SearchDialogFooter`

### useDocsSearch Hook

```ts
const search = useDocsSearch({ type: 'fetch', locale });
```

### Highlight Matches

Use `contentWithHighlights` and `renderHighlights` prop on `SearchDialogListItem`.
