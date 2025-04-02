---
"react-impulse": major
---

**BREAKING CHANGES**

The `useTransmittingImpulse` hook has been removed. Use the following replacements:

#### Migration Guide

- For immutable dependencies (not Impulses), replace with `Impulse.of`:

  ```ts
  // Before
  const impulse = useTransmittingImpulse(
    (query) => ({ query }),
    [query],
    (params) => setRouterParams(params),
  )

  // After
  const impulse = Impulse.of({ query })

  useEffect(() => impulse.setValue({ query }), [impulse, query])
  useScopedEffect(
    (scope) => setRouterParams(impulse.getValue(scope)),
    [impulse, setRouterParams],
  )
  ```

- For mutable dependencies (other Impulses), replace with `Impulse.transmit`:

  ```ts
  // Before
  const impulse = useTransmittingImpulse(...)

  // After
  const counter = useMemo(() =>
    Impulse.transmit(
      (scope) => ({ count: count.getValue(scope) }),
      (next) => count.setValue(next.count),
    ),
    [count],
  )
  ```
