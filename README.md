# `react-impulse`

[![codecov](https://codecov.io/gh/owanturist/react-impulse/branch/master/graph/badge.svg?token=QP3SXO8E9F)](https://codecov.io/gh/owanturist/react-impulse)
![known vulnerabilities](https://snyk.io/test/github/owanturist/react-impulse/badge.svg)
![minified + gzip](https://badgen.net/bundlephobia/minzip/react-impulse)
![dependency count](https://badgen.net/bundlephobia/dependency-count/react-impulse)
![types](https://badgen.net/npm/types/react-impulse)

The clean and natural React state management.

```bash
# with yarn
yarn add react-impulse

# with npm
npm install react-impulse
```

## Quick start

`Impulse` is a box holding any value you want, even another `Impulse`! All [`watch`][watch]ed components that execute the [`Impulse#getValue`][impulse__get_value] during the rendering phase enqueue re-render whenever the Impulse value updates.

```tsx
import { Impulse, watch } from "react-impulse"

const Input: React.FC<{
  type: "email" | "password"
  value: Impulse<string>
}> = watch(({ type, value }) => (
  <input
    type={type}
    value={value.getValue()}
    onChange={(event) => value.setValue(event.target.value)}
  />
))

const Checkbox: React.FC<{
  checked: Impulse<boolean>
  children: React.ReactNode
}> = watch(({ checked, children }) => (
  <label>
    <input
      type="checkbox"
      checked={checked.getValue()}
      onChange={(event) => checked.setValue(event.target.checked)}
    />

    {children}
  </label>
))
```

Once created, Impulses can travel thru your components, where you can set and get their values:

```tsx
import { useImpulse, watch } from "react-impulse"

const SignUp: React.FC = watch(() => {
  const username = useImpulse("")
  const password = useImpulse("")
  const isAgreeWithTerms = useImpulse(false)

  return (
    <form>
      <Input type="email" value={username} />
      <Input type="password" value={password} />
      <Checkbox checked={isAgreeWithTerms}>I agree with terms of use</Checkbox>

      <button
        type="button"
        disabled={!isAgreeWithTerms.getValue()}
        onClick={() => {
          api.submitSignUpRequest({
            username: username.getValue(),
            password: password.getValue(),
          })
        }}
      >
        Sign Up
      </button>
    </form>
  )
})
```

## Demos

- [Todo MVC](https://codesandbox.io/s/react-impulse-todo-mvc-inr46?file=/src/TodoApp.tsx) - an implementation of [todomvc.com](https://todomvc.com) template.
- [Obstacle maze](https://obstacle-maze.surge.sh) - an application to build and solve mazes with [source code](https://github.com/owanturist/obstacle-maze) at GitHub.
- [Catanstat](https://catanstat.surge.sh) - an application to track [Catan](https://www.catan.com) game statistics with [source code](https://github.com/owanturist/catanstat) at GitHub.

## API

A core piece of the library is the `Impulse` class - a box that holds value. The value might be anything you like as long as it does not mutate. The class instances are mutable by design, but other Impulses can use them as values.

### `Impulse.of`

```dart
Impulse.of<T>(): Impulse<undefined | T>

Impulse.of<T>(
  initialValue: T,
  options?: ImpulseOptions<T>
): Impulse<T>
```

A static method that creates new Impulse.

- `[initialValue]` is an optional initial value. If not defined, the Impulse's value is `undefined` but it still can specify the value's type.
- `[options]` is an optional [`ImpulseOptions`][impulse_options] object.
  - `[options.compare]` when not defined or `null` then [`Object.is`][object_is] applies as a fallback.

> 💡 The [`useImpulse`][use_impulse] hook helps to create and store an `Impulse` inside a React component.

```ts
const count = Impulse.of(1) // Impulse<number>
const timeout = Impulse.of<number>() // Impulse<undefined | number>
```

### `Impulse.transmit`

```dart
Impulse.transmit<T>(
  getter: () => T,
  options?: TransmittingImpulseOptions<T>,
): ReadonlyImpulse<T>

Impulse.transmit<T>(
  getter: () => T,
  setter: (value: T) => void,
  options?: TransmittingImpulseOptions<T>,
): Impulse<T>
```

- `getter` is a function to read the transmitting value from a source.
- `[setter]` is an optional function to write the transmitting value back to the source. When not defined, the Impulse is readonly.
- `[options]` is an optional [`TransmittingImpulseOptions`][transmitting_impulse_options] object.
  - `[options.compare]` when not defined it uses the `compare` function from the origin Impulse, when `null` the [`Object.is`][object_is] function applies to compare the values.

A static method that creates a new transmitting Impulse. A transmitting Impulse is an Impulse that does not have its own value but reads it from an external source and writes it back to the source when the value changes. An external source is usually another Impulse or other Impulses.

<details><summary><i>Showcase: transmitting an Impulse</i></summary>
<blockquote>

```tsx
const Drawer: React.FC<{
  isOpen: Impulse<boolean>
  children: React.ReactNode
}> = watch(({ isOpen, children }) => {
  if (!isOpen.getValue()) {
    return null
  }

  return (
    <div className="drawer">
      {children}

      <button type="button" onClick={() => isOpen.setValue(false)}>
        Close
      </button>
    </div>
  )
})

const ProductDetailsDrawer: React.FC<{
  product: Impulse<undefined | Product>
}> = ({ product }) => {
  const isOpen = useTransmittingImpulse(
    () => product.getValue() != null,
    [product],
    (open) => {
      if (!open) {
        product.setValue(undefined)
      }
    },
  )

  return (
    <Drawer isOpen={isOpen}>
      <ProductDetails product={product} />
    </Drawer>
  )
}
```

</blockquote>
</details>

<details><summary><i>Showcase: transmitting many Impulses</i></summary>
<blockquote>

```tsx
const Checkbox: React.FC<{
  checked: Impulse<boolean>
}> = watch(({ checked, children }) => (
  <input
    type="checkbox"
    checked={checked.getValue()}
    onChange={(event) => checked.setValue(event.target.checked)}
  />
))

const Agreements: React.FC<{
  isAgreeWithTermsOfUse: Impulse<boolean>
  isAgreeWithPrivacy: Impulse<boolean>
}> = watch(({ isAgreeWithTermsOfUse, isAgreeWithPrivacy }) => {
  const isAgreeWithAll = useTransmittingImpulse(
    () => isAgreeWithTermsOfUse.getValue() && isAgreeWithPrivacy.getValue(),
    [isAgreeWithTermsOfUse, isAgreeWithPrivacy],
    (agree) => {
      isAgreeWithTermsOfUse.setValue(agree)
      isAgreeWithPrivacy.setValue(agree)
    },
  )

  return (
    <div>
      <Checkbox checked={isAgreeWithTermsOfUse}>
        I agree with terms of use
      </Checkbox>
      <Checkbox checked={isAgreeWithPrivacy}>
        I agree with privacy policy
      </Checkbox>

      <hr />

      <Checkbox checked={isAgreeWithAll}>I agree with all</Checkbox>
    </div>
  )
})
```

</blockquote>
</details>

It can also transmit another store's value, such as `React.useState`, `redux`, URL, etc.

<details><summary><i>Showcase: transmitting a React state</i></summary>
<blockquote>

```tsx
const Counter: React.FC = () => {
  const [count, setCount] = React.useState(0)
  const countImpulse = useTransmittingImpulse(
    () => count,
    [count],
    (value) => setCount(value),
  )

  return (
    <button type="button" onClick={() => countImpulse.setValue((x) => x + 1)}>
      {count}
    </button>
  )
}
```

</blockquote>
</details>

<details><summary><i>Showcase: transmitting a Redux store</i></summary>
<blockquote>

```tsx
import { useSelector, useDispatch } from "react-redux"

const Counter: React.FC = () => {
  const count = useSelector((state) => state.count)
  const dispatch = useDispatch()
  const countImpulse = useTransmittingImpulse(
    () => count,
    [count],
    (value) => dispatch({ type: "SET_COUNT", payload: value }),
  )

  return (
    <button type="button" onClick={() => countImpulse.setValue((x) => x + 1)}>
      {count}
    </button>
  )
}
```

</blockquote>
</details>

<details><summary><i>Showcase: transmitting a search param from URL with `react-router`</i></summary>
<blockquote>

```tsx
import { useSearchParams } from "react-router-dom"

const PageNavigation: React.FC = () => {
  const [{ page_index = 1 }, setSearchParams] = useSearchParams()

  const page = useTransmittingImpulse(
    () => page_index,
    [page_index],
    (index) => {
      setSearchParams({ page_index: index })
    },
  )

  return (
    <button type="button" onClick={() => page.setValue((x) => x + 1)}>
      Go to the next page
    </button>
  )
}
```

</blockquote>
</details>

> 💡 The [`useTransmittingImpulse`][use_transmitting_impulse] hook helps to create and store a transmitting `Impulse` inside a React component.

### `Impulse#getValue`

```dart
Impulse<T>#getValue(): T
Impulse<T>#getValue<R>(select: (value: T) => R): R
```

An `Impulse` instance's method that returns the current value.

- `[select]` is an optional function that applies to the current value before returning.

```ts
const count = Impulse.of(3)

count.getValue() // === 3
count.getValue((x) => x > 0) // === true
```

### `Impulse#setValue`

```dart
Impulse<T>#setValue(
  valueOrTransform: T | ((currentValue: T) => T),
): void
```

An `Impulse` instance's method to update the value.

- `valueOrTransform` is the new value or a function that transforms the current value.

```ts
const isActive = Impulse.of(false)

isActive.setValue((x) => !x)
isActive.getValue() // true

isActive.setValue(false)
isActive.getValue() // false
```

> 💡 If `valueOrTransform` argument is a function it acts as [`batch`][batch].

> 💬 The method returns `void` to emphasize that `Impulse` instances are **mutable**.

### `Impulse#clone`

```dart
Impulse<T>#clone(
  options?: ImpulseOptions<T>,
): Impulse<T>

Impulse<T>#clone(
  transform?: (value: T) => T,
  options?: ImpulseOptions<T>,
): Impulse<T>
```

An `Impulse` instance's method for cloning an Impulse. When cloning a transmitting Impulse, the new Impulse is not transmitting, meaning that it does not read nor write the value from/to the external source.

- `[transform]` is an optional function that applies to the current value before cloning. It might be handy when cloning mutable values.
- `[options]` is optional [`ImpulseOptions`][impulse_options] object.
  - `[options.compare]` when not defined it uses the `compare` function from the origin Impulse, when `null` the [`Object.is`][object_is] function applies to compare the values.

```ts
const immutable = Impulse.of({
  count: 0,
})
const cloneOfImmutable = immutable.clone()

const mutable = Impulse.of({
  username: Impulse.of(""),
  blacklist: new Set(),
})
const cloneOfMutable = mutable.clone((current) => ({
  username: current.username.clone(),
  blacklist: new Set(current.blacklist),
}))
```

### `watch`

```dart
function watch<TProps>(component: React.FC<TProps>): React.FC<TProps>
```

The `watch` function creates a React component that subscribes to all Impulses calling the [`Impulse#getValue`][impulse__get_value] method during the rendering phase of the component.

The `Counter` component below enqueues a re-render whenever the `count`'s value changes, for instance, when the `Counter`'s button clicks:

```tsx
const Counter: React.FC<{
  count: Impulse<number>
}> = watch(({ count }) => (
  <button onClick={() => count.setValue((x) => x + 1)}>
    {count.getValue()}
  </button>
))
```

But if a component defines an Impulse, passes it thru, or calls the [`Impulse#getValue`][impulse__get_value] method outside of the rendering phase (ex: inside an `onClick` handler), then it does not subscribe to the Impulse changes.

Here the `SumOfTwo` component defines two Impulses, passes them further to the `Counter`s components, and calls [`Impulse#getValue`][impulse__get_value] inside the `button.onClick` handler. It is optional to use the `watch` function in that case:

```tsx
const SumOfTwo: React.FC = () => {
  const firstCounter = useImpulse(0)
  const secondCounter = useImpulse(0)

  return (
    <div>
      <Counter count={firstCounter} />
      <Counter count={secondCounter} />

      <button
        onClick={() => {
          const sum = firstCounter.getValue() + secondCounter.getValue()

          console.log("Sum of two is %d", sum)

          firstCounter.setValue(0)
          secondCounter.setValue(0)
        }}
      >
        Save and reset
      </button>
    </div>
  )
}
```

With or without wrapping the component around the `watch` [HOC][hoc], The `SumOfTwo` component will never re-render due to either `firstCounter` or `secondCounter` updates, but still, it can read and write their values inside the `onClick` listener.

#### `watch.memo`

Alias for

```ts
React.memo(watch(Component))
// equals to
watch.memo(Component)
```

#### `watch.forwardRef`

Alias for

```ts
React.forwardRef(watch(Component))
// equals to
watch.forwardRef(Component)
```

#### `watch.memo.forwardRef` and `watch.forwardRef.memo`

Aliases for

```ts
React.memo(React.forwardRef(watch(Component)))
// equals to
watch.memo.forwardRef(Component)
watch.forwardRef.memo(Component)
```

### `useImpulse`

```dart
function useImpulse<T>(): Impulse<undefined | T>

function useImpulse<T>(
  valueOrInitValue: T | (() => T),
  options?: ImpulseOptions<T>
): Impulse<T>
```

- `[valueOrInitValue]` is an optional value used during the initial render. If the initial value is the result of an expensive computation, you may provide a function instead, which will be executed only on the initial render. If not defined, the Impulse's value is `undefined` but it still can specify the value's type.
- `[options]` is optional [`ImpulseOptions`][impulse_options] object.
  - `[options.compare]` when not defined or `null` then [`Object.is`][object_is] applies as a fallback.

A hook that initiates a stable (never changing) Impulse. It's value can be changed with the [`Impulse#setValue`][impulse__set_value] method though.

> 💬 The initial value is disregarded during subsequent re-renders but compare function is not - it uses the latest function passed to the hook.

> 💡 There is no need to memoize `options.compare` function. The hook does it internally.

```ts
const count = useImpulse(0) // Impulse<number>
const timeout = useImpulse<number>() // Impulse<undefined | number>

const tableSum = useImpulse(() => {
  // the function body runs only once on the initial render
  return bigTable
    .flatMap((wideRow) => wideRow.map((int) => int * 2))
    .reduce((acc, x) => acc + x, 0)
}) // Impulse<number>
```

### `useTransmittingImpulse`

```dart
function useTransmittingImpulse<T>(
  getter: () => T,
  dependencies: DependencyList,
  options?: TransmittingImpulseOptions<T>,
): ReadonlyImpulse<T>

function useTransmittingImpulse<T>(
  getter: () => T,
  dependencies: DependencyList,
  setter: (value: T) => void,
  options?: TransmittingImpulseOptions<T>,
): Impulse<T>
```

- `getter` is a function to read the transmitting value from a source.
- `dependencies` an array of values triggering the re-read of the transmitting value.
- `[setter]` is an optional function to write the transmitting value back to the source. When not defined, the Impulse is readonly.
- `[options]` is an optional [`TransmittingImpulseOptions`][transmitting_impulse_options] object.
  - `[options.compare]` when not defined it uses the `compare` function from the origin Impulse, when `null` the [`Object.is`][object_is] function applies to compare the values.

A hook that initialize a stable (never changing) transmitting Impulse. Look at the [`Impulse.transmit`][impulse__transmit] method for more details and examples.

> 💡 There is no need to memoize neither `getter`, `setter`, nor `options.compare` functions. The hook does it internally.

### `useWatchImpulse`

```dart
function useWatchImpulse<T>(
  watcher: () => T,
  dependencies?: DependencyList,
  options?: UseWatchImpulseOptions<T>
): T
```

- `watcher` is a function that subscribes to all Impulses calling the [`Impulse#getValue`][impulse__get_value] method inside the function.
- `dependencies` is an optional array of dependencies of the `watcher` function. If not defined, the `watcher` function is called on every render.
- `[options]` is an optional [`UseWatchImpulseOptions`][use_watch_impulse_options] object.

The `useWatchImpulse` hook is an alternative to the [`watch`][watch] function. It executes the `watcher` function whenever any of the involved Impulses' value update but enqueues a re-render only when the resulting value is different from the previous.

Custom hooks can use `useWatchImpulse` for reading and transforming the Impulses' values, so the host component doesn't need to wrap around the [`watch`][watch] HOC:

```tsx
const useSumAllAndMultiply = ({
  multiplier,
  counts,
}: {
  multiplier: Impulse<number>
  counts: Impulse<Array<Impulse<number>>>
}): number => {
  return useWatchImpulse(() => {
    const sumAll = counts
      .getValue()
      .map((count) => count.getValue())
      .reduce((acc, x) => acc + x, 0)

    return multiplier.getValue() * sumAll
  })
}
```

Components can scope watched Impulses to reduce re-rendering:

```tsx
const Challenge: React.FC = () => {
  const count = useImpulse(0)
  // the component re-renders only once when the `count` is greater than 5
  const isMoreThanFive = useWatchImpulse(() => count.getValue() > 5)

  return (
    <div>
      <Counter count={count} />

      {isMoreThanFive && <p>You did it 🥳</p>}
    </div>
  )
}
```

> 💬 The `watcher` function is only for reading the Impulses' values. It should never call [`Impulse.of`][impulse__of], [`Impulse#clone`][impulse__clone], or [`Impulse#setValue`][impulse__set_value] methods inside.

> 💡 Keep in mind that the `watcher` function acts as a "reader" so you'd like to avoid heavy computations inside it. Sometimes it might be a good idea to pass a watcher result to a separated memoization hook. The same is true for the `compare` function - you should choose wisely between avoiding extra re-renders and heavy comparisons.

> 💡 There is no need to memoize `options.compare` function. The hook does it internally.

### `useScopedMemo`

```dart
function useScopedMemo<T>(
  factory: () => T,
  dependencies: undefined | DependencyList,
): T
```

- `factory` is a function calculates a value `T` whenever any of the `dependencies`' values change.
- `dependencies` is an array of values used in the `factory` function.

The hook is an Impulse version of the [`React.useMemo`][react__use_memo] hook. During the `factory` execution, all Impulses that call the [`Impulse#getValue`][impulse__get_value] method become _phantom dependencies_ of the hook.

<details><summary><i>Learn more about the phantom dependencies.</i></summary>
<blockquote>

The `factory` runs again whenever any dependency or a value of any phantom dependency changes:

```ts
const useCalcSum = (left: number, right: Impulse<number>): number => {
  // the factory runs whenever:
  // 1. `left` changes
  // 2. `right` changes (new `Impulse`)
  // 3. `right.getValue()` changes (`right` mutates)
  return useScopedMemo(() => {
    return left + right.getValue()
  }, [left, right])
}
```

The phantom dependencies might be different per `factory` call. If an Impulse does not call the [`Impulse#getValue`][impulse__get_value] method, it does not become a phantom dependency:

```ts
const useCalcSum = (left: number, right: Impulse<number>): number => {
  // the factory runs when either:
  //
  // `left` > 0:
  //   1. `left` changes
  //   2. `right` changes (new `Impulse`)
  //   3. `right.getValue()` changes (`right` mutates)
  //
  // OR
  //
  // `left` <= 0:
  //   1. `left` changes
  //   2. `right` changes (new `Impulse`)
  return useScopedMemo(() => {
    if (left > 0) {
      return left + right.getValue()
    }

    return left
  }, [left, right])
}
```

</blockquote>
</details>

### `useScopedCallback`

```dart
function useScopedCallback<TArgs extends ReadonlyArray<unknown>, TResult>(
  callback: (...args: TArgs) => TResult,
  dependencies: DependencyList,
): (...args: TArgs) => TResult
```

- `callback` is a function to memoize, the memoized function updates whenever any of the `dependencies` values change.
- `dependencies` is an array of values used in the `callback` function.

The hook is an Impulse version of the [`React.useCallback`][react__use_callback] hook. During the `callback` execution, all Impulses that call the [`Impulse#getValue`][impulse__get_value] method become _phantom dependencies_ of the hook.

### `useImpulseEffect`

```dart
function useImpulseEffect(
  effect: () => (void | VoidFunction),
  dependencies?: DependencyList,
): void
```

- `effect` is a function that runs whenever any of the `dependencies`' values change.
  Can return a cleanup function to cancel running side effects.
- `[dependencies]` is an optional array of values used in the `effect` function.

The hook is an Impulse version of the [`React.useEffect`][react__use_effect] hook. During the `effect` execution, all Impulses that call the [`Impulse#getValue`][impulse__get_value] method become _phantom dependencies_ of the hook.

<details><summary><i>Learn more about the phantom dependencies.</i></summary>
<blockquote>

The `effect` runs again whenever any dependency or a value of any phantom dependency changes:

```ts
const usePrintSum = (left: number, right: Impulse<number>): void => {
  // the effect runs whenever:
  // 1. `left` changes
  // 2. `right` changes (new `Impulse`)
  // 3. `right.getValue()` changes (`right` mutates)
  useImpulseEffect(() => {
    console.log("sum is %d", left + right.getValue())
  }, [left, right])
}
```

The phantom dependencies might be different per `effect` call. If an Impulse does not call the [`Impulse#getValue`][impulse__get_value] method, it does not become a phantom dependency:

```ts
const usePrintSum = (left: number, right: Impulse<number>): void => {
  // the effect runs when either:
  //
  // `left` > 0:
  //   1. `left` changes
  //   2. `right` changes (new `Impulse`)
  //   3. `right.getValue()` changes (`right` mutates)
  //
  // OR
  //
  // `left` <= 0:
  //   1. `left` changes
  //   2. `right` changes (new `Impulse`)
  useImpulseEffect(() => {
    if (left > 0) {
      console.log("sum is %d", left + right.getValue())
    }
  }, [left, right])
}
```

</blockquote>
</details>

### `useImpulseLayoutEffect`

The hook is an Impulse version of the [`React.useLayoutEffect`][react__use_layout_effect] hook. Acts similar way as [`useImpulseEffect`][use_impulse_effect].

### ~~`useImpulseInsertionEffect`~~

There is no Impulse version of the [`React.useInsertionEffect`][react__use_insertion_effect] hook due to backward compatibility with React from `v16.12.0`. The workaround is to use the native `React.useInsertionEffect` hook with the values extracted beforehand:

```ts
const usePrintSum = (left: number, right: Impulse<number>): void => {
  const rightValue = useWatchImpulse(() => right.getValue())

  React.useInsertionEffect(() => {
    console.log("sum is %d", left + rightValue)
  }, [left, rightValue])
}
```

### `batch`

```dart
function batch(execute: VoidFunction): void
```

The `batch` function is a helper to optimize multiple Impulses updates.

- `execute` is a function that executes multiple [`Impulse#setValue`][impulse__set_value] calls at ones.

```tsx
const SumOfTwo: React.FC<{
  left: Impulse<number>
  right: Impulse<number>
}> = watch(({ left, right }) => (
  <div>
    <span>Sum is: {left.getValue() + right.getValue()}</span>

    <button
      onClick={() => {
        // enqueues 1 re-render instead of 2 🎉
        batch(() => {
          left.setValue(0)
          right.setValue(0)
        })
      }}
    >
      Reset
    </button>
  </div>
))
```

### `subscribe`

```dart
function subscribe(listener: VoidFunction): VoidFunction
```

A function that subscribes to changes of all `Impulse` instances that call the [`Impulse#getValue`][impulse__get_value] method inside the `listener`. Returns a cleanup function that unsubscribes the `listener`. The `listener` calls first time synchronously when `subscribe` is called.

It is useful for subscribing to changes of multiple Impulses at once:

```ts
const impulse_1 = new Impulse(1)
const impulse_2 = new Impulse(2)
const impulse_3 = new Impulse("calculating...")

const unsubscribe = subscribe(() => {
  if (impulse_1.getValue() > 1) {
    const sum = impulse_2.getValue() + impulse_3.getValue()
    impulse_3.setValue(`done: ${sum}`)
  }
})
```

In the example above the `listener` will not react on the `impulse_2` updates until the `impulse_1` value is greater than `1`. The `impulse_3` updates will never trigger the `listener`, because the `impulse_3.getValue()` is not called inside the `listener`.

### `type ReadonlyImpulse`

A type alias for `Impulse` that does not have the [`Impulse#setValue`][impulse__set_value] method. It might be handy to store some value inside an Impulse, so the value change trigger a host component re-render only if the component reads the value from the Impulse.

### `interface ImpulseOptions`

```ts
interface ImpulseOptions<T> {
  compare?: null | Compare<T>
}
```

- `[compare]` is an optional [`Compare`][compare] function that determines whether or not a new Impulse's value replaces the current one. In many cases specifying the function leads to better performance because it prevents unnecessary updates. But keep the balance between the performance and the complexity of the function - sometimes it might be better to replace the value without heavy comparisons.

### `interface TransmittingImpulseOptions`

```ts
interface TransmittingImpulseOptions<T> {
  compare?: null | Compare<T>
}
```

- `[compare]` is an optional [`Compare`][compare] function that determines whether or not a transmitting value changes when reading it from an external source.

  <details><summary><i>Showcase: use compare function in transmitting Impulse</i></summary>
  <blockquote>

  ```ts
  const source = Impulse.of(1)

  const counter_1 = Impulse.transmit(
    // the getter function creates a new object on every read
    () => ({ count: source.getValue() }),
    ({ count }) => source.setValue(count),
  )

  counter_1.getValue() // { count: 1 }
  counter_1.getValue() === counter_1.getValue() // false

  // let's transmit the value but with compare function defined

  const counter_1 = Impulse.transmit(
    // the getter function creates a new object on every read
    // but if they are compared equal, the transmitting value is not changed
    () => ({ count: source.getValue() }),
    ({ count }) => source.setValue(count),
    {
      compare: (left, right) => left.count === right.count,
    },
  )

  counter_2.getValue() // { count: 1 }
  counter_2.getValue() === counter_2.getValue() // true
  ```

  </blockquote>
  </details>

### `interface UseWatchImpulseOptions`

```ts
interface UseWatchImpulseOptions<T> {
  compare?: null | Compare<T>
}
```

- `[compare]` is an optional [`Compare`][compare] function that determines whether or not the watcher result is different. If the watcher result is different, a host component re-renders. In many cases specifying the function leads to better performance because it prevents unnecessary updates.

### `type Compare`

```ts
type Compare<T> = (left: T, right: T) => boolean
```

A function that compares two values and returns `true` if they are equal. Depending on the type of the values it might be reasonable to use a custom compare function such as shallow-equal or deep-equal.

## ESLint

Want to see ESLint suggestions for the dependencies? Add the hook name to the ESLint rule override:

```json
{
  "react-hooks/exhaustive-deps": [
    "error",
    {
      "additionalHooks": "(useTransmittingImpulse|useWatchImpulse|useImpulse(Effect|LayoutEffect|Memo|Callback))"
    }
  ]
}
```

<!-- L I N K S -->

[impulse__of]: #impulseof
[impulse__transmit]: #impulsetransmit
[impulse__clone]: #impulseclone
[impulse__get_value]: #impulsegetvalue
[impulse__set_value]: #impulsesetvalue
[use_impulse]: #useimpulse
[use_transmitting_impulse]: #usetransmittingimpulse
[use_impulse_effect]: #useimpulseeffect
[watch]: #watch
[batch]: #batch
[impulse_options]: #interface-impulseoptions
[transmitting_impulse_options]: #interface-transmittingimpulseoptions
[use_watch_impulse_options]: #interface-usewatchimpulseoptions
[compare]: #type-compare

<!-- E X T E R N A L  L I N K S -->

[object_is]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#description
[hoc]: https://reactjs.org/docs/higher-order-components.html
[react__use_memo]: https://react.dev/reference/react/useMemo
[react__use_callback]: https://react.dev/reference/react/useCallback
[react__use_effect]: https://react.dev/reference/react/useEffect
[react__use_layout_effect]: https://react.dev/reference/react/useLayoutEffect
[react__use_insertion_effect]: https://react.dev/reference/react/useInsertionEffect
