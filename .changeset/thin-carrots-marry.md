---
"react-impulse": major
---

Drop `Impulse#subscribe` method in favor of [`subscribe`](./#subscribe) higher-order function.

```diff
-const unsubscribe = impulse.subscribe(() => {
+const unsubscribe = subscribe((scope) => {
  console.log(impulse.getValue(scope));
});
```
