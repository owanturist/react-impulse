---
"react-impulse": major
---

The **BREAKING CHANGES** are migration paths:

- Delete `useImpulse`. Replace it with `useState`, `useRef` or any other permanent storage of your choice:

  ```ts
  // Before
  const impulse = useImpulse(0)

  // After
  const [impulse] = useState(Impulse.of(0))
  ```

- Delete `useTransmittingImpulse`. Replace it with `Impulse.of` for cases with immutable dependencies (not Impulses):

  ```ts
  const { query }: { query: string } = useRouterParams()
  const setRouterParams = useSetRouterParams()

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
    (scope) => {
      setRouterParams(impulse.getValue(scope))
    },
    [impulse, setRouterParams],
  )
  ```

  For cases with mutable dependencies (other Impulses) use `Impulse.transmit`:

  ```ts
  const [count] = useState(Impulse.of(0))
  const counter = useMemo(() => {
    return Impulse.transmit(
      (scope) => ({ count: count.getValue(scope) }),
      (next) => count.setValue(next.count),
    )
  }, [count])
  ```
