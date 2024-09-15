---
"react-impulse-form": major
---

Expose `Result` to the public API.

```ts
export type Result<TError, TData> = [TError] extends [never]
  ? [null, TData]
  : [TError, null] | [null, TData]
```
