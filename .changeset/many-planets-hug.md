---
"react-impulse": minor
---

The `useScopedEffect` and `useScopedLayoutEffect` hooks do not enqueue a host component re-render when only scoped Impulses' values change.

```ts
const count = useImpulse(1)

useScopedEffect(
  (scope) => {
    console.log(count.getVAlue(scope))
  },
  [count],
)
```

The effect above depends only on the `count` Impulse. The `useScopedEffect` hook used to trigger the host component's rerender, but now on `count.setValue(2)` the effect runs, and the host component does not re-render.
