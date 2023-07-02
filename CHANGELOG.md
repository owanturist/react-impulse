# react-impulse

## 1.1.2

### Patch Changes

- 2fedb5f: 🐛 bugfix: build the source code before publishing. It runs `pnpm run publish` instead of `pnpm publish` so it runs the custom script, that builds the package first and then uses `changesets publish`.

## 1.1.1

### Patch Changes

- dcb8309: 🐛 bugfix: an `Impulse` created via `useImpulse` uses latest `compare` function provided to `useImpulse` but not only the initial one.

## 1.1.0

### Minor Changes

- ea515ee: Introduce HOF `subscribe`.

  ```dart
  function subscribe(listener: VoidFunction): VoidFunction
  ```

  It subscribes to changes of all `Impulse` instances that call the `Impulse#getValue` method inside the `listener`. Returns a cleanup function that unsubscribes the `listener`. The `listener` calls first time synchronously when `subscribe` is called.

  Might be used for subscribing to changes of multiple Impulses at once.
