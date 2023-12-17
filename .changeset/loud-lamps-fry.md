---
"react-impulse": major
---

Introduce optional dependencies argument for `useScoped`:

```dart
function useScoped<T>(
  factory: () => T,
  dependencies?: DependencyList,
  options?: UseScopedOptions<T>
): T
```

It works the same way as `useEffect` dependencies argument - if the dependencies are not defined, the `factory` will be called on every render. Otherwise, it will be called only when the dependencies change.

```ts
const impulse = useImpulse(0)

// before
const count = useScoped(
  useCallback(() => {
    return impulse.getValue()
  }, [impulse]),
)

// now
const count = useScoped(() => {
  return impulse.getValue()
}, [impulse])
```
