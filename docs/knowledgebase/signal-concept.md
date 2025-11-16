---
title: Impulse — what, how, and why
type: concept
packages:
  - react-impulse
relates-to:
  - monitor-concept
  - compare-concept
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

An `Impulse` is a small value container with predictable read/write semantics that uses compare semantics to notify dependents only on effective change. It’s similar to a signal/atom, but differs by explicit Scopes for dependency tracking and lifecycles and a framework‑agnostic core with thin adapters (e.g., React hooks). The Impulse owns its subscriber list, while a [`Scope`](./monitor-concept.md) attaches/detaches those subscriptions and drives lifecycles.

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

### Trade-offs

- Fine-grained precision vs. setup overhead: Precise dependency tracking avoids cascading re-renders but requires more bookkeeping (edges and scope cleanup). Keep reads precise and use batching to minimize overhead.
- Invariant: Reads without a `Scope` argument throw a runtime error; reads with an invalid scope are untracked.
- Invariant: `Impulse` identity is stable; mutations are internal and do not affect React reconciliation unless the value changes by compare.

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

### Values and compare semantics

- Prefer immutable values: an `Impulse` works best when its value is immutable. This keeps equality checks predictable and React-friendly.
- Compare function: use `ImpulseOptions.compare` to define “effective change.” When not provided, the default behaves like `Object.is`. The compare function is called when setting a new value to determine if it differs from the current one.
- Mutable values caveat: to force the update on every `setValue`, use a comparer that always reports “not equal,” e.g. `() => false`. This is generally discouraged — React will not play well with such values in practice.

> [!WARNING] Mutable values caveat
> To force the update on every `setValue`, use a comparer that always reports "not equal," e.g. `() => false`. This is generally discouraged — React will not play well with such values in practice.

### Mutability of the Impulse object and why it’s fine with React

- Mutable shell with a stable identity: the `Impulse` holds the current value and subscriptions and mutates those internals on `setValue`. React sees a change only when the stored value’s reference effectively changes (via the compare function; default `Object.is`). Equal/no-op writes don’t re-render.
- Stable identity prevents unnecessary re-renders in React's diffing algorithm.
- Fast write path is constant-time: compare → swap value → bump version → enqueue. Notifications run later and scale with dependents (`O(k)`, where `k` is the number of dependents).
- React integration (like `useRef` at the boundary): the container is mutable; the value is consumed immutably. Reads are pure; writes are scheduled and batched; adapters request updates only on effective change, so it plays well with Strict Mode and concurrent rendering.

### Layering model (no React coupling)

- Core (framework-agnostic): impulses, compare semantics, dependency tracking, batching, and scopes. No React imports or reliance on React scheduling.
- Adapters (React integration): thin hooks that bridge the core to React lifecycles.
- Contract boundary: the core emits deterministic notifications when effective values change; adapters translate those into React updates without leaking React internals back into the core.
- Benefits: portability (works in Node/workers/tests), stability (less surface impacted by React changes), predictability (updates follow core semantics, not render heuristics).

## API contract

### Factory

```ts
Impulse<T>(initialValue: T, options?: ImpulseOptions<T>): Impulse<T>
```

**Parameters:**

- **`initialValue`**: The initial value for the Impulse.
- **`options?.compare?`** (`null | `[`Compare<T>`](./compare-concept.md), default: `Object.is`): The compare function that determines whether a new value replaces the current one. Prevents unnecessary updates for better performance. Pass `null` to explicitly use the default.

**Returns:** A new Impulse with an initial value.

```ts
const count = Impulse(0) // Impulse<number>
console.log(count.getValue(scope)) // 0
```

By specifying the `options.compare` function the impulse can avoid unnecessary updates based on custom equality semantics:

```ts
const counter = Impulse(
  { count: 0 },
  {
    compare: (left, right) => left.count === right.count,
  },
)

const initial = counter.getValue(scope)

counter.setValue({ count: 0 }) // same count => no update, no notifications
console.log(counter.getValue(scope) === initial) // true

counter.setValue({ count: 1 }) // different count => update, notifications sent
console.log(counter.getValue(scope) === initial) // false
```

---

There is a shortcut overload for no initial value `Impulse<undefined | T>(undefined)`:

```ts
Impulse<T>(): Impulse<undefined | T>
```

**Returns:** A new Impulse with an initial value of `undefined` but type of `undefined | T`.

```ts
const impulse = Impulse<string>() // Impulse<undefined | string>
console.log(impulse.getValue(scope)) // undefined
```

### Interface `ReadableImpulse`

Provides reactive read-only access to impulse values. This primitive interface allows user-defined data structures to implement just `getValue(scope)` and be used interchangeably with `Impulse` instances in any API that accepts readable impulses. By keeping the read contract minimal, it enables diverse implementations while ensuring consistent dependency tracking semantics.

#### `getValue`

```ts
getValue(scope: Scope): T
```

Reads the current reactive value. The provided scope determines whether this read is tracked for dependency management or performed untracked.

**Parameters:**

- **`scope`**: The scope that controls whether this read records a dependency (tracked) or not (untracked).

