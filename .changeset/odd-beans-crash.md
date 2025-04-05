---
"react-impulse": major
---

**BREAKING CHANGES**

The `scoped` API has been removed and replaced with the new `useScope()` hook. The `PropsWithScope`, `PropsWithoutScope`, and `ForwardedPropsWithoutScope` types have been removed as well.

#### Rationale

Replacing the `scoped` HOC with hooks offers several advantages:

1. **Simplified API**: Direct hook usage creates a flatter, more intuitive API compared to higher-order components.
2. **Better TypeScript integration**: Hooks provide cleaner type inference than HOCs, eliminating the need for special prop types.

#### Functional Equivalence

All functionality previously provided by the `scoped` HOC can be achieved through the `useScope()` and `useScoped()` hooks, giving you more direct control over scope handling.

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

- Replace `scoped.memo` with `useScope()` + `React.memo`:

  ```tsx
  // Before
  const MemoizedCounter = scoped.memo(({ scope, count }) => (
    <div>{count.getValue(scope)}</div>
  ))

  // After
  const Counter = ({ count }) => {
    const scope = useScope()
    return <div>{count.getValue(scope)}</div>
  }
  const MemoizedCounter = React.memo(Counter)
  ```

- Replace `scoped.forwardRef` with `useScope()` + `React.forwardRef`:

  ```tsx
  // Before
  const ForwardedInput = scoped.forwardRef(({ scope, value }, ref) => (
    <input ref={ref} value={value.getValue(scope)} />
  ))

  // After
  const ForwardedInput = React.forwardRef(({ value }, ref) => {
    const scope = useScope()
    return <input ref={ref} value={value.getValue(scope)} />
  })
  ```
