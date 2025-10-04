---
title: Derived Impulse
type: concept
packages:
  - react-impulse
relates-to:
  - impulse-concept
  - scope-concept
---

## Context and goals

Define the idea of a `DerivedImpulse` in react-impulse, focusing on its design, lifecycle, and memory safety considerations.

### Goals

- Define what a `DerivedImpulse` is and how it differs from a regular `Impulse`
- Explain the lifecycle and dependency tracking of derived impulses
- Detail the necessity and implementation of `WeakRef` for internal scope tracking
- Illustrate the flow with test cases and cross-references

### Non-goals

- Repeating the full [`Impulse`](./impulse-concept.md) or [`Scope`](./scope-concept.md) concepts

## Design and rationale

### What is a DerivedImpulse

A `DerivedImpulse` is a reactive computation that derives its value from one or more source impulses. Unlike a regular `Impulse`, a derived impulse does not store a user-assigned value, but caches the most recently computed derived value. This value is only recomputed when dependencies change and triggers a flush; repeated `.getValue(scope)` calls return the cached value as long as dependencies are unchanged. The Derived Impulse owns its subscriber list, while a [`Scope`](./scope-concept.md) attaches/detaches those subscriptions and drives lifecycles. Internal dependency tracking is managed via an internal `Scope`.

### Why it exists

- Precision: derived impulses enable fine-grained reactivity by only recomputing when source impulses change, avoiding unnecessary work.
- Composability: they can be composed from multiple source impulses, allowing for complex reactive relationships.
- Encapsulation: derived impulses encapsulate their logic and dependencies, promoting better separation of concerns.

### Principles

- API symmetry: derived impulses expose the same API surface as regular impulses (read and, if writable, write), allowing them to be used interchangeably in most code.
- Caching: derived impulses cache their computed value and only recompute when dependencies change, improving performance.
- Lazy evaluation: the derived value is computed on first read and only when necessary, avoiding unnecessary computations.

### How it works

- When created, a derived impulse owns an internal scope (not exposed to users).
- On first read, it computes its value by running the getter under this scope, tracking all source impulses read.
- The internal scope is attached as an emitter to each source impulse it reads.
- When a source impulse changes, it schedules the internal scope to flush and recompute the derived value.
- If the derived impulse becomes unreachable, its internal scope may remain referenced by dependencies, potentially causing a memory leak unless handled by GC.

#### Why WeakRef is necessary for memory safety

Unlike scopes created by [scope factories](./scope-factories.md), which provide explicit or automatic cleanup tied to a well-defined lifecycle, the internal scope of a derived impulse has no such lifecycle hook or cleanup API. When a derived impulse becomes unreachable, its internal scope may remain referenced by dependencies, becoming a "dead scope." There is no reliable way to auto-flush or clean up this scope at the exact moment the derived impulse is collected, because JavaScript provides no hook for object finalization. Exposing a `.destroy()` or similar method would break API symmetry with regular impulses, so the design relies on `WeakRef` to allow garbage collection to eventually clean up these dead scopes safely.

In practice, if a derived impulse becomes unreachable while its internal scope is still tracked by a source, the dead scope could remain attached until the next source update, which will flush all tracked scopes (including dead ones). If the source is not updated for a long time, the dead scope could persist, but `WeakRef` ensures it can be collected by the GC when possible.

**Test case illustration**:

This flow is illustrated by the test case `"cleanups the WeakRef"`:

```typescript
const source = Impulse(0)
let derived: null | ReadonlyImpulse<Counter> = Impulse((scope) => ({
  count: source.getValue(scope),
}))

expect(derived.getValue(scope)).toStrictEqual({ count: 0 })
expect(source).toHaveEmittersSize(1)
expect(derived).toHaveEmittersSize(0)

derived = null

expect(source).toHaveEmittersSize(1)

await waitFor(() => {
  expect(source).toHaveEmittersSize(0)
})
```

This test shows that when the derived impulse becomes unreachable, the internal scope is eventually cleaned up by the garbage collector, and the source impulse no longer holds a reference to it.

## API contract

**API symmetry:** Derived impulses expose the same API surface as regular impulses (read and, if writable, write), so they can be used interchangeably in most code. The main differences are in value storage (derived vs. user-assigned) and clone behavior.

### Factory

```ts
Impulse<T>(getter: ReadableImpulse<T> | ((scope: Scope) => T), options?: ImpulseOptions<T>): ReadonlyImpulse<T>
Impulse<T>(getter: ReadableImpulse<T> | ((scope: Scope) => T), setter: WritableImpulse<T> | ((value: T, scope: Scope) => void), options?: ImpulseOptions<T>): Impulse<T>
```

Creates a derived impulse from a getter (and optional setter). The value is cached and only recomputed when dependencies change.

### Read/write

```ts
derived.getValue(scope: Scope): T
// If writable:
derived.setValue(nextOrTransform: T | ((current: T, scope: Scope) => T)): void
```

`getValue` returns the cached derived value; only recomputes when dependencies change and the new value differs. If writable, `setValue` delegates to the provided setter or writable impulse.

### Clone

```ts
derived.clone(options?: ImpulseOptions<T>): Impulse<T>
derived.clone(transform: (value: T, scope: Scope) => T, options?): Impulse<T>
```

Creates a regular impulse whose value is the current derived value at the moment of cloning. The clone is independent and does not track dependencies or recompute.

### Compare

```ts
ImpulseOptions<T>['compare']?: (left: T, right: T, scope: Scope) => boolean
```

Defines effective change. If not provided, uses strict `Object.is` equality. Pass `null` to force default equality even when cloning from a custom comparer.

### getter/setter types

- The `getter` can be a function `(scope: Scope) => T` or any object implementing `.getValue(scope)` (a `ReadableImpulse`).
- The `setter` (for writable derived impulses) can be a function `(value: T, scope: Scope) => void` or any object implementing `.setValue(value: T)` (a `WritableImpulse`).

### Notification semantics

Listeners are notified only when the derived value changes: when any source impulse emits (dependency update), the derived impulse recomputes its value. If the new value is different from the previous (per `.compare`), listeners are notified; otherwise, no notification is sent.
