# react-impulse

## 1.2.3

### Patch Changes

- f3c82b4: Re-export all dependencies from a single file so the imported packages appear only ones in the bundle. By doing so we can reduce the bundle size by ~2%.
- 5331541: Introduce an implicit `Scope` injection by replacing internal `WatchContext` and `SetValueContext` with `ScopeEmitter`. It drastically simplifies the internal API and makes it possible for further improvements (eg: [#378](https://github.com/owanturist/react-impulse/issues/378)).
- ad9e7bf: Mangle all private and internal methods and properties. It reduces the bundle size by ~5%
- e87970f: Update all dev dependencies

## 1.2.2

### Patch Changes

- cdf0483: Bump version to attach the latest tag

## 1.2.1

### Patch Changes

- 83e0960: 🐛 bugfix: build the source code before publishing. It runs `pnpm run publish` instead of `pnpm publish` so it runs the custom script, that builds the package first and then uses `changesets publish`.

## 1.2.0

### Minor Changes

- 18d3fa2: 🚀 feat: extends `Impulse.of` and `useImpulse` signature with an optional value type, the same way as `useState` does.

  ```ts
  const count = Impulse.of(0) // Impulse<number>
  const optionalCount = Impulse.of<number>() // Impulse<number | undefined>

  // same for useImpulse
  const count = useImpulse(0) // number
  const optionalCount = useImpulse<number>() // number | undefined
  ```

  before the changes you had to provide both the optional value initial (`undefined`) value and type explicitly:

  ```ts
  const optionalCount = Impulse.of<number | undefined>(undefined) // Impulse<number | undefined>
  ```

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
