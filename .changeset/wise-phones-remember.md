---
"react-impulse": major
---

Drop `useImpulseValue` hook.

The hook was hardly ever used and in all cases it is more natural to use `useScoped` instead.

```diff
-const value = useImpulseValue(impulse);
+const value = useScoped(impulse);
+// or
+const value = useScoped((scope) => impulse.getValue(scope));
+// or
+const value = useScoped((scope) => impulse.getValue(scope), [impulse]);
```
