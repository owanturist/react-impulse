---
"react-impulse": minor
---

The `subscribe` listener can return a cleanup function to be called for subsequent listeners calls.

```ts
function subscribe<T>(
  impulse: Impulse<T>,
  listener: (value: T) => void | VoidFunction,
): void
```
