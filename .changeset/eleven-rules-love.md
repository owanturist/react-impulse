---
"react-impulse": minor
---

Introduce [`useScopedCallback`](./#usescopedcallback).
The hook is an enchanted [`React.useCallback`][react__use_callback] hook.

```dart
function useScopedCallback<TArgs extends ReadonlyArray<unknown>, TResult>(
  callback: (scope: Scope, ...args: TArgs) => TResult,
  dependencies: DependencyList,
): (...args: TArgs) => TResult
```

- `callback` is a function to memoize, the memoized function injects [`Scope`][scope] as the first argument and updates whenever any of the `dependencies` values change.
- `dependencies` is an array of values used in the `callback` function.
