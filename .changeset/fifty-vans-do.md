---
"react-impulse": major
---

Add the [`Impulse#clone`](./#impulseclone) method's overload to accept `options: ImpulseOptions` as a single argument, so the resulting signature looks like the following:

```dart
Impulse<T>#clone(
  options?: ImpulseOptions<T>,
): Impulse<T>

Impulse<T>#clone(
  transform?: (value: T) => T,
  options?: ImpulseOptions<T>,
): Impulse<T>
```
