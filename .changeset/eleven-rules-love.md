---
"react-impulse": minor
---

🚀 Introduce `useImpulseCallback`

```dart
function useImpulseCallback<TArgs extends ReadonlyArray<unknown>, TResult>(
  callback: (...args: TArgs) => TResult,
  dependencies: DependencyList,
): (...args: TArgs) => TResult
```

- `callback` is a function to memoize, the memoized value updates whenever any of the `dependencies` values change.
- `dependencies` is an array of values used in the `callback` function.

The hook is an Impulse version of the `React.useCallback` hook. During the `callback` execution, all Impulses that call the `Impulse#getValue` method become _phantom dependencies_ of the hook.
