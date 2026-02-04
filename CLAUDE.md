# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Prerequisites

- **Node.js:** >=24.13.0
- **pnpm:** 10.6.5 (enforced via `only-allow`)

## Project Overview

A pnpm monorepo containing signal-based state management and form management libraries for React:

| Package | Description |
|---------|-------------|
| `@owanturist/signal` | Core signal-based reactive state management with automatic dependency tracking |
| `@owanturist/signal-react` | React hooks integration (`useMonitor`, `useComputed`) using `useSyncExternalStore` |
| `@owanturist/signal-form` | Type-safe declarative form state management with validation support |

**Key Features:**
- Automatic dependency tracking via Monitor system
- Batched updates to prevent unnecessary re-renders
- Memory-safe subscriptions using WeakRef
- Zod-like schema validation support in forms
- React 18 and 19 compatibility

## Common Commands

```bash
pnpm install              # Install dependencies (pnpm required)
pnpm build                # Build all packages
pnpm build:minified       # Production build with terser minification
pnpm test                 # Run tests in watch mode
pnpm test:run             # Single test run
pnpm test:coverage        # Run tests with coverage
pnpm check:fix            # Fix linting and formatting issues
pnpm typecheck            # Type check all packages
pnpm size                 # Check bundle sizes
pnpm cs                   # Add changesets for versioning
pnpm docs:dev             # Run documentation site in dev mode
pnpm docs:build           # Build documentation site
pnpm docs:preview         # Preview production docs build
```

To run a single test file:
```bash
pnpm vitest run packages/signal/tests/signal.test.ts
```

## Architecture

### Package Structure
```
packages/
├── signal/           # Core: Signal, WritableSignal, ReadableSignal, batch, effect, untracked
├── signal-react/     # React: useMonitor, useComputed hooks
├── signal-form/      # Forms: FormUnit, FormShape, FormList, FormOptional, FormSwitch
└── tools/            # Internal utilities and type guards (private)
```

### Core Concepts

**Signal Package (`@owanturist/signal`):**
- `Signal<T>(value)` - Create writable signal with initial value
- `Signal<T>(getter)` - Create derived read-only signal
- `Signal<T>(getter, setter)` - Create bidirectional derived signal
- `effect(listener)` - Create reactive side effects
- `batch(execute)` - Batch multiple signal updates
- `untracked(fn)` - Read signals without creating dependencies
- `isSignal()`, `isDerivedSignal()` - Type guards
- Subpath export: `@owanturist/signal/monitor-factory` for advanced monitor usage

**React Package (`@owanturist/signal-react`):**
- `useMonitor()` - Get Monitor instance for manual signal tracking
- `useComputed(signal)` - Read signal value with automatic re-renders
- `useComputed(factory, deps?, options?)` - Compute derived values from signals
- `DependencyList` - Type for dependency arrays

**Form Package (`@owanturist/signal-form`):**
- `FormUnit(input, options)` - Single value with validation/transformation
- `FormShape(fields, options)` - Object/dictionary of forms
- `FormList(elements, options)` - Dynamic array of forms
- `FormOptional(enabled, element)` - Conditional form field
- `FormSwitch(kind, branches)` - Discriminated union form selection
- `ValidateStrategy` - Validation timing (`"onTouch"` | `"onChange"` | `"onSubmit"` | `"onInit"`)
- Type guards: `isSignalForm()`, `isFormUnit()`, `isFormShape()`, `isFormList()`, `isFormOptional()`, `isFormSwitch()`

### Build System
- **tsup** for bundling (dual CJS/ESM output with declarations)
- **Terser** for production minification
- Internal properties matching `^_[^_]\w+[^_]$` are mangled in production builds
- Each package has its own `tsup` build command extending root config

### Key Patterns
- `_internal/` directories contain implementation details not exported publicly
- Package entrypoints cannot import from `_internal` modules (enforced by Biome)
- Tests must import from `../src` only
- `useComputed` hook has exhaustive dependency checking configured
- WeakRef used for memory-safe signal subscriptions
- Test files located in `packages/*/tests/` directories

## Documentation Standards

All documentation content in `docs/content/` **must** follow the [Diataxis framework](.claude/skills/writing-documentation-with-diataxis/SKILL.md). Every documentation page must clearly belong to one of the four Diataxis types:

- **Tutorials** -- learning-oriented, guide the reader through doing something step-by-step
- **How-to guides** -- task-oriented, provide steps to solve a specific problem
- **Reference** -- information-oriented, describe the API surface accurately and completely
- **Explanation** -- understanding-oriented, clarify concepts and provide context

