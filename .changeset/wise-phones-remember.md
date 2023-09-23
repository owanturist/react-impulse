---
"react-impulse": major
---

Drop `useImpulseValue` hook.

The hook was hardly ever used and in all cases it is more natural to use `useWatchImpulse` instead.

```diff
-const value = useImpulseValue(impulse);
+const value = useWatchImpulse(() => impulse.getValue());
+// or
+const value = useWatchImpulse(() => impulse.getValue(), [impulse]);
```
