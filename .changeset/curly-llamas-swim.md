---
"react-impulse": major
---

The `Scope` became an explicit argument for all methods, hooks and functions that read or potentially read an Impulse value. To reflect this change, the following renames were made:

- `useImpulseCallback` -> `useScopedCallback`
  ```ts
  function useScopedCallback<TArgs extends ReadonlyArray<unknown>, TResult>(
    callback: (scope: Scope, ...args: TArgs) => TResult,
    dependencies: DependencyList,
  ): (...args: TArgs) => TResult
  ```
- `useImpulseMemo` -> `useScopedMemo`
  ```ts
  function useScopedMemo<TResult>(
    factory: (scope: Scope) => TResult,
    dependencies: DependencyList,
  ): TResult
  ```
- `useImpulseEffect` -> `useScopedEffect`
  ```ts
  function useScopedEffect(
    effect: (scope: Scope) => Destructor,
    dependencies?: DependencyList,
  ): void
  ```
- `useImpulseLayoutEffect` -> `useScopedLayoutEffect`
  ```ts
  function useScopedLayoutEffect(
    effect: (scope: Scope) => Destructor,
    dependencies?: DependencyList,
  ): void
  ```
- `useWatchImpulse` -> `useScoped`
  ```ts
  function useScoped<TResult>(
    factory: (scope: Scope) => TResult,
    dependencies?: DependencyList,
    options?: UseScopedOptions<TResult>,
  ): TResult
  ```
