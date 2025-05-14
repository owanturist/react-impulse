# `react-impulse`

[![codecov](https://codecov.io/gh/owanturist/react-impulse/branch/master/graph/badge.svg?token=QP3SXO8E9F)](https://codecov.io/gh/owanturist/react-impulse)
![known vulnerabilities](https://snyk.io/test/github/owanturist/react-impulse/badge.svg)
![types](https://badgen.net/npm/types/react-impulse)
[![npm version](https://badge.fury.io/js/react-impulse.svg)](https://badge.fury.io/js/react-impulse)

The clean and natural React state management.

```bash
# with yarn
yarn add react-impulse

# with npm
npm install react-impulse
```

## Quick start

`Impulse` is a box holding any value you want, even another `Impulse`! All components that execute the [`Impulse#getValue`][impulse__get_value] during the rendering phase enqueue re-render whenever the Impulse value updates.

```tsx
import { Impulse, useScope } from "react-impulse"

const Input: React.FC<{
  type: "email" | "password"
  value: Impulse<string>
}> = ({ type, value }) => {
  const scope = useScope()

  return (
    <input
      type={type}
      value={value.getValue(scope)}
      onChange={(event) => value.setValue(event.target.value)}
    />
  )
}

const Checkbox: React.FC<{
  checked: Impulse<boolean>
  children: React.ReactNode
}> = ({ checked, children }) => {
  const scope = useScope()
  // the `scope` is passed to the `Impulse#getValue` method
  return (
    <label>
      <input
        type="checkbox"
        checked={checked.getValue(scope)}
        onChange={(event) => checked.setValue(event.target.checked)}
      />

      {children}
    </label>
  )
}
```

Once created, Impulses can travel thru your components, where you can set and get their values:

```tsx
import { Impulse, useScope } from "react-impulse"

const SignUp: React.FC = () => {
  const scope = useScope()
  const [{ username, password, isAgreeWithTerms }] = React.useState({
    username: Impulse(""),
    password: Impulse(""),
    isAgreeWithTerms: Impulse(false),
  })

  return (
    <form>
      <Input type="email" value={username} />
      <Input type="password" value={password} />
      <Checkbox checked={isAgreeWithTerms}>I agree with terms of use</Checkbox>

      <button
        type="button"
        disabled={!isAgreeWithTerms.getValue(scope)}
        onClick={() => {
          tap((scope) => {
            api.submitSignUpRequest({
              username: username.getValue(scope),
              password: password.getValue(scope),
            })
          })
        }}
      >
        Sign Up
      </button>
    </form>
  )
}
```

## API

A core piece of the library is the `Impulse` class - a box that holds value. The value might be anything you like as long as it does not mutate. The class instances are mutable by design, but other Impulses can use them as values.

### `Impulse`

The impulse type and factory. Returns an impulse instance which extends [`ReadableImpulse`][readable_impulse] and [`WritableImpulse`][writable_impulse] interfaces.

```dart
Impulse<T>(): Impulse<undefined | T>

Impulse<T>(
  initialValue: T,
  options?: ImpulseOptions<T>
): Impulse<T>
```

- `[initialValue]` is an optional initial value. If not defined, the Impulse's value is `undefined` but it still can specify the value's type.
- `[options]` is an optional [`ImpulseOptions`][impulse_options] object.
  - `[options.compare]` when not defined or `null` then [`Object.is`][object_is] applies as a fallback.

<details><summary><i>Showcase: bidirectional sync between React state and Impulse</i></summary>
<blockquote>

```tsx
const Counter: React.FC = () => {
  const [count, setCount] = React.useState(0)

  const [countImpulse] = React.useState(() => Impulse(count))

  React.useEffect(() => {
    // sync the state with the Impulse
    countImpulse.setValue(count)
  }, [count, countImpulse])

  useScopedEffect(
    (scope) => {
      // sync the Impulse with the state
      setValue(countImpulse.getValue(scope))
    },
    [countImpulse],
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

<details><summary><i>Showcase: bidirectional sync between Redux store and Impulse</i></summary>
<blockquote>

```tsx
import { useSelector, useDispatch } from "react-redux"

const Counter: React.FC = () => {
  const count = useSelector((state) => state.count)
  const dispatch = useDispatch()

  const [countImpulse] = React.useState(() => Impulse(count))

  React.useEffect(() => {
    // sync the state with the Impulse
    countImpulse.setValue(count)
  }, [count, countImpulse])

  useScopedEffect(
    (scope) => {
      // sync the Impulse with the state
      dispatch({ type: "SET_COUNT", payload: countImpulse.getValue(scope) })
    },
    [countImpulse, dispatch],
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

### `Impulse` derived

```dart
Impulse<T>(
  getter: (scope: Scope) => T,
  options?: ImpulseOptions<T>,
): ReadonlyImpulse<T>

Impulse<T>(
  getter: ReadableImpulse<T> | ((scope: Scope) => T),
  setter: WritableImpulse<T> | ((value: T, scope: Scope) => void),
  options?: ImpulseOptions<T>,
): Impulse<T>
```

- `getter` is either anything that implements the [`ReadableImpulse`][readable_impulse] interface or a function to read the derived value from the source.
- `[setter]` is either anything that implements the [`WritableImpulse`][writable_impulse] interface or a function to write the derived value back to the source. When not defined, the resulting Impulse is readonly.
- `[options]` is an optional [`ImpulseOptions`][impulse_options] object.
  - `[options.compare]` when not defined or `null` then [`Object.is`][object_is] applies as a fallback.

A function that creates a new derived Impulse. A derived Impulse is an Impulse that keeps the derived value in memory and updates it whenever the source value changes. A source is another Impulse or multiple Impulses.

<details><summary><i>Showcase: derived from Impulse</i></summary>
<blockquote>

```tsx
const Drawer: React.FC<{
  isOpen: Impulse<boolean>
  children: React.ReactNode
}> = ({ isOpen, children }) => {
  const scope = useScope()

  if (!isOpen.getValue(scope)) {
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
}

const ProductDetailsDrawer: React.FC<{
  product: Impulse<undefined | Product>
}> = ({ product }) => {
  const isOpen = React.useMemo(() => {
    return Impulse(
      (scope) => product.getValue(scope) != null,
      (open) => {
        if (!open) {
          product.setValue(undefined)
        }
      },
    )
  }, [product])

  return (
    <Drawer isOpen={isOpen}>
      <ProductDetails product={product} />
    </Drawer>
  )
}
```

</blockquote>
</details>

<details><summary><i>Showcase: derived from many Impulses</i></summary>
<blockquote>

```tsx
const Checkbox: React.FC<{
  checked: Impulse<boolean>
}> = ({ checked, children }) => {
  const scope = useScope()

  return (
    <input
      type="checkbox"
      checked={checked.getValue(scope)}
      onChange={(event) => checked.setValue(event.target.checked)}
    />
  )
}

const Agreements: React.FC<{
  isAgreeWithTermsOfUse: Impulse<boolean>
  isAgreeWithPrivacy: Impulse<boolean>
}> = ({ isAgreeWithTermsOfUse, isAgreeWithPrivacy }) => {
  const isAgreeWithAll = React.useMemo(() => {
    return Impulse(
      (scope) =>
        isAgreeWithTermsOfUse.getValue(scope) &&
        isAgreeWithPrivacy.getValue(scope),
      (agree) => {
        isAgreeWithTermsOfUse.setValue(agree)
        isAgreeWithPrivacy.setValue(agree)
      },
    )
  }, [isAgreeWithTermsOfUse, isAgreeWithPrivacy])

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
}
```

</blockquote>
</details>

### `Impulse#getValue`

```dart
Impulse<T>#getValue(scope: Scope): T
```

An `Impulse` instance's method that returns the current value.

- `scope` is [`Scope`][scope] that tracks the Impulse value changes.
- `[select]` is an optional function that applies to the current value before returning.

```ts
const count = Impulse(3)

tap((scope) => {
  count.getValue(scope) // === 3
})
```

### `Impulse#setValue`

```dart
Impulse<T>#setValue(
  valueOrTransform: T | ((currentValue: T, scope: Scope) => T),
): void
```

An `Impulse` instance's method to update the value.

- `valueOrTransform` is the new value or a function that transforms the current value.

```ts
tap((scope) => {
  const isActive = Impulse(false)

  isActive.setValue((x) => !x)
  isActive.getValue(scope) // true

  isActive.setValue(false)
  isActive.getValue(scope) // false
})
```

> 💡 If `valueOrTransform` argument is a function it acts as [`batch`][batch].

> 💬 The method returns `void` to emphasize that `Impulse` instances are **mutable**.

### `Impulse#clone`

```dart
Impulse<T>#clone(
  options?: ImpulseOptions<T>,
): Impulse<T>

Impulse<T>#clone(
  transform?: (value: T, scope: Scope) => T,
  options?: ImpulseOptions<T>,
): Impulse<T>
```

An `Impulse` instance's method for cloning an Impulse. When cloning a derived Impulse, the new Impulse is not deriving, meaning that it does not read nor write the value from/to the external source but instead it holds the derived value on the moment of cloning.

- `[transform]` is an optional function that applies to the current value before cloning. It might be handy when cloning mutable values.
- `[options]` is optional [`ImpulseOptions`][impulse_options] object.
  - `[options.compare]` when not defined it uses the `compare` function from the origin Impulse, when `null` the [`Object.is`][object_is] function applies to compare the values.

```ts
const immutable = Impulse({
  count: 0,
})
const cloneOfImmutable = immutable.clone()

const mutable = Impulse({
  username: Impulse(""),
  blacklist: new Set(),
})
const cloneOfMutable = mutable.clone((current) => ({
  username: current.username.clone(),
  blacklist: new Set(current.blacklist),
}))
```

### `Scope`

`Scope` is a bridge that connects Impulses with host components. It tracks the Impulses' value changes and enqueues re-renders of the host components that read the Impulses' values. The only way to read an Impulse's value is to call the [`Impulse#getValue`][impulse__get_value] method with `Scope` passed as the first argument. The following are the primary ways to create a `Scope`:

- [`useScope`][use_scope] hook returns a `Scope` instance. It is a handy way to create a single component/hook-wide scope. It lacks granularity but is easy to use.
- [`useScoped`][use_scoped] hook provides the `scope` argument. It can be used in custom hooks or inside components to narrow down the re-rendering scope.
- [`subscribe`][subscribe] function provides the `scope` argument. It is useful outside of the React world.
- [`batch`][batch] function provides the `scope` argument. Use it to optimize multiple Impulses updates or to access the Impulses' values inside async operations.
- [`untrack`][untrack] function provides the `scope` argument. Use it when you need to read Impulses' values without reactivity.
- [`useScopedCallback`][use_scoped_callback], [`useScopedMemo`][use_scoped_memo], [`useScopedEffect`][use_scoped_effect], [`useScopedLayoutEffect`][use_scoped_layout_effect] hooks provide the `scope` argument. They are enchanted versions of the React hooks that provide the `scope` argument as the first argument.

### `useScoped`

```dart
function useScoped<TValue>(impulse: ReadableImpulse<TValue>): TValue

function useScoped<T>(
  factory: (scope: Scope) => T,
  dependencies?: DependencyList,
  options?: UseScopedOptions<T>
): T
```

- `impulse` is anything that implements the [`ReadableImpulse`][readable_impulse] interface.
- `factory` is a function that provides [`Scope`][scope] as the first argument and subscribes to all Impulses calling the [`Impulse#getValue`][impulse__get_value] method inside the function.
- `dependencies` is an optional array of dependencies of the `factory` function. If not defined, the `factory` function is called on every render.
- `[options]` is an optional [`UseScopedOptions`][use_scoped_options] object.

The `useScoped` hook is the most common way to **read Impulses' values**. It either executes the `factory` function whenever any of the scoped Impulses' value update or reads the `impulse` value but enqueues a re-render only when the resulting value is different from the previous.

```tsx
const useSumAllAndMultiply = ({
  multiplier,
  counts,
}: {
  multiplier: Impulse<number>
  counts: Impulse<Array<Impulse<number>>>
}): number => {
  return useScoped((scope) => {
    const sumAll = counts
      .getValue(scope)
      .map((count) => count.getValue(scope))
      .reduce((acc, x) => acc + x, 0)

    return multiplier.getValue(scope) * sumAll
  })
}
```

Components can scope watched Impulses to reduce re-rendering:

```tsx
const Challenge: React.FC = () => {
  const [count] = React.useState(Impulse(0))
  // the component re-renders only once when the `count` is greater than 5
  const isMoreThanFive = useScoped((scope) => count.getValue(scope) > 5)

  return (
    <div>
      <Counter count={count} />

      {isMoreThanFive && <p>You did it 🥳</p>}
    </div>
  )
}
```

> 💬 The `factory` function is only for reading the Impulses' values. It should never call [`Impulse`][impulse], [`Impulse#clone`][impulse__clone], or [`Impulse#setValue`][impulse__set_value] methods inside.

> 💡 Keep in mind that the `factory` function acts as a "reader" so you'd like to avoid heavy computations inside it. Sometimes it might be a good idea to pass a factory result to a separated memoization hook. The same is true for the `compare` function - you should choose wisely between avoiding extra re-renders and heavy comparisons.

> 💡 There is no need to memoize `options.compare` function. The hook does it internally.

### `useScope`

Alias for `useScoped(identity)`.

### `useScopedMemo`

```dart
function useScopedMemo<T>(
  factory: (scope: Scope) => T,
  dependencies: DependencyList,
): T
```

- `factory` is a function that provides [`Scope`][scope] as the first argument and calculates a value `T` whenever any of the `dependencies`' values change.
- `dependencies` is an array of values used in the `factory` function.

The hook is an enchanted [`React.useMemo`][react__use_memo] hook.

### `useScopedCallback`

```dart
function useScopedCallback<TArgs extends ReadonlyArray<unknown>, TResult>(
  callback: (scope: Scope, ...args: TArgs) => TResult,
  dependencies: DependencyList,
): (...args: TArgs) => TResult
```

- `callback` is a function to memoize, the memoized function injects [`Scope`][scope] as the first argument and updates whenever any of the `dependencies` values change.
- `dependencies` is an array of values used in the `callback` function.

The hook is an enchanted [`React.useCallback`][react__use_callback] hook.

### `useScopedEffect`

```dart
function useScopedEffect(
  effect: (scope: Scope) => void | VoidFunction,
  dependencies?: DependencyList,
): void
```

- `effect` is a function that provides [`Scope`][scope] as the first argument and runs whenever any of the `dependencies`' values change.
  Can return a cleanup function to cancel running side effects.
- `[dependencies]` is an optional array of values used in the `effect` function.

The hook is an enchanted [`React.useEffect`][react__use_effect] hook.

### `useScopedLayoutEffect`

The hook is an enchanted [`React.useLayoutEffect`][react__use_layout_effect] hook. Acts similar way as [`useScopedEffect`][use_scoped_effect].

### ~~`useScopedInsertionEffect`~~

There is no enchanted version of the [`React.useInsertionEffect`][react__use_insertion_effect] hook due to backward compatibility with React from `v16.12.0`. The workaround is to use the native `React.useInsertionEffect` hook with the values extracted beforehand:

```ts
const usePrintSum = (left: number, right: Impulse<number>): void => {
  const rightValue = useScoped((scope) => right.getValue(scope))

  React.useInsertionEffect(() => {
    console.log("sum is %d", left + rightValue)
  }, [left, rightValue])
}
```

### `batch`

```dart
function batch(execute: (scope: Scope) => void): void
```

The `batch` function is a helper to optimize multiple Impulses updates. It provides a [`Scope`][scope] to the `execute` function so it is useful when an async operation accesses the Impulses' values.

- `execute` is a function that executes multiple [`Impulse#setValue`][impulse__set_value] calls at ones.

```tsx
const SumOfTwo: React.FC<{
  left: Impulse<number>
  right: Impulse<number>
}> = ({ left, right }) => {
  const scope = useScope()

  return (
    <div>
      <span>Sum is: {left.getValue(scope) + right.getValue(scope)}</span>

      <button
        onClick={() => {
          batch((scope) => {
            console.log(
              "resetting the sum %d",
              left.getValue(scope) + right.getValue(scope),
            )

            // enqueues 1 re-render instead of 2 🎉
            left.setValue(0)
            right.setValue(0)
          })
        }}
      >
        Reset
      </button>
    </div>
  )
}
```

### `tap`

Alias for [`batch`][batch].

### `untrack`

```dart
function untrack<TResult>(factory: (scope: Scope) => TResult): TResult
function untrack<TValue>(impulse: ReadableImpulse<TValue>): TValue
```

The `untrack` function is a helper to read Impulses' values without reactivity. It provides a [`Scope`][scope] to the `factory` function and returns the result of the function. Acts as [`batch`][batch].

### `subscribe`

```dart
function subscribe(listener: (scope: Scope) => void | VoidFunction): VoidFunction
```

- `listener` is a function that provides [`Scope`][scope] as the first argument and subscribes to changes of all `Impulse` instances that call the [`Impulse#getValue`][impulse__get_value] method inside the `listener`. If `listener` returns a function then it will be called before the next `listener` call.

Returns a cleanup function that unsubscribes the `listener`. The `listener` calls first time synchronously when `subscribe` is called.

It is useful for subscribing to changes of multiple Impulses at once:

```ts
const impulse_1 = new Impulse(1)
const impulse_2 = new Impulse(2)
const impulse_3 = new Impulse("calculating...")

const unsubscribe = subscribe((scope) => {
  if (impulse_1.getValue(scope) > 1) {
    const sum = impulse_2.getValue(scope) + impulse_3.getValue(scope)
    impulse_3.setValue(`done: ${sum}`)
  }
})
```

In the example above the `listener` will not react on the `impulse_2` updates until the `impulse_1` value is greater than `1`. The `impulse_3` updates will never trigger the `listener`, because the `impulse_3.getValue(scope)` is not called inside the `listener`.

> 💬 The `subscribe` function is the only function that injects [`Scope`][scope] to the `Impulse#toJSON()` and `Impulse#toString()` methods because the methods do not have access to the `scope`:
>
> ```ts
> const counter = Impulse({ count: 0 })
>
> subscribe(() => {
>   console.log(JSON.stringify(counter))
> })
> // console: {"count":0}
>
> counter.setValue(2)
> // console: {"count":2}
> ```

### `isImpulse`

```dart
isImpulse<T, Unknown = unknown>(
  input: Unknown | Impulse<T>,
): input is Impulse<T>

isImpulse<T, Unknown = unknown>(
  scope: Scope,
  check: (value: unknown) => value is T,
  input: Unknown | Impulse<T>,
): input is Impulse<T>
```

A function that checks whether the `input` is an `Impulse` instance. If the `check` function is provided, it checks the Impulse's value to match the `check` function.

### `isDerivedImpulse`

```dart
isDerivedImpulse<T, Unknown = unknown>(
  input: Unknown | Impulse<T>,
): input is Impulse<T>

isDerivedImpulse<T, Unknown = unknown>(
  scope: Scope,
  check: (value: unknown) => value is T,
  input: Unknown | Impulse<T>,
): input is Impulse<T>
```

A function that checks whether the `input` is a `DerivedImpulse` instance. If the `check` function is provided, it checks the Impulse's value to match the `check` function.

### `interface ReadableImpulse`

An interface that defines the `getValue` method.

### `interface WritableImpulse`

An interface that defines the `setValue` method.

### `type ReadonlyImpulse`

A type alias for `Impulse` that does not have the [`Impulse#setValue`][impulse__set_value] method. It might be handy to store some value inside an Impulse, so the value change trigger a host component re-render only if the component reads the value from the Impulse.

### `interface ImpulseOptions`

```ts
interface ImpulseOptions<T> {
  compare?: null | Compare<T>
}
```

- `[compare]` is an optional [`Compare`][compare] function that determines whether or not a new Impulse's value replaces the current one. In many cases specifying the function leads to better performance because it prevents unnecessary updates. But keep an eye on the balance between the performance and the complexity of the function - sometimes it might be better to replace the value without heavy comparisons.

### `interface UseScopedOptions`

```ts
interface UseScopedOptions<T> {
  compare?: null | Compare<T>
}
```

- `[compare]` is an optional [`Compare`][compare] function that determines whether or not the factory result is different. If the factory result is different, a host component re-renders. In many cases specifying the function leads to better performance because it prevents unnecessary updates.

### `type Compare`

```ts
type Compare<T> = (left: T, right: T, scope: Scope) => boolean
```

A function that compares two values and returns `true` if they are equal. Depending on the type of the values it might be reasonable to use a custom compare function such as shallow-equal or deep-equal.

## ESLint

Want to see ESLint suggestions for the dependencies? Add the hook name to the ESLint rule override:

```json
{
  "react-hooks/exhaustive-deps": [
    "error",
    {
      "additionalHooks": "useScoped(|Effect|LayoutEffect|Memo|Callback)"
    }
  ]
}
```

<!-- L I N K S -->

[impulse]: #impulse
[impulse__clone]: #impulseclone
[impulse__get_value]: #impulsegetvalue
[impulse__set_value]: #impulsesetvalue
[use_scope]: #usescope
[use_scoped]: #usescoped
[use_scoped_callback]: #usescopedcallback
[use_scoped_memo]: #usescopedmemo
[use_scoped_effect]: #usescopedeffect
[use_scoped_layout_effect]: #usescopedlayouteffect
[scope]: #scope
[batch]: #batch
[untrack]: #untrack
[subscribe]: #subscribe
[readable_impulse]: #interface-readableimpulse
[writable_impulse]: #interface-writableimpulse
[impulse_options]: #interface-impulseoptions
[use_scoped_options]: #interface-useScopedoptions
[compare]: #type-compare

<!-- E X T E R N A L  L I N K S -->

[object_is]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#description
[hoc]: https://reactjs.org/docs/higher-order-components.html
[react__use_memo]: https://react.dev/reference/react/useMemo
[react__use_callback]: https://react.dev/reference/react/useCallback
[react__use_effect]: https://react.dev/reference/react/useEffect
[react__use_layout_effect]: https://react.dev/reference/react/useLayoutEffect
[react__use_insertion_effect]: https://react.dev/reference/react/useInsertionEffect
