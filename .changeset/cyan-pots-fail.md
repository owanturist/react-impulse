---
"react-impulse": major
---

**BREAKING CHANGES**

The `useImpulse` hook has been removed. Replace it with `useState`, `useRef`, or another permanent storage of your choice.

#### Migration Guide

- Replace `useImpulse` with `useState` or `useRef`:

  ```ts
  // Before
  const impulse = useImpulse(0)

  // After
  const [impulseState] = useState(Impulse.of(0))
  const impulseRef = useRef(Impulse.of(0))
  ```
