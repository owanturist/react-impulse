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
