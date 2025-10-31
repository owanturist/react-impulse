---
title: Scope — lifecycle, tracking, and scheduling in depth
type: concept
packages:
  - react-impulse
relates-to:
  - impulse-concept
  - scope-factories
---

## Context and goals

Define the mental model of `Scope` in react-impulse, invariants, and how Scopes interact with Impulses.

### Goals

- Define what a Scope is and isn’t (no global scheduler, no implicit React coupling).
- Detail how reads are tracked, how updates are scheduled, and how cleanup works.
- Explain the role of `Scope` and the `ScopeEmitter`, including `WeakRef`-based edges.
- Cover tracked vs non-tracking scopes.

### Non-goals

- Re-describing Impulse in depth (see [impulse-concept](./impulse-concept.md)).
- Providing creation recipes (see [scope-factories](./scope-factories.md)).

## Design and rationale

### What is a Scope

A `Scope` is the core primitive for lifecycle management and dependency tracking in react-impulse. It enables precise, automatic tracking of reads, deterministic scheduling of updates, and memory-safe cleanup, forming the foundation for all reactivity and batching in the library.

### Why it exists

- Stale dependencies from conditional reads: if dependency lists are not rebuilt each run, subscriptions may persist to unused dependencies and miss new ones.
- Manual subscriptions are error-prone: explicit attach/detach logic for every impulse on every run is difficult to maintain and can leak.
- Global listeners over-notify: broadcasting on any change forces all receivers to re-check, causing wasted work and jank.

Scope solves these by automatically tracking only what is read, flushing and rebuilding edges on each run, and notifying only affected scopes.

#### Motivation: From Implicit to Explicit Scope

Originally, react-impulse managed the current scope implicitly: scope factories would ensure a scope was injected, but this was handled behind the scenes, and `getValue()` took no arguments. The API looked clean and ergonomic, as users never had to think about scopes directly.

However, this implicitness led to real-world issues. Impulses are often used to power internal state within custom data structures, which may expose a semantic API that eventually calls `.getValue()`. Because the presence of impulses was hidden, it became difficult to know whether a given call site was within a scope or not. This led to subtle bugs: if a reactive scope was not injected, the non-tracking scope fallback was used, and the UI would silently stop reacting to impulse updates. Conversely, if a custom data structure replaced impulses with something else, unnecessary scope injection could occur, leading to wasted work.

The only reliable way to enforce correct injection was to make scope passing explicit. This is why `getValue` now takes the scope as an argument. By making the scope explicit at the API boundary, TypeScript ensures that a scope is always provided.

This shift to explicit scope passing solved both correctness and ergonomics issues, making the reactive system robust and predictable in complex applications.

### Principles

- Do not expose Scope creation directly: consumers always use factories.
- Do not retain dependencies across runs: flush and rebuild edges each run.
- Do not broadcast: only notify scopes that previously read an affected impulse.
- Support any-to-many edges: an impulse can be read by many scopes, and a scope can read many impulses.
- User facing API does not distinguish between tracked and non-tracking scopes.

### How it works

Scope addresses stale dependency issues from conditional reads by rebuilding the dependency tracklist after each flush. The dependency graph always reflects what was actually read in the last successful run; conditional reads are safe because edges are rebuilt after each flush.

**Invariants:**

- Tracking occurs only when a scope is tracking (not the non-tracking scope) and is passed to `getValue(scope)`.
- Flushing a scope clears all prior dependency edges; the next run recomputes them from scratch.
- The version increments on flush, enabling memoized selectors to detect that “the world changed.” The version is per-emitter, not global.

### Flushing

Flushing refers to a precise, internal cleanup-and-version-bump sequence performed on a scope’s emitter before re-running user code:

1. Detach: the emitter removes itself from every impulse it was attached to (calls `_detachFromAll`).
2. Bump version: the emitter increments its internal version passed to selectors/subscribers (`_getVersion` reflects this), which is threaded into the `scope.version`.
   > The internal version counter increments modulo a large integer; occasional wrap-around is harmless because consumers compare versions only for equality across consecutive runs.
3. Clear edge set: the emitter’s bookkeeping of attachments is cleared so the next run can re-attach only to dependencies actually read this time.

Flushing before emitting ensures that if a derived computation momentarily resubscribes to its sources while computing a value that compares equal, duplicate edges are not accumulated and re-triggering does not occur within the same frame. Combined with per-frame de-duplication, each emitter runs at most once per schedule frame.

**Effects of flushing:**

- Prevents stale dependencies: conditional reads are safe; edges are rebuilt on the next run.
- Enables memoization by version: consumers that cache by `_getVersion` can cheaply detect changes in the dependency world.
- Avoids re-subscription loops: because detach happens before emit, derived chains do not ping-pong on equal values.

**Example:**

