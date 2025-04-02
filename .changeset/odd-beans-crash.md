---
"react-impulse": major
---

**BREAKING CHANGES**

The `scoped` API has been removed and replaced with the new `useScope()` hook. The `PropsWithScope`, `PropsWithoutScope`, and `ForwardedPropsWithoutScope` types have been removed as well.

#### Migration Guide

- Replace `scoped` with `useScope()` or `useScoped()`:

  ```tsx
  // Before
  const Counter = scoped(({ scope, count }) => (
    <div>{count.getValue(scope)}</div>
  ))

  // After (using useScope)
  const Counter = ({ count }) => {
    const scope = useScope()
    return <div>{count.getValue(scope)}</div>
  }

  // OR (using useScoped)
  const Counter = ({ count }) => {
    const value = useScoped(count)
    return <div>{value}</div>
  }
  ```

- Replace `scoped.memo` with `useScope()` + `React.memo`.
- Replace `scoped.forwardRef` with `useScope()` + `React.forwardRef`.
- Replace `scoped.memo.forwardRef` and `scoped.forwardRef.memo` with `useScope()` + `React.memo` + `React.forwardRef`.