Do not mix types within a single page. When writing or reviewing documentation, use the Diataxis compass to classify content: (1) does it inform action or cognition? (2) does it serve acquisition or application? See the [writing-documentation-with-diataxis](.claude/skills/writing-documentation-with-diataxis/SKILL.md) skill for detailed guidance.

### API Reference docs/ Style Guide

API reference pages use these conventions. For fumadocs MDX syntax details see the [fumadocs skill](.claude/skills/fumadocs/SKILL.md); for twoslash annotations see the [twoslash skill](.claude/skills/twoslash/SKILL.md).

**Frontmatter:**
- Every page needs `title` and `description` in YAML frontmatter
- The `title` renders as the page heading; do **not** add a separate `# h1`

**Page structure:**
- Each API entry gets an `##` heading with the signature in inline code and a custom anchor: `` ## `Signal(initialValue, options?){:dart}` [#signal-factory] ``
- Custom anchors use the fumadocs `[#custom-id]` syntax (appended to the heading)
- A fenced code block with the full TypeScript signature immediately follows the heading
- A short prose description follows the signature block
- Parameters and return value are listed inside `<section className="typedef">` ... `</section>`

**Inside `<section className="typedef">` (mimics JSDoc conventions):**
- Parameters are unordered list items prefixed with `@param`: `` - `@param name: Type{:dart}` Description ``
- Nested option fields use dot notation: `` - `@param options?.compare?: null | Compare{:dart}` ``
- A horizontal rule `---` separates parameters from the return value
- Return value uses `@returns`: `` - `@returns Type{:dart}` Description ``

**Inline code language hints** (requires `inline: "tailing-curly-colon"` in rehypeCode config)**:**
- Use `` `Type{:dart}` `` for parameter/return signatures in prose (Dart-like highlighting for readable type annotations)
- Use `` `expression{:ts}` `` for inline TypeScript expressions in prose
- The `{:lang}` suffix is stripped from rendered output

**Tabbed code blocks:**
- Add `tab="Tab Name"` to consecutive fenced code blocks to group them into tabs: `` ```ts twoslash tab="Primitive" ``
- Tabs are created implicitly by consecutive fenced blocks with `tab` attributes -- no `<Tabs>`/`<Tab>` JSX wrapper needed
- Use twoslash annotations (`^?`, `// ---cut---`, etc.) for type-checked examples

**Callouts:**
- `<Callout>` for informational notes (default type is `info`)
- `<Callout type="warn">` for warnings
- Other types available: `error`, `success`, `idea`
- Place callouts inside the relevant `@param` list item when they relate to a specific parameter

**Shiki code annotations (transformers):**
- `// [!code ++]` / `// [!code --]` to highlight added/removed lines
- `// [!code highlight]` to highlight important lines
- `// [!code focus]` to focus on specific lines
- `// [!code word:Text]` to highlight specific words

**Code block meta options:**
- `` ```ts title="signal.ts" `` to add a filename header
- `` ```ts lineNumbers `` or `` ```ts lineNumbers=4 `` to show line numbers (optionally starting at N)
- `` ```package-install `` to auto-generate npm/pnpm/yarn/bun tabbed install commands

**Twoslash in code blocks:**
- Add `twoslash` meta to fenced blocks for type-checked examples: `` ```ts twoslash ``
- `^?` under a variable to show its inferred type inline
- `// ---cut---` to hide setup code above the cut line
- `// @filename: utils.ts` to create virtual multi-file examples with imports
- `// @errors: 2304` to expect and display specific TS errors
- `// @showEmit` / `// @showEmittedFile: index.d.ts` to display compiled output
- Compiler flags can be overridden per block: `// @target: esnext`, `// @strict: false`

**Heading modifiers:**
- `## Heading [#custom-id]` for custom anchor IDs
- `## Heading [!toc]` to hide a heading from the table of contents

**Available MDX components** (registered in this project):
- `<Callout>` -- alert boxes (`info`, `warn`, `error`, `success`, `idea`)
- `<Tabs>`/`<Tab>` -- explicit tabbed content when code-block tabs aren't sufficient
- `<Accordion>`/`<Accordions>` -- collapsible sections; supports `id` prop for deep linking via URL hash
- `<Steps>` -- numbered step-by-step procedural content (also available as CSS class `fd-steps`)
- `<Files>`/`<Folder>`/`<File>` -- file tree visualization
- `<ImageZoom>` -- click-to-zoom images for detailed diagrams
- `<Cards>`/`<Card>` -- grouped link cards for navigation
- `<include>./shared.mdx</include>` -- include reusable MDX fragments (fumadocs-mdx only)
- Twoslash popup components (`Popup`, `PopupContent`, `PopupTrigger`) are pre-configured for interactive type hovers

## Code Standards

