---
"react-impulse": minor
---

Pass the `Scope` as 3rd argument to `Compare` function. Useful if it needs to compare values from impulses.

```ts
type Compare<T> = (left: T, right: T, scope: Scope) => boolean
```
