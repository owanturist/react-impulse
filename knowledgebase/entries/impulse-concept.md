---
title: Impulse — what, how, and why
type: concept
packages:
  - react-impulse
relates-to:
  - scope-concept
---

## Context and goals

Define the core idea of an `Impulse` in react-impulse.

### Goals

- Provide a minimal, predictable abstraction for state with clear update semantics.
- Enable fine-grained reactivity: only recompute and notify when values effectively change.
- Compose into higher-level constructs without coupling to React internals.

### Non-goals

- Replace every state management pattern.

## Design and rationale

### What is an Impulse

An `Impulse` is a small value container with predictable read/write semantics that uses compare semantics to notify dependents only on effective change. It’s similar to a signal/atom, but differs by explicit Scopes for dependency tracking and lifecycles and a framework‑agnostic core with thin adapters (e.g., React hooks). The Impulse owns its subscriber list, while a [`Scope`](./scope-concept.md) attaches/detaches those subscriptions and drives lifecycles.

### Why it exists

- Precision: fine-grained invalidation beats coarse global state updates for performance and clarity.
- Composability: impulses can be combined and nested to compose complex fine-grained reactive states.
- Predictability: deterministic notification rules and explicit dependencies reduce incidental rerenders.

### Fine-grained vs coarse-grained reactivity

Traditional state management broadcasts all changes to all consumers, requiring filtering at consumption time. Impulses invert this: dependency graphs are precise, and notifications target only actual dependents.

- **Coarse-grained**: global state container notifies all subscribers on any change; consumers filter for relevance.
- **Fine-grained**: individual `Impulse` containers notify only direct dependents; no filtering required.

Example granularity difference:

```ts
// Coarse: single container, broadcast on any field change
const state = Impulse({
  name: "Alice",
  age: 30,
})

// Fine: separate containers, targeted notifications per field
const user = {
  name: Impulse("Alice"),
  age: Impulse(30),
}
```

In the fine-grained case, updating `user.age` notifies only scopes that read `user.age`, not those reading `user.name`.

### Principles

- Keep the API tiny: create, read, write. Avoid piling features into `Impulse` itself; push conveniences to helpers/adapters.
- No feature creep: new capabilities should layer on top (derived computations, React hooks) rather than expand the core.
- Opt-in implicit subscriptions: reading within a `Scope` records a dependency automatically.
- Explicit `Scope` passing gives control over lifetimes and cleanup; nothing subscribes by accident.
- Fine-grained structure like `{ name: Impulse("Alice"), age: Impulse(30) }` enables precise updates where only affected properties trigger re-renders.
- Nested impulses are encouraged: an `Impulse` can store other `Impulse`s (and combinations). This creates reactive containers of reactive data and maximizes granularity.

### How it works

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

### Mutability of the Impulse object and why it’s fine with React

- Mutable shell with a stable identity: the `Impulse` holds the current value and subscriptions and mutates those internals on `setValue`. React sees a change only when the stored value’s reference effectively changes (by compare; default `Object.is`). Equal/no-op writes don’t re-render.
- Fast write path is constant-time: compare → swap value → bump version → enqueue. Notifications run later and scale with dependents (O(k)).
- React integration (like `useRef` at the boundary): the container is mutable; the value is consumed immutably. Reads are pure; writes are scheduled and batched; adapters request updates only on effective change, so it plays well with Strict Mode and concurrent rendering.

### Layering model (no React coupling)

- Core (framework-agnostic): impulses, compare semantics, dependency tracking, batching, and scopes. No React imports or reliance on React scheduling.
- Adapters (React integration): thin hooks that bridge the core to React lifecycles.
- Contract boundary: the core emits deterministic notifications when effective values change; adapters translate those into React updates without leaking React internals back into the core.
- Benefits: portability (works in Node/workers/tests), stability (less surface impacted by React changes), predictability (updates follow core semantics, not render heuristics).

## API contract

### Factory

```ts
Impulse<T>(): Impulse<undefined | T>
Impulse<T>(initialValue: T, options?: ImpulseOptions<T>): Impulse<T>
```

Creates a new impulse. The value is tracked for changes and notifies dependents only on effective change.

### Read/write

```ts
impulse.getValue(scope: Scope): T
impulse.setValue(nextOrTransform: T | ((current: T, scope: Scope) => T)): void
```

`getValue` is a tracked read (requires a scope, see [scope-factories](./scope-factories.md)). `setValue` accepts a value or a setter function.

### Clone

```ts
impulse.clone(options?: ImpulseOptions<T>): Impulse<T>
impulse.clone(transform: (value: T, scope: Scope) => T, options?): Impulse<T>
```

Creates a new, independent impulse with the current value (optionally transformed). The clone has no shared bookkeeping or dependencies.

### Compare

```ts
ImpulseOptions<T>['compare']?: (left: T, right: T, scope: Scope) => boolean
```

Defines effective change. If not provided, uses strict `Object.is` equality. Pass `null` to force default equality even when cloning from a custom comparer.

### Why clone exists

Using one Impulse across many scopes and lifecycles is fully supported. Clone is useful when a separate container is desired: it creates an independent Impulse starting from the current value, with its own identity and bookkeeping, in a single, scope-free step.

- Fresh identity, no shared bookkeeping: the clone has no subscribers/dependencies, preventing cross-talk and keeping graphs precise.
- Carry or change compare: by default it carries the source compare; pass `options.compare`, or `null` to use strict `Object.is` equality.
- Optional transform: the transform overload allows tweaking the value on the way out (useful to ensure a new reference for nested mutables).
- Not a deep copy: the stored value reference is preserved unless transformed.
