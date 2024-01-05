---
"react-impulse": minor
---

Extends `useScoped` hook API with a shortcut for reading an `Impulse` value:

```ts
function useScoped<TValue>(impulse: ReadonlyImpulse<TValue>): TValue
```

So now you it takes less code to read an `Impulse` value:

```diff
-const value_1 = useScoped((scope) => impulse.getValue(scope));
+const value_1 = useImpulseValue(impulse);
-const value_2 = useScoped((scope) => impulse.getValue(scope), [impulse]);
+const value_2 = useImpulseValue(impulse);
```
