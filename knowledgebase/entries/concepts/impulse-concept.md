---
id: impulse-concept
title: Impulse — what, how, and why
type: concept
packages:
  - react-impulse
status: accepted
owner: owanturist
last-reviewed: 2025-08-28
tags:
  - impulse
  - reactivity
  - state
  - core
diataxis: explanation
---

## Context and goals

Define the core idea of an `Impulse` in react-impulse. An `Impulse` is a small, reactive cell that holds a value and coordinates change propagation to dependents and subscribers.

### Goals:

- Provide a minimal, predictable abstraction for state with clear update semantics.
- Enable fine-grained reactivity: only recompute and notify when values effectively change.
- Compose into higher-level constructs without coupling to React internals.

### Non-goals:

- Replace every state management pattern.

## Design and rationale

### What is an Impulse

An `Impulse` is a small value container with predictable read/write semantics that uses compare semantics to notify dependents only on effective change. It’s similar to a signal/atom, but differs by explicit Scopes for dependency tracking and lifecycles and a framework‑agnostic core with thin adapters (e.g., React hooks). The Impulse owns its subscriber list, while a `Scope` attaches/detaches those subscriptions and drives lifecycles.

## What is a Scope

A `Scope` is a tiny lifecycle container passed to reads so dependencies can be tracked and cleaned up deterministically. Calling `impulse.getValue(scope)` records that read; when the impulse changes, the scope receives the update and forwards it to the hosting environment: React hooks enqueue a component re-render, while vanilla `subscribe` re-runs the listener. Disposing a scope removes all subscriptions at once, preventing leaks and keeping lifecycles isolated.

### Principles (small surface, opt-in power)

- Keep the API tiny: create, read, write. Avoid piling features into `Impulse` itself; push conveniences to helpers/adapters.
- No feature creep: new capabilities should layer on top (derived computations, React hooks) rather than expand the core.
- Opt-in implicit subscriptions: reading within a `Scope` records a dependency automatically.
- Explicit `Scope` passing gives control over lifetimes and cleanup; nothing subscribes by accident.
- Nested impulses are encouraged: an `Impulse` can store other `Impulse`s (and combinations). This creates reactive containers of reactive data and maximizes granularity.

### How it works (at a glance)

- Tracked reads: reads require a `Scope` (enforced by TypeScript); dependencies are tracked automatically, and React hooks/helpers pass the appropriate `Scope`.
- Compare-guided updates: writes trigger notifications only if the value changes by compare semantics to avoid redundant work.
- Dependency tracking: when a scoped computation reads an Impulse, a dependency edge is recorded.
- Batching: multiple writes within a batch coalesce into a single notification cycle, improving performance.
- Scopes: effects are tied to lifecycles via scopes; subscriptions are attached/detached by scopes and cleaned up deterministically.

### Granularity and lifecycles

- Per-Impulse lifecycle: each `Impulse` is its own tiny store with its own lifecycle.
- Render granularity: an update enqueues re-renders only in places where that specific `Impulse` was read within a `Scope`. Unread impulses don’t cause work even if they change.
- No global broadcasts: there is no single global store that emits on any change. There’s nothing to “filter out” as irrelevant—if an `Impulse` was read, it is relevant by definition of the dependency graph.
- Trade-off: fine-grained tracking avoids cascading re-renders typical of global stores, at the cost of a bit more per-dependency bookkeeping (edges and scope cleanup). Keep reads precise and use batching to minimize overhead.

### Values and compare semantics

- Prefer immutable values: an `Impulse` works best when its value is immutable. This keeps equality checks predictable and React-friendly.
- Compare function: use `ImpulseOptions.compare` to define “effective change.” When not provided, the default behaves like `Object.is`.
- Mutable values caveat: to force the update on every `setValue`, use a comparer that always reports “not equal,” e.g. `() => false`. This is generally discouraged — React will not play well with such values in practice.

### Mutability of the Impulse object (and why it’s fine with React)

- Mutable shell with a stable identity: the `Impulse` holds the current value and subscriptions and mutates those internals on `setValue`. React sees a change only when the stored value’s reference effectively changes (by compare; default `Object.is`). Equal/no-op writes don’t re-render.
- Fast write path is constant-time: compare → swap value → bump version → enqueue. Notifications run later and scale with dependents (O(k)).
- React integration (like `useRef` at the boundary): the container is mutable; the value is consumed immutably. Reads are pure; writes are scheduled and batched; adapters request updates only on effective change, so it plays well with Strict Mode and concurrent rendering.

### API contract

Type names: `Impulse<T>`, `ImpulseOptions<T>`, `Scope`.

- Factory overloads:
  - `Impulse<T>() => Impulse<undefined | T>`
  - `Impulse<T>(initialValue: T, options?: ImpulseOptions<T>) => Impulse<T>`

- Read/write:
  - `impulse.getValue(scope: Scope): T` — tracked read; requires a `Scope`.
  - `impulse.setValue(nextOrTransform): void` — accepts a value `T` or a setter function `(current: T, scope: Scope) => next`.

- Clone:
  - `impulse.clone(options?: ImpulseOptions<T>): Impulse<T>`
  - `impulse.clone((value: T, scope: Scope) => transformed, options?): Impulse<T>`

- Compare:
  - `ImpulseOptions<T>['compare']?: (left: T, right: T, scope: Scope) => boolean`
  - Not provided ⇒ uses strict `Object.is` equality; explicitly pass `null` to force the default strict equality even when cloning from a custom comparer.

### Why clone exists

Using one Impulse across many scopes and lifecycles is fully supported. Clone is useful when a separate container is desired: it creates an independent Impulse starting from the current value, with its own identity and bookkeeping, in a single, scope-free step.

- Fresh identity, no shared bookkeeping: the clone has no subscribers/dependencies, preventing cross-talk and keeping graphs precise.
- Carry or change compare: by default it carries the source compare; pass `options.compare`, or `null` to use strict `Object.is` equality.
- Optional transform: the transform overload allows tweaking the value on the way out (useful to ensure a new reference for nested mutables).
- Not a deep copy: the stored value reference is preserved unless transformed.

## Why it exists

- Precision: fine-grained invalidation beats coarse global state updates for performance and clarity.
- Composability: impulses can be combined and nested to compose complex fine-grained reactive states.
- Predictability: deterministic notification rules and explicit dependencies reduce incidental rerenders.

### Layering model (no React coupling)

- Core (framework-agnostic): impulses, compare semantics, dependency tracking, batching, and scopes. No React imports or reliance on React scheduling.
- Adapters (React integration): thin hooks that bridge the core to React lifecycles.
- Contract boundary: the core emits deterministic notifications when effective values change; adapters translate those into React updates without leaking React internals back into the core.
- Benefits: portability (works in Node/workers/tests), stability (less surface impacted by React changes), predictability (updates follow core semantics, not render heuristics).
