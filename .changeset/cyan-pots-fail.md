---
"react-impulse": major
---

**BREAKING CHANGES**

The `useImpulse` hook has been removed. Replace it with `useState`, `useRef`, or another permanent storage of your choice.

#### Rationale

Removing this hook simplifies the API by encouraging direct use of standard React hooks with `Impulse.of()`. This approach provides more explicit control over when Impulses are created and how they're stored in your components, leading to more predictable behavior across renders and better integration with other React patterns.

#### Migration Guide

- Replace `useImpulse` with `useState` or `useRef`:

  ```tsx
  // Before
  const impulse = useImpulse(0)

  // After with useState
  const [impulse] = useState(() => Impulse.of(0))

  // After with useRef
  const impulseRef = useRef(Impulse.of(0))
  ```
