# react-impulse

## 1.1.0

### Minor Changes

- ea515ee: Introduce HOF `subscribe`.

  ```dart
  function subscribe(listener: VoidFunction): VoidFunction
  ```

  It subscribes to changes of all `Impulse` instances that call the `Impulse#getValue` method inside the `listener`. Returns a cleanup function that unsubscribes the `listener`. The `listener` calls first time synchronously when `subscribe` is called.

  Might be used for subscribing to changes of multiple Impulses at once.
