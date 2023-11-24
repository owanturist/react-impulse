---
"react-impulse": major
---

Introduce dependencies optional argument for `useWatchImpulse`:

```dart
function useWatchImpulse<T>(
  watcher: () => T,
  dependencies?: DependencyList,
  options?: UseWatchImpulseOptions<T>
): T
```

It works the same way as `useEffect` dependencies argument - if the dependencies are not defined, the `watcher` will be called on every render. Otherwise, it will be called only when the dependencies change.

```ts
const impulse = useImpulse(0)

// before
const count = useWatchImpulse(
  useCallback(() => {
    return impulse.getValue()
  }, [impulse]),
)

// now
const count = useWatchImpulse(() => {
  return impulse.getValue()
}, [impulse])
```
