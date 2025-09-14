---
id: scope-factories
title: Scope factories — framework-agnostic and React-specific
type: concept
packages:
  - react-impulse
status: accepted
owner: owanturist
last-reviewed: 2025-08-27
tags:
  - scope
  - reactivity
  - core
  - vanilla
  - subscribe
  - batch
  - untrack
  - tap
  - hooks
diataxis: explanation
relates-to:
  - impulse-concept
  - scope-concept
---

## Context and goals

List the available ways to create and use a `Scope` when working with impulses, both in framework-agnostic code and in React components.

### Goals

- Clarify which factories create tracking vs non-tracking scopes.
- Clarify lifecycles and cleanup responsibilities.

### Non-goals

- Deep dive into lifecycle, dependency tracking, batching, and scheduling semantics (see [scope-concept](./scope-concept.md) for that).

## Design and rationale

### What are scope factories

Scope factories are utility functions and React hooks that create and manage `Scope` instances for reading and reacting to impulse values. They provide either:

- static scopes that do not track dependencies: `batch`, `untrack`, and `tap`.
- reactive scopes that track dependencies and manage lifecycles: the rest.

### Why they exist

- Ergonomics: they abstract away the boilerplate of creating and managing scopes, making it easy to work with impulses.
- Safety: they ensure scopes are used correctly, preventing memory leaks and ensuring proper cleanup.
- Flexibility: they provide different types of scopes for different use cases, allowing developers to choose the right tool for the job.

### Principles

- Keep factories small with a clear purpose.
- Manage lifecycles and cleanup automatically.
- Make the hooks to fit the `react-hooks/exhaustive-deps` lint rule if they accept dependencies.
- Mirror React's built-in hooks where applicable for familiarity and convenience.

### How they work

#### Static (non-tracking) scopes factories

All of the static scope factories pass the `STATIC_SCOPE` "dummy" scope to their callbacks, ensuring that any impulse reads do not establish dependencies. All those factories batch notifications to avoid intermediate updates.

#### Reactive (tracking) scopes factories

The `subscribe` factory creates a new `Scope` and runs the listener with it, tracking all impulse reads. Whenever any of those impulses change, the listener is re-run with a fresh scope. The returned cleanup function destroys the scope and unsubscribes from all impulses.

The React hooks create a new `Scope` tied to the component lifecycle by utilizing `useSyncExternalStoreWithSelector` under the hood. The `_getVersion()` is used as a selector ensuring the component re-renders whenever any impulse read within the scope changes. The scope is automatically destroyed when the component unmounts.

## API contract

Type names: `Scope`, `ScopeOptions`, `Destructor`.

### Framework-agnostic factories

#### batch

```ts
batch<T>(fn: (scope: Scope) => void): void
```

Batches all impulse updates and notifications within `fn`. Provides a non-tracking scope for synchronous reads. Returns the result of `fn`.

#### tap

```ts
tap<T>(fn: (scope: Scope) => void): void
```

Runs `fn` with a non-tracking (static) scope. Reads do not establish dependencies. Batches notifications within the effect.

#### untrack

```ts
untrack<T>(fn: (scope: Scope) => T): T
```

Runs `fn` with a non-tracking (static) scope and returns the result. Reads do not establish dependencies. Batches notifications within the effect.

#### subscribe

```ts
subscribe(listener: (scope: Scope) => Destructor): VoidFunction
```

Subscribes to all impulses read within `listener` and re-runs the listener whenever any of those impulses change. Returns a cleanup function that must be called to stop listening.

### React-specific hooks

#### useScope

```ts
useScope(): Scope
```

Creates a component/hook level scope. The hook enqueues a re-render whenever any impulse read within the scope changes.

#### useScoped

```ts
useScoped<T>(impulse: ReadableImpulse<T>): T
useScoped<TResult>(factory: (scope: Scope) => TResult, dependencies?: DependencyList, options?: UseScopedOptions<TResult>): TResult
```

Reads an impulse value or runs a selector with a scope, re-rendering the component the result effectively changes. Accepts dependencies to control when the selector is re-created. When no dependencies are provided, the selector is re-created on every render.

#### useScopedMemo

```ts
useScopedMemo<TResult>(factory: (scope: Scope) => TResult, dependencies: DependencyList): TResult
```

Same as `React.useMemo`, but the factory receives a scope. The memoized value is recomputed when any involved impulse changes or when dependencies change.

#### useScopedCallback

```ts
useScopedCallback<T extends (scope: Scope, ...args: unknown[]) => any>(callback: T, dependencies: DependencyList): T
```

Same as `React.useCallback`, but the callback receives a scope. The memoized callback is recreated when any involved impulse changes or when dependencies change.

#### useScopedEffect

```ts
useScopedEffect(effect: (scope: Scope) => Destructor | void, dependencies?: DependencyList): void
```

Same as `React.useEffect`, but the effect receives a scope. The effect is re-run when any involved impulse changes or when dependencies change. The cleanup function (if returned) is called before re-running the effect and when the component unmounts.

#### useScopedLayoutEffect

```ts
useScopedLayoutEffect(effect: (scope: Scope) => Destructor | void, dependencies?: DependencyList): void
```

Same as `React.useLayoutEffect`, but the effect receives a scope. The effect is re-run when any involved impulse changes or when dependencies change. The cleanup function (if returned) is called before re-running the effect and when the component unmounts.
