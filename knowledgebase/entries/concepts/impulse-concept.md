---
id: impulse-concept
title: Impulse — what, how, and why
type: concept
packages:
  - react-impulse
status: accepted
owner: owanturist
last-reviewed: 2025-08-27
tags:
  - impulse
  - reactivity
  - state
  - core
diataxis: explanation
---

## Context and goals

Define the core idea of an `Impulse` in react-impulse. An `Impulse` is a small, focused reactive cell that holds a value and coordinates change propagation to dependents and subscribers.

### Goals:

- Provide a minimal, predictable abstraction for state with clear update semantics.
- Enable fine-grained reactivity: only recompute and notify when values effectively change.
- Compose into higher-level constructs without coupling to React internals.

### Non-goals:

- Replace every state management pattern.

## Design and rationale

### What it is

- An `Impulse` is a value-holding unit with read/write operations; change propagation is implicit when values are read within a `Scope` (no explicit subscribe on `Impulse`).
- It remembers which computations read it and makes them update when it changes.

### Principles (small surface, opt-in power)

- Keep the API tiny: create, read, write. Avoid piling features into `Impulse` itself; push conveniences to helpers/adapters.
- No feature creep: new capabilities should layer on top (derived computations, React hooks) rather than expand the core.
- Opt-in implicit subscriptions: reading within a `Scope` records a dependency automatically.
- Explicit `Scope` passing gives control over lifetimes and cleanup; nothing subscribes by accident.
- Nested impulses are encouraged: an `Impulse` can store other `Impulse`s (and combinations). This creates reactive containers of reactive data and maximizes granularity.

### How it works (at a glance)

- Implicit subscription: reads require a `Scope` (enforced by TypeScript) and are tracked by default.
- Compare-guided updates: writes trigger notifications only if the value changes by compare semantics to avoid redundant work.
- Dependency tracking: when a scoped computation reads an Impulse, a dependency edge is recorded.
- Batching: multiple writes within a batch coalesce into a single notification cycle, improving performance.
- Scopes: effects are tied to lifecycles via scopes; subscriptions are managed internally and cleaned up deterministically.

### Granularity and lifecycles

- Per-Impulse lifecycle: each `Impulse` is its own tiny store with its own lifecycle.
- Render granularity: an update enqueues re-renders only in places where that specific `Impulse` was read within a `Scope`. Unread impulses don’t cause work even if they change.
- No global broadcasts: there is no single global store that emits on any change. There’s nothing to “filter out” as irrelevant—if an `Impulse` was read, it is relevant by definition of the dependency graph.

### Values and compare semantics

- Prefer immutable values: an `Impulse` works best when its value is immutable. This keeps equality checks predictable and React-friendly.
- Compare function: use `ImpulseOptions.compare` to define “effective change.” When not provided, the default behaves like `Object.is`.
- Mutable values caveat: mutable values can be stored with `compare: () => true` to always emit on set attempts, but this is discouraged—React will not play well with such values in practice.

### Mutability of the Impulse object (and why it’s fine with React)

- Mutable shell with a stable identity: the `Impulse` holds the current value and subscriptions and mutates those internals on `setValue`. React sees a change only when the stored value’s reference effectively changes (by compare; default `Object.is`). Equal/no-op writes don’t re-render.
- Fast write path is constant-time: compare → swap value → bump version → enqueue. Notifications run later and scale with dependents (O(k)).
- React integration (like `useRef` at the boundary): the container is mutable; the value is consumed immutably. Reads are pure; writes are scheduled and batched; adapters request updates only on effective change, so it plays well with Strict Mode and concurrent rendering.

### Contract

Type names: `Impulse<T>`, `ImpulseOptions<T>`, `Scope`.

- Create:
  - `Impulse<T>(initialValue: T, options?: ImpulseOptions<T>) => Impulse<T>`

- Read/write:
  - `impulse.getValue(scope: Scope): T` — tracked read; requires a `Scope`
  - `impulse.setValue(nextOrTransform): void` — changes value; accepts a value or a setter function `(current: T, scope: Scope) => next`

- Clone:
  - `impulse.clone(options?: ImpulseOptions<T>): Impulse<T>`
  - `impulse.clone((value: T, scope: Scope) => transformed, options?): Impulse<T>`

- Compare:
  - `ImpulseOptions<T>['compare']?: (left: T, right: T) => boolean` (defaults to `Object.is` when not provided)

## Why it exists

- Precision: fine-grained invalidation beats coarse global state updates for performance and clarity.
- Composability: impulses can be combined and nested to compose complex fine-grained reactive states.
- Predictability: deterministic notification rules and explicit dependencies reduce incidental rerenders.

### Layering model (no React coupling)

- Core (framework-agnostic): impulses, compare semantics, dependency tracking, batching, and scopes. No React imports or reliance on React scheduling.
- Adapters (React integration): thin hooks that bridge the core to React lifecycles.
- Contract boundary: the core emits deterministic notifications when effective values change; adapters translate those into React updates without leaking React internals back into the core.
- Benefits: portability (works in Node/workers/tests), stability (less surface impacted by React changes), predictability (updates follow core semantics, not render heuristics).

## TODO

- [x] mention the mutable nature of the Impulse, why it is necessary and briefly how it manages to work fine with React
- [ ] as a consequence of previous point it would make sense to explain by .clone method is necessary
- [ ] explain the scope in more details: "What is a Scope? Why it matters?"
- [ ] mention Granularity vs. performance trade-offs: This avoids the cascading re-renders typical of global stores, at the cost of slightly more bookkeeping per dependency.
- [ ] Terminology alignment: Some readers may conflate Impulse with Signal or Atom. A line acknowledging that (“An Impulse is similar to a signal/atom, but with explicit Scopes and layering…”) can reduce friction.
- [ ] add: A Scope is a container object that groups reactive reads together. It doesn’t execute code; you pass it into reads so that dependencies can be tracked and cleaned up deterministically.
