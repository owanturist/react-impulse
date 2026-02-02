# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A pnpm monorepo containing state management and form management libraries for React:
- `@owanturist/signal` - Core signal-based state management
- `@owanturist/signal-react` - React hooks integration (useMonitor, useComputed)
- `@owanturist/signal-form` - Type-safe declarative form state management

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
```

To run a single test file:
```bash
pnpm vitest run packages/signal/tests/signal.test.ts
```

## Architecture

### Package Structure
```
packages/
├── signal/           # Core: Signal, WritableSignal, ReadableSignal, batch, effect
├── signal-react/     # React: useMonitor, useComputed hooks
├── signal-form/      # Forms: FormUnit, FormShape, FormList, FormOptional, FormSwitch
└── tools/            # Internal utilities and type guards (private)
```

### Build System
- **tsup** for bundling (dual CJS/ESM output with declarations)
- Internal properties matching `^_[^_]\w+[^_]$` are mangled in production builds
- Each package has its own `tsup` build command

### Key Patterns
- `_internal/` directories contain implementation details not exported publicly
- Package entrypoints cannot import from `_internal` modules
- Tests must import from `../src` only
- `useComputed` hook has exhaustive dependency checking configured

## Code Standards

- **Biome** for linting and formatting (not ESLint/Prettier)
- Explicit class member accessibility (public/private/protected)
- Use `Array<T>` syntax over `T[]`
- Double quotes, 2-space indentation, trailing commas
- No default switch clauses (enables TypeScript exhaustiveness checks)

## React Support

Tests run against React 18.0.0 and 19.0.0 for compatibility.

## Release Process

Uses Changesets for versioning. Add changesets with `pnpm cs` before opening PRs.

## Skill Installation

Use `/install-skill owner/repo@skill` to install skills locally. This handles symlink removal and proper file organization automatically.