**Returns:** The current value.

```ts
class Counter implements ReadableImpulse<number> {
  private readonly count = Impulse(0)

  getValue(scope: Scope): number {
    return this.count.getValue(scope)
  }
}

const impulse = Impulse(42) satisfies ReadableImpulse<number>
const counter = new Counter() satisfies ReadableImpulse<number>

function sum(
  scope: Scope,
  left: ReadableImpulse<number>,
  right: ReadableImpulse<number>,
): number {
  return left.getValue(scope) + right.getValue(scope)
}
```

### Interface `WritableImpulse`

Provides reactive write-only access to impulse values. This primitive interface allows user-defined data structures to implement just `setValue(value)` and be used interchangeably with `Impulse` instances in any API that accepts writable impulses. By keeping the write contract minimal, it enables diverse implementations while ensuring consistent update notification patterns.

#### `setValue`

```ts
setValue(value: T): void
```

Updates the reactive value and notifies all consumers that depend on this impulse. This triggers reactive updates throughout the system, causing any scopes that have read this impulse to be notified of the change.

**Parameters:**

- **`value`**: The new value to set.

**Returns:** `void` (mutable operation).

```ts
class Counter implements WritableImpulse<number> {
  private readonly count = Impulse(0)

  setValue(value: number): void {
    this.count.setValue(value)
  }
}

const impulse = Impulse(42) satisfies WritableImpulse<number>
const counter = new Counter() satisfies WritableImpulse<number>

function reset(
  left: ReadableImpulse<number>,
  right: ReadableImpulse<number>,
): void {
  left.setValue(0)
  right.setValue(0)
}
```

### Interface `ReadonlyImpulse`

Extends `ReadableImpulse<T>` to provide read access plus cloning capabilities for creating independent copies.

#### `clone`

> [!NOTE] Why `clone` exists
> Using one Impulse across many scopes and lifecycles is fully supported. Clone is useful when a separate container is desired: it creates an independent Impulse starting from the current value, with its own identity and bookkeeping, in a single, scope-free step.
>
> - Fresh identity, no shared bookkeeping: the clone has no subscribers/dependencies, preventing cross-talk and keeping graphs precise.
> - Carry or change compare: by default it carries the source compare; pass `options.compare`, or `null` to use strict `Object.is` equality.
> - Optional transform: the transform overload allows tweaking the value on the way out (useful to ensure a new reference for nested mutables).
> - Not a deep copy: the stored value reference is preserved unless transformed.

```ts
clone(options?: ImpulseOptions<T>): Impulse<T>
```

Creates a new, independent impulse with the current value. The clone has no shared bookkeeping or dependencies.

**Parameters:**

- **`options?.compare?`** (`null | `[`Compare<T>`](./compare-concept.md), default: `this.options.compare`): The compare function for the new impulse. If not provided, it inherits the compare function from the original impulse. When set to `null`, the default `Object.is` behavior is used.

**Returns:** A new `Impulse<T>` instance.

```ts
const source = Impulse(42)
const copy = source.clone()

copy.setValue(100)

console.log(source.getValue(scope)) // 42
console.log(copy.getValue(scope)) // 100
```

---

```ts
clone(transform: (value: T, scope: Scope) => T, options?: ImpulseOptions<T>): Impulse<T>
```

Creates a new, independent impulse with the transformed value. It is handy for cloning mutable objects, e.g. other Impulses. The clone has no shared bookkeeping or dependencies.

**Parameters:**

- **`transform`**: Function to transform the value before cloning. It receives the current value and the untracked scope.
- **`options?.compare?`** (`null | `[`Compare<T>`](./compare-concept.md), default: `this.options.compare`): The compare function for the new impulse. If not provided, it inherits the compare function from the original impulse. When set to `null`, the default `Object.is` behavior is used.

**Returns:** A new `Impulse<T>` instance.

```ts
const source = Impulse([Impulse(1), Impulse(2), Impulse(3)])
const shallowCopy = source.clone()
const deepCopy = source.clone((value) => {
  return value.map((impulse) => impulse.clone())
})

source.getValue(scope).at(0).setValue(100)
console.log(shallowCopy.getValue(scope).at(0).getValue(scope)) // 100
console.log(deepCopy.getValue(scope).at(0).getValue(scope)) // 1
```

### Interface `Impulse`

Combines read and write capabilities, extending both `ReadonlyImpulse<T>` and `WritableImpulse<T>`.

#### `setValue`

```ts
setValue(valueOrTransform: T | ((currentValue: T, scope: Scope) => T)): void
```

Updates the reactive value, either directly or through a transformation function. If the new value differs from the current value (according to the compare function), dependent scopes are notified.

**Parameters:**

- **`valueOrTransform`**: Either a new value of type `T`, or a function that transforms the current value and the untracked scope.

**Returns:** `void` (mutable operation).

```ts
const counter = Impulse(0)

counter.setValue(42) // Direct update
counter.setValue((current) => current + 1) // Transform update

console.log(counter.getValue(scope)) // 43
```