- First run reads `cat` and `mouse` → emitter attaches to `cat` and `mouse`.
- `cat.setValue` schedules this emitter. On schedule, it flushes (detach and version++).
- Re-run reads only `mouse` (branch change) → emitter attaches only to `mouse` now; changes in `cat` no longer re-run this scope.

### Motivation and use cases for non-tracking scopes

The primary purpose of a Scope is to provide reactivity to read operations: when a value is read within a reactive Scope, future changes to that value will trigger the appropriate reactions (such as re-renders or effect executions). However, there are many scenarios where reactivity is not needed — where only the current value is required, and future updates are irrelevant.

A non-tracking scope is designed for these cases. It allows reading impulse values without establishing any dependency or subscription. This is useful for:

- **User interactions:** Click handlers, keyboard/mouse events, or other UI interactions that only need the value at the moment of the event.
- **Async operations:** Reading a value to initiate an asynchronous process (e.g., sending a network request), where future changes are irrelevant to the operation.
- **Initialization:** Extracting a value once to initialize state or compute a payload, with no need to react to subsequent updates.
- **One-off computations:** Any logic that needs a snapshot of the current value but does not require ongoing reactivity.

Using a non-tracking scope in these situations avoids unnecessary dependency tracking and resource usage. Even if a regular (reactive) scope is used in these cases, the application will still function correctly — there will simply be some redundant tracking, but no impact on business logic or correctness.

### Edge representation

Each impulse tracks its subscribers as a `Set<WeakRef<ScopeEmitter>>`. On `getValue(scope)`, the impulse adds a weak reference to the scope's emitter. This use of `WeakRef` ensures that unused scopes — specifically, the internal scopes of unreachable [derived impulses](./derived-impulse-concept.md) — can be garbage collected, preventing memory leaks without manual cleanup.

### Scheduling and batching

Batching addresses the “many writes cause many updates” challenge by coalescing a cascade of updates into a single emission wave per frame. All write paths use a cooperative scheduler:

- `ScopeEmitter._schedule(...)` schedules affected emitters.
- Emitters are flushed (see “Flush”) and then either:
  - Emitted immediately when `skipBatching=true` (used by `DerivedImpulse`), or
  - Queued and emitted once per frame (default behavior).

`batch(fn)`: wraps a sequence of updates into one schedule frame, coalescing notifications.

**Properties:**

- Deterministic order per frame: each emitter is flushed at schedule time and emitted at most once per frame.
- No global broadcast: only scopes that previously read an affected impulse will emit.

### Scope injections

The following APIs are internal and not intended for use by library consumers. They exist solely to support scenarios where a scope cannot be passed explicitly as an argument, such as in `Impulse.toString()` or `Impulse.toJSON()`. These are not for general use:

- `injectScope(fn, scope)`: Temporarily sets the current scope for the duration of `fn`, allowing reads within to be tracked or non-tracking as needed.
- `extractScope()`: Retrieves the currently injected scope.
- `UNTRACKED_SCOPE`: The internal non-tracking scope, surfaced only via certain factories and never referenced directly by consumers.

### Performance notes

- O(1) per dependency edge; notify cost scales with affected scopes only.
- Use batching to coalesce writes.

### Lifecycle summary

1. Read: Scope reads impulses and attaches to them.
2. Write: A value changes, scheduling the affected scope.
3. Schedule/Flush: The scope flushes (detaches old dependencies, bumps version).
4. Emit: The hosting environment enqueues a new read cycle for the scope:
   - In React, this means re-rendering the component or calling the effect function.
   - For `subscribe`, this means re-running the listener function.

After emission, the scope will attach only to impulses actually read in the new cycle. This guarantees that conditional dependencies remain accurate and up-to-date.

## API contract

### Scope

```ts
interface Scope {
  version?: number
}
```

Scope is an opaque object, always obtained via a factory (see [scope-factories](./scope-factories.md))
Never constructed directly by consumers. Used to track reads and manage lifecycles. The `version` property is for debugging/diagnostics only.

### ScopeEmitter (internal)

ScopeEmitter is an internal class responsible for dependency tracking, scheduling, and notification. Not exposed to consumers.

```ts
new ScopeEmitter(emit: VoidFunction, skipBatching?: boolean)
// emit: callback invoked when the scope emits
// skipBatching: opts out of batching (used by derived impulses)

_attachTo(emitters: Set<WeakRef<ScopeEmitter>>): void
_detachFromAll(): void
_flush(): void
_getVersion(): number
// All above: manage emitter's attachment, detachment, flushing, and versioning

ScopeEmitter._schedule<TResult>(execute: (queue: ScopeEmitterQueue) => TResult): TResult
// Schedules a batch of emitter notifications, ensuring all emitters are processed in a single global queue for the current frame
```

All ScopeEmitter methods are internal and not exposed to consumers. All instances contribute to a single global queue for batching, ensuring deterministic, coalesced notifications. The only interaction point for library users is via the factories and hooks described in [scope-factories](./scope-factories.md).
