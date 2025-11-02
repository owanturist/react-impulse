---
"react-impulse": patch
---

Create scope for `useScopedMemo`/`useScopedCallback` the same way as for `useScope`, so those hooks become aliases for:

```ts
const scope = useScope()

// useScopedMemo is an alias for
React.useMemo(() => impulse.getValue(scope), [scope])

// useScopedCallback is an alias for
React.useCallback((impulse) => impulse.getValue(scope), [scope])
```