- **Biome** for linting and formatting (not ESLint/Prettier)
- Explicit class member accessibility (public/private/protected)
- Use `Array<T>` syntax over `T[]`
- Double quotes, 2-space indentation, trailing commas
- No default switch clauses (enables TypeScript exhaustiveness checks)
- Strict TypeScript with `noUncheckedIndexedAccess`, `noImplicitReturns`

## React Support

Tests run against React 18.0.0 and 19.0.0 for compatibility. The `signal-react` package uses `use-sync-external-store` for React 18+ external store subscription.

## Release Process

Uses Changesets for versioning. Add changesets with `pnpm cs` before opening PRs.

## Available Skills

The following skills are available in [`.claude/skills/`](.claude/skills/):

### Development Skills

| Skill | Description |
|-------|-------------|
| [vitest](.claude/skills/vitest/SKILL.md) | Vitest testing framework - Jest-compatible API, mocking, coverage, fixtures |
| [typescript-advanced-types](.claude/skills/typescript-advanced-types/SKILL.md) | Advanced TypeScript type system - generics, conditional types, mapped types |
| [typescript-react-reviewer](.claude/skills/typescript-react-reviewer/SKILL.md) | Code reviewer for TypeScript + React 19 - anti-patterns, state management |
| [tdd-workflow](.claude/skills/tdd-workflow/SKILL.md) | Test-Driven Development workflow - RED-GREEN-REFACTOR cycle |
| [code-quality](.claude/skills/code-quality/SKILL.md) | Code correctness rules, avoiding over-engineering |
| [performance](.claude/skills/performance/SKILL.md) | Web performance optimization - Core Web Vitals, loading speed |
| [biome](.claude/skills/biome/SKILL.md) | Fast all-in-one linting/formatting toolchain (100x faster than ESLint) |
| [creating-changesets](.claude/skills/creating-changesets/SKILL.md) | Changesets workflow - version bumps, release notes, semver decisions |
| [fumadocs](.claude/skills/fumadocs/SKILL.md) | Fumadocs documentation framework - layouts, MDX, source API, theming, components |
| [twoslash](.claude/skills/twoslash/SKILL.md) | Twoslash markup for TypeScript code samples - type queries, completions, errors, cut markers |

### Utility Skills

| Skill | Description |
|-------|-------------|
| [skill-creator](.claude/skills/skill-creator/SKILL.md) | Create new skills with proper structure and packaging |
| [install-skill](.claude/skills/install-skill/SKILL.md) | Install skills from GitHub using `npx skills add` |
| [find-skills](.claude/skills/find-skills/SKILL.md) | Discover and install agent skills from the open ecosystem |
| [verify-skills](.claude/skills/verify-skills/SKILL.md) | Verify all skills are documented in CLAUDE.md |
| [api-documentation-generator](.claude/skills/api-documentation-generator/SKILL.md) | Generate comprehensive API documentation from code |
| [writing-documentation-with-diataxis](.claude/skills/writing-documentation-with-diataxis/SKILL.md) | Diataxis framework for technical docs - tutorials, how-to guides, reference, explanations |

### Marketing Skills

| Skill | Description |
|-------|-------------|
| [copywriting](.claude/skills/copywriting/SKILL.md) | Expert conversion copywriting for marketing pages |
| [product-marketing-context](.claude/skills/product-marketing-context/SKILL.md) | Create/maintain product marketing context document |

### Skill Usage

- **Install a skill:** `/install-skill owner/repo@skill`
- **Find skills:** `/find-skills [query]` or browse https://skills.sh/
- **Run tests:** `/vitest` for Vitest testing guidance
- **Code review:** `/typescript-react-reviewer` for React code review
- **TDD workflow:** `/tdd-workflow` for test-driven development
- **Changesets:** `/creating-changesets` for version bumps and release notes
- **Biome reference:** `/biome` for Biome configuration guidance (project already uses Biome via `pnpm check:fix`)

### Copywriting Resources

The copywriting skill includes reference materials:
- [Copy Frameworks](.claude/skills/copywriting/references/copy-frameworks.md) - Headline formulas and page structure templates
- [Natural Transitions](.claude/skills/copywriting/references/natural-transitions.md) - Transitional phrases for content flow

## Configuration Files

| File | Purpose |
|------|---------|
| `biome.jsonc` | Linting, formatting, and code quality rules |
| `tsconfig.json` | Shared TypeScript configuration |
| `tsup.config.ts` | Shared bundler configuration |
| `vite.config.ts` | Root Vitest configuration for monorepo testing |
| `.size-limit.mjs` | Bundle size checking configuration |
| `pnpm-workspace.yaml` | Workspace package definitions |
| `.claude/settings.local.json` | Local Claude Code permissions |
