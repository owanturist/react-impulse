---
"react-impulse": minor
---

🚀 feat: extends `Impulse.of` and `useImpulse` signature with an optional value type, the same way as `useState` does.

```ts
const count = Impulse.of(0) // Impulse<number>
const optionalCount = Impulse.of<number>() // Impulse<number | undefined>

// same for useImpulse
const count = useImpulse(0) // number
const optionalCount = useImpulse<number>() // number | undefined
```

before the changes you had to provide both the optional value initial (`undefined`) value and type explicitly:

```ts
const optionalCount = Impulse.of<number | undefined>(undefined) // Impulse<number | undefined>
```
