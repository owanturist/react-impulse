---
"react-impulse": major
---

Drop `Impulse#subscribe` method in favor of [`subscribe`](./#subscribe) higher-order function.

```diff
-const unsubscribe = impulse.subscribe(() => {
+const unsubscribe = subscribe(() => {
  console.log(impulse.getValue());
});
```
