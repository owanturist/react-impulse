# react-impulse

## 2.2.0

### Minor Changes

- [#790](https://github.com/owanturist/react-impulse/pull/790) [`167bb77`](https://github.com/owanturist/react-impulse/commit/167bb7760211d1a5966a3f730f534beba78c0e77) Thanks [@owanturist](https://github.com/owanturist)! - Drop custom `manglePlugin` in favor of `terser` default mangling.

## 2.1.0

### Minor Changes

- [#785](https://github.com/owanturist/react-impulse/pull/785) [`b8561e4`](https://github.com/owanturist/react-impulse/commit/b8561e457a572a153108ad2ac419cc41b02dcf76) Thanks [@owanturist](https://github.com/owanturist)! - Update dependencies:

  - `@changesets/changelog-github@0.5.1`
  - `@changesets/cli@2.28.1`
  - `@size-limit/preset-small-lib@11.2.0`
  - `happy-dom@17.4.4`
  - `prettier@3.5.3`
  - `size-limit@11.2.0`
  - `terser@5.39.0`
  - `tsup@8.4.0`
  - `typescript@5.8.2`

## 2.0.4

### Patch Changes

- [#764](https://github.com/owanturist/react-impulse/pull/764) [`cf0d1d0`](https://github.com/owanturist/react-impulse/commit/cf0d1d0f7d2026a6a7cdee4bff6e0be7a0b26b9f) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump rollup from 4.21.2 to 4.22.4

## 2.0.3

### Patch Changes

- [#743](https://github.com/owanturist/react-impulse/pull/743) [`bdbe810`](https://github.com/owanturist/react-impulse/commit/bdbe810e84bddcb4176d1235cd31e45a449b2041) Thanks [@owanturist](https://github.com/owanturist)! - Update dependencies.

## 2.0.2

### Patch Changes

- [#633](https://github.com/owanturist/react-impulse/pull/633) [`bb4dcfa`](https://github.com/owanturist/react-impulse/commit/bb4dcfa0a49de5d1c9407f008ba0d3ae166dbddc) Thanks [@owanturist](https://github.com/owanturist)! - Change import `use-sync-external-store/shim/with-selector` to `use-sync-external-store/shim/with-selector.js`.

## 2.0.1

### Patch Changes

- a1577a1: The `TransmittingImpulse#setValue` method always emits changes to enforce the transmitting value update for cases when the value is not reactive (ex. `localStorage`, global values, etc). Resolves #627.
- 93f698b: Assign a compare function to a stable ref during the initial render so that Impulses created via `useImpulse` and `useTransmittingImpulse` can use `getValue()` and `setValue()` during initial render. Resolves #624.

## 2.0.0

### Major Changes

- d2bf7d0: The `Scope` became an explicit argument for all methods, hooks and functions that read or potentially read an Impulse value. To reflect this change, the following renames were made:

  - `useImpulseCallback` -> `useScopedCallback`
    ```ts
    function useScopedCallback<TArgs extends ReadonlyArray<unknown>, TResult>(
      callback: (scope: Scope, ...args: TArgs) => TResult,
      dependencies: DependencyList,
    ): (...args: TArgs) => TResult
    ```
  - `useImpulseMemo` -> `useScopedMemo`
    ```ts
    function useScopedMemo<TResult>(
      factory: (scope: Scope) => TResult,
      dependencies: DependencyList,
    ): TResult
    ```
  - `useImpulseEffect` -> `useScopedEffect`
    ```ts
    function useScopedEffect(
      effect: (scope: Scope) => Destructor,
      dependencies?: DependencyList,
    ): void
    ```
  - `useImpulseLayoutEffect` -> `useScopedLayoutEffect`
    ```ts
    function useScopedLayoutEffect(
      effect: (scope: Scope) => Destructor,
      dependencies?: DependencyList,
    ): void
    ```
  - `useWatchImpulse` -> `useScoped`
    ```ts
    function useScoped<TValue>(impulse: ReadonlyImpulse<TValue>): TValue
    function useScoped<TResult>(
      factory: (scope: Scope) => TResult,
      dependencies?: DependencyList,
      options?: UseScopedOptions<TResult>,
    ): TResult
    ```
  - `watch` -> `scoped`
    ```ts
    export function scoped<TProps>(
      component: FC<PropsWithScope<TProps>>,
    ): FC<PropsWithoutScope<TProps>>
    ```

- d6fb9b0: Introduce optional dependencies argument for `useScoped`:

  ```dart
  function useScoped<T>(
    factory: () => T,
    dependencies?: DependencyList,
    options?: UseScopedOptions<T>
  ): T
  ```

  It works the same way as `useEffect` dependencies argument - if the dependencies are not defined, the `factory` will be called on every render. Otherwise, it will be called only when the dependencies change.

  ```ts
  const impulse = useImpulse(0)

  // before
  const count = useScoped(
    useCallback(
      (scope) => {
        return impulse.getValue(scope)
      },
      [impulse],
    ),
  )

  // now
  const count = useScoped(
    (scope) => {
      return impulse.getValue(scope)
    },
    [impulse],
  )
  ```

- 232d0c1: Introduce [`ImpulseOptions`](./#impulseoptions) and [`UseScopedOptions`](./useScopedoptions) as a replacement for raw `compare` argument:

  ```ts
  // before
  const impulse_1 = Impulse.of({ count: 0 }, shallowEqual)
  const impulse_2 = impulse_1.clone((x) => x, shallowEqual)
  const impulse_3 = useImpulse({ count: 0 }, shallowEqual)
  const value = useScoped((scope) => impulse_2.getValue(scope), shallowEqual)

  // now
  const impulse_1 = Impulse.of({ count: 0 }, { compare: shallowEqual })
  const impulse_2 = impulse_1.clone((x) => x, { compare: shallowEqual })
  const impulse_3 = useImpulse({ count: 0 }, { compare: shallowEqual })
  const value = useScoped((scope) => impulse_2.getValue(scope), {
    compare: shallowEqual,
  })
  ```

  The overall functionality is the same, but now it opens up a possibility to add more options in the future and helps TypeScript to distinguish options from other arguments (it was a problem with `compare` and other function arguments).

- 77fd6e2: Introduce the `untrack` function.

  ```dart
  function untrack<TResult>(factory: (scope: Scope) => TResult): TResult
  function untrack<TValue>(impulse: ReadonlyImpulse<TValue>): TValue
  ```

  The `untrack` function is a helper to read Impulses' values without reactivity. It provides a [`Scope`][scope] to the `factory` function and returns the result of the function. Acts as [`batch`][batch].

- fa8141d: Drop the `compare` argument from `Impulse#setValue`.

  Turns out that that in practice that argument is hardly ever used, but it makes the Impulse API confusing: why specifically `compare` is passed to `setValue` and not to `Impulse#of` or `useImpulse`?
  So, when needed, define `compare` in [`Impulse.of(initialValue, {compare})`](./#impulseof) factory or [`useImpulse(initialValue, {compare})`](./#useimpulse) hook.

- a9eac62: Drop `Impulse#subscribe` method in favor of [`subscribe`](./#subscribe) higher-order function.

  ```diff
  -const unsubscribe = impulse.subscribe(() => {
  +const unsubscribe = subscribe((scope) => {
    console.log(impulse.getValue(scope));
  });
  ```

- a594ca9: Make the `Impulse#compare` property protected.

  Turns out that that in practice that property is hardly ever used, so now and it becomes protected.
  But you still can specify `Impulse#compare` via [`Impulse.of(initialValue, {compare})`](./#impulseof) factory or [`useImpulse(initialValue, {compare})`](./#useimpulse) hook.

- 6157abf: Drop `useImpulseValue` hook.

  The hook was hardly ever used and in all cases it is more natural to use `useScoped` instead.

  ```diff
  -const value = useImpulseValue(impulse);
  +const value = useScoped(impulse);
  +// or
  +const value = useScoped((scope) => impulse.getValue(scope));
  +// or
  +const value = useScoped((scope) => impulse.getValue(scope), [impulse]);
  ```

### Minor Changes

- 94da9b6: Extends `useScoped` hook API with a shortcut for reading an `Impulse` value:

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

- c40ed76: The `subscribe` listener can return a cleanup function to be called for subsequent listeners calls.

  ```ts
  function subscribe<T>(
    impulse: Impulse<T>,
    listener: (value: T) => void | VoidFunction,
  ): void
  ```

- 4095b1a: Introduce [`useScopedCallback`](./#usescopedcallback).
  The hook is an enchanted [`React.useCallback`][react__use_callback] hook.

  ```dart
  function useScopedCallback<TArgs extends ReadonlyArray<unknown>, TResult>(
    callback: (scope: Scope, ...args: TArgs) => TResult,
    dependencies: DependencyList,
  ): (...args: TArgs) => TResult
  ```

  - `callback` is a function to memoize, the memoized function injects [`Scope`][scope] as the first argument and updates whenever any of the `dependencies` values change.
  - `dependencies` is an array of values used in the `callback` function.

- 1280481: Add the [`Impulse#clone`](./#impulseclone) method's overload to accept `options: ImpulseOptions` as a single argument, so the resulting signature looks like the following:

  ```dart
  Impulse<T>#clone(
    options?: ImpulseOptions<T>,
  ): Impulse<T>

  Impulse<T>#clone(
    transform?: (value: T) => T,
    options?: ImpulseOptions<T>,
  ): Impulse<T>
  ```

- d45e64a: Pass the `Scope` as 3rd argument to `Compare` function. Useful if it needs to compare values from impulses.

  ```ts
  type Compare<T> = (left: T, right: T, scope: Scope) => boolean
  ```

- 6e39e72: The `useScopedEffect` and `useScopedLayoutEffect` hooks do not enqueue a host component re-render when only scoped Impulses' values change.

  ```ts
  const count = useImpulse(1)

  useScopedEffect(
    (scope) => {
      console.log(count.getVAlue(scope))
    },
    [count],
  )
  ```

  The effect above depends only on the `count` Impulse. The `useScopedEffect` hook used to trigger the host component's rerender, but now on `count.setValue(2)` the effect runs, and the host component does not re-render.

- 919f387: Introduce transmitting Impulse.

  - `Impulse.transmit` static method that creates a new transmitting Impulse. A transmitting Impulse is an Impulse that does not have its own value but reads it from an external source and writes it back to the source when the value changes. An external source is usually another Impulse or other Impulses.

    ```dart
    Impulse.transmit<T>(
      getter: (scope: Scope) => T,
      options?: TransmittingImpulseOptions<T>,
    ): ReadonlyImpulse<T>

    Impulse.transmit<T>(
      getter: ReadonlyImpulse<T> | ((scope: Scope) => T),
      setter: Impulse<T> | ((value: T, scope: Scope) => void),
      options?: TransmittingImpulseOptions<T>,
    ): Impulse<T>
    ```

    - `getter` is either a source impulse or a function to read the transmitting value from a source.
    - `[setter]` either a destination impulse or is an optional function to write the transmitting value back to the source. When not defined, the Impulse is readonly.
    - `[options]` is an optional `TransmittingImpulseOptions` object.
      - `[options.compare]` when not defined or `null` then `Object.is` applies as a fallback.

  - `useTransmittingImpulse` react that initialize a stable (never changing) transmitting Impulse. Look at the `Impulse.transmit` method for more details and examples.

    ```dart
    function useTransmittingImpulse<T>(
      getter: (scope: Scope) => T,
      dependencies: DependencyList,
      options?: TransmittingImpulseOptions<T>,
    ): ReadonlyImpulse<T>

    function useTransmittingImpulse<T>(
      getter: ReadonlyImpulse<T> | ((scope: Scope) => T),
      dependencies: DependencyList,
      setter: Impulse<T> | ((value: T, scope: Scope) => void),
      options?: TransmittingImpulseOptions<T>,
    ): Impulse<T>
    ```

    - `getter` is either a source impulse or a function to read the transmitting value from a source.
    - `dependencies` an array of values triggering the re-read of the transmitting value.
    - `[setter]` either a destination impulse or is an optional function to write the transmitting value back to the source. When not defined, the Impulse is readonly.
    - `[options]` is an optional `TransmittingImpulseOptions` object.
      - `[options.compare]` when not defined or `null` then `Object.is` applies as a fallback.

  - `type ReadonlyImpulse`

    A type alias for `Impulse` that does not have the `Impulse#setValue` method. It might be handy to store some value inside an Impulse, so the value change trigger a host component re-render only if the component reads the value from the Impulse.

- 5955868: Introduce `Impulse.isImpulse` static method to check if a given object is an impulse.

  ```dart
  Impulse.isImpulse<T, Unknown = unknown>(
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>

  Impulse.isImpulse<T, Unknown = unknown>(
    scope: Scope,
    check: (value: unknown) => value is T,
    input: Unknown | Impulse<T>,
  ): input is Impulse<T>
  ```

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
