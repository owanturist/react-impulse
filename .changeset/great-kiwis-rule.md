---
"react-impulse": major
---

**BREAKING CHANGES**

The `useTransmittingImpulse` hook has been removed. Use the following replacements:

#### Rationale

Removing this specialized hook simplifies the API surface while making state management patterns more explicit. Instead of a single hook with multiple behaviors, the library now encourages composing standard React hooks with Impulse primitives, resulting in more predictable and maintainable code.

#### Functional Equivalence

All functionality previously provided by `useTransmittingImpulse` can be achieved through the composition of `Impulse.of()`, `useEffect`, and `useScopedEffect`. These replacements give you more precise control over dependency tracking and rendering optimization.

#### Migration Guide

- For immutable dependencies (not Impulses), replace with `Impulse.of(value)` + effects:

  ```ts
  // Before
  const impulse = useTransmittingImpulse(
    (query) => ({ query }),
    [query],
    (params) => setRouterParams(params),
  )

  // After
  const impulse = Impulse.of({ query }) // Create Impulse with initial value

  // Update Impulse when dependencies change
  useEffect(() => impulse.setValue({ query }), [impulse, query])

  // Apply changes from Impulse to external state
  useScopedEffect(
    (scope) => setRouterParams(impulse.getValue(scope)),
    [impulse, setRouterParams],
  )
  ```

- For mutable dependencies (other Impulses), replace with `Impulse.of(getter, [setter])`:

  ```ts
  // Before
  const impulse = useTransmittingImpulse(
    (scope) => ({ count: count.getValue(scope) }),
    [count],
    (next) => count.setValue(next.count),
  )

  // After
  const counter = useMemo(() => {
    return Impulse.of(
      (scope) => ({ count: count.getValue(scope) }), // Derived getter
      (next) => count.setValue(next.count), // Optional setter
    )
  }, [count])
  ```
