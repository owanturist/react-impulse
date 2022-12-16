# `react-sweety`

[![codecov](https://codecov.io/gh/owanturist/react-sweety/branch/master/graph/badge.svg?token=QP3SXO8E9F)](https://codecov.io/gh/owanturist/react-sweety)
![known vulnerabilities](https://snyk.io/test/github/owanturist/react-sweety/badge.svg)
![minified + gzip](https://badgen.net/bundlephobia/minzip/react-sweety)
![dependency count](https://badgen.net/bundlephobia/dependency-count/react-sweety)
![types](https://badgen.net/npm/types/react-sweety)

The clean and natural React state management.

```bash
# with yarn
yarn add react-sweety

# with npm
npm install react-sweety
```

## Quick start

`Sweety` is a box holding any value you want, even another `Sweety`! All [`watch`][watch]ed components that execute the [`Sweety#getState`][sweety__get_state] during the rendering phase enqueue re-render whenever the `Sweety` instance's state updates.

```tsx
import { Sweety, watch } from "react-sweety"

const Input: React.FC<{
  type: "email" | "password"
  value: Sweety<string>
}> = watch(({ type, value }) => (
  <input
    type={type}
    value={value.getState()}
    onChange={(event) => value.setState(event.target.value)}
  />
))

const Checkbox: React.FC<{
  checked: Sweety<boolean>
  children: React.ReactNode
}> = watch(({ checked, children }) => (
  <label>
    <input
      type="checkbox"
      checked={checked.getState()}
      onChange={(event) => checked.setState(event.target.checked)}
    />

    {children}
  </label>
))
```

Once created, `Sweety` instances can travel thru your components, where you can set and get their states:

```tsx
import { useSweety, watch } from "react-sweety"

const SignUp: React.FC = watch(() => {
  const username = useSweety("")
  const password = useSweety("")
  const isAgreeWithTerms = useSweety(false)

  return (
    <form>
      <Input type="email" value={username} />
      <Input type="password" value={password} />
      <Checkbox checked={isAgreeWithTerms}>I agree with terms of use</Checkbox>

      <button
        type="button"
        disabled={!isAgreeWithTerms.getState()}
        onClick={() => {
          api.submitSignUpRequest({
            username: username.getState(),
            password: password.getState(),
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

- [Todo MVC](https://codesandbox.io/s/react-sweety-todo-mvc-inr46?file=/src/TodoApp.tsx) - an implementation of [todomvc.com](https://todomvc.com) template.
- [Obstacle maze](https://obstacle-maze.surge.sh) - an application to build and solve mazes with [source code](https://github.com/owanturist/obstacle-maze) at GitHub.
- [Catanstat](https://catanstat.surge.sh) - an application to track [Catan](https://www.catan.com) game statistics with [source code](https://github.com/owanturist/catanstat) at GitHub.

## API

A core piece of the library is the `Sweety` class - a box that holds value. The value might be anything you like as long as it does not mutate. The class instances are mutable by design, but other `Sweety` instances can use them as values.

### `Sweety.of`

```dart
Sweety.of<T>(
  initialState: T,
  compare?: null | Compare<T>
): Sweety<T>
```

A static method that creates a new `Sweety` instance.

- `initialState` is the initial state.
- `[compare]` is an optional [`Compare`][compare] function applied as [`Sweety#compare`][sweety__compare]. When not defined or `null` then [`Object.is`][object_is] applies as a fallback.

> 💡 The [`useSweety`][use_sweety] hook helps to create and store a `Sweety` instance inside a React component.

### `Sweety#getState`

```dart
Sweety<T>#getState(): T
Sweety<T>#getState<R>(select: (state: T) => R): R
```

A `Sweety` instance's method that returns the current state.

- `[select]` is an optional function that applies to the current state before returning.

```ts
const count = Sweety.of(3)

count.getState() // === 3
count.getState((x) => x > 0) // === true
```

### `Sweety#setState`

```dart
Sweety<T>#setState(
  stateOrTransform: React.SetStateAction<T>,
  compare?: null | Compare<T>
): void
```

A `Sweety` instance's method to update the state. All listeners registered via the [`Sweety#subscribe`][sweety__subscribe] method execute whenever the instance's state updates.

- `stateOrTransform` is the new state or a function that transforms the current state into the new state.
- `[compare]` is an optional [`Compare`][compare] function applied for this call only.
  When not defined the [`Sweety#compare`][sweety__compare] function of the instance will be used.
  When `null` the [`Object.is`][object_is] function applies to compare the states.

```ts
const isActive = Sweety.of(false)

isActive.setState((x) => !x)
isActive.getState() // true

isActive.setState(false)
isActive.getState() // false
```

> 💡 If `stateOrTransform` argument is a function it acts as [`batch`][batch].

> 💬 The method returns `void` to emphasize that `Sweety` instances are **mutable**.

> 💬 The second argument `compare` function has medium priority, so it will be used instead of [`Sweety#compare`][sweety__compare].

### `Sweety#clone`

```dart
Sweety<T>#clone(
  transform?: (state: T) => T,
  compare?: null | Compare<T>
): Sweety<T>
```

A `Sweety` instance's method for cloning a `Sweety` instance.

- `[transform]` is an optional function that applies to the current state before cloning. It might be handy when cloning a state that contains mutable values.
- `[compare]` is an optional [`Compare`][compare] function applied as [`Sweety#compare`][sweety__compare].
  When not defined, it uses the [`Sweety#compare`][sweety__compare] function from the origin.
  When `null` the [`Object.is`][object_is] function applies to compare the states.

```ts
const immutable = Sweety.of({
  count: 0,
})
const cloneOfImmutable = immutable.clone()

const mutable = Sweety.of({
  counters: [Sweety.of(0), Sweety.of(1)],
})
const cloneOfMutable = mutable.clone(({ counters }) => ({
  counters: counters.map((counter) => counter.clone()),
}))
```

### `Sweety#compare`

```dart
Sweety<T>#compare: Compare<T>
```

The [`Compare`][compare] function compares the state of a `Sweety` instance with the new state given via [`Sweety#setState`][sweety__set_state]. Whenever the function returns `true`, neither the state change nor it notifies the listeners subscribed via [`Sweety#subscribe`][sweety__subscribe].

> 💬 The `Sweety#compare` function has the lowest priority when [`Sweety#setState`][sweety__set_state], [`useSweetyState`][use_sweety_state], [`useSetSweetyState`][use_set_sweety_state] or [`useSweetyReducer`][use_sweety_reducer] execute.

### `Sweety#key`

```dart
Sweety<T>#key: string
```

Each `Sweety` instance has a unique key. It might get handy as the React `key` property.

### `Sweety#subscribe`

```dart
Sweety<T>#subscribe(listener: VoidFunction): VoidFunction
```

A `Sweety` instance's method that subscribes to the state's updates caused by calling [`Sweety#setState`][sweety__set_state]. Returns a cleanup function that unsubscribes the `listener`.

- `listener` is a function that subscribes to the updates.

```ts
const count = Sweety.of(0)
const unsubscribe = count.subscribe(() => {
  console.log("The count is %d", count.getState())
})

count.setState(10) // console: "The count is 10"

unsubscribe()
count.setState(20) // ...
```

> 💬 You'd like to avoid using the method in your application because it's been designed for convenient use in the exposed hooks and the [`watch`][watch] HOC.

### `watch`

```dart
function watch<TProps>(component: React.FC<TProps>): React.FC<TProps>
```

The `watch` function creates a React component that subscribes to all `Sweety` instances calling the [`Sweety#getState`][sweety__get_state] method during the rendering phase of the component.

The `Counter` component below enqueues a re-render whenever the `count`'s state changes, for instance, when the `Counter`'s button clicks:

```tsx
const Counter: React.FC<{
  count: Sweety<number>
}> = watch(({ count }) => (
  <button onClick={() => count.setState((x) => x + 1)}>
    {count.getState()}
  </button>
))
```

But if a component defines a `Sweety` instance, passes it thru, or calls the [`Sweety#getState`][sweety__get_state] method outside of the rendering phase (ex: as part of event listeners handlers), then it does not subscribe to the `Sweety` instances changes.

Here the `SumOfTwo` component defines two `Sweety` instances, passes them further to the `Counter`s components, and calls [`Sweety#getState`][sweety__get_state] inside the `button.onClick` handler. It is optional to use the `watch` function in that case:

```tsx
const SumOfTwo: React.FC = () => {
  const firstCounter = useSweety(0)
  const secondCounter = useSweety(0)

  return (
    <div>
      <Counter count={firstCounter} />
      <Counter count={secondCounter} />

      <button
        onClick={() => {
          const sum = firstCounter.getState() + secondCounter.getState()

          console.log("Sum of two is %d", sum)

          firstCounter.setState(0)
          secondCounter.setState(0)
        }}
      >
        Save and reset
      </button>
    </div>
  )
}
```

With or without wrapping the component around the `watch` [HOC][hoc], The `SumOfTwo` component will never re-render due to either `firstCounter` or `secondCounter` updates, but still, it can read and write their states inside the `onClick` listener.

#### `watch.memo`

Alias for

```ts
React.memo(watch(/* */))
watch.memo(/* */)
```

#### `watch.forwardRef`

Alias for

```ts
React.forwardRef(watch(/* */))
watch.forwardRef(/* */)
```

#### `watch.memo.forwardRef` and `watch.forwardRef.memo`

Aliases for

```ts
React.memo(React.forwardRef(watch(/* */)))
watch.memo.forwardRef(/* */)
watch.forwardRef.memo(/* */)
```

### `useSweety`

```dart
function useSweety<T>(initialState: T): Sweety<T>
function useSweety<T>(lazyInitialState: () => T): Sweety<T>
```

A hook that initiates a stable (never changing) `Sweety` instance.

The `initialState` argument is the state used during the initial render. If the initial state is the result of an expensive computation, you may provide the `lazyInitialState` function instead, which will be executed only on the initial render.

> 💬 The initial state is disregarded during subsequent re-renders.

### `useWatchSweety`

```dart
function useWatchSweety<T>(
  watcher: () => T,
  compare?: null | Compare<T>
): T
```

- `watcher` is a function that subscribes to all `Sweety` instances calling the [`Sweety#getState`][sweety__get_state] method inside the function.
- `[compare]` is an optional [`Compare`][compare] function. When not defined or `null` then [`Object.is`][object_is] applies as a fallback.

The `useWatchSweety` hook is an alternative to the [`watch`][watch] function. It executes the `watcher` function whenever any of the involved `Sweety` instances' state update but enqueues a re-render only when the resulting value is different from the previous.

Custom hooks can use `useWatchSweety` for reading and transforming the `Sweety` instances' states, so the host component doesn't need to wrap around the [`watch`][watch] HOC:

```tsx
const useSumAllAndMultiply = ({
  multiplier,
  counts,
}: {
  multiplier: Sweety<number>
  counts: Sweety<Array<Sweety<number>>>
}): number => {
  return useWatchSweety(() => {
    const sumAll = counts
      .getState()
      .map((count) => count.getState())
      .reduce((acc, x) => acc + x, 0)

    return multiplier.getState() * sumAll
  })
}
```

Components can scope watched `Sweety` instances to reduce re-rendering:

```tsx
const Challenge: React.FC = () => {
  const count = useSweety(0)
  // the component re-renders only once when the `count` is greater than 5
  const isMoreThanFive = useWatchSweety(() => count.getState() > 5)

  return (
    <div>
      <Counter count={count} />

      {isMoreThanFive && <p>You did it 🥳</p>}
    </div>
  )
}
```

> 💬 The `watcher` function is only for reading the `Sweety` instances' states. It should never call [`Sweety.of`][sweety__of], [`Sweety#clone`][sweety__clone], [`Sweety#setState`][sweety__set_state], or [`Sweety#subscribe`][sweety__subscribe] methods inside.

> 💡 It is recommended to memoize the `watcher` function with [`React.useCallback`][react__use_callback] for better performance.

> 💡 Keep in mind that the `watcher` function acts as a "reader" so you'd like to avoid heavy calculations inside it. Sometimes it might be a good idea to pass a watcher result to a separated memoization hook. The same is true for the `compare` function - you should choose wisely between avoiding extra re-renders and heavy comparisons.

### `useSweetyEffect`

```dart
function useSweetyEffect(
  effect: () => (void | VoidFunction),
  dependencies?: ReadonlyArray<unknown>,
): void
```

- `effect` a function that runs whenever any of the `dependencies`' values change.
  Can return a cleanup function to cancel running side effects.
- `[dependencies]` an optional array of values used in the `effect` function.

The hook is a `Sweety` version of the [`React.useEffect`][react__use_effect] hook. During the `effect` execution, all the `Sweety` instances that call the [`Sweety#getState`][sweety__get_state] method become _phantom dependencies_ of the hook. The `effect` runs again whenever any dependency or a state of any phantom dependency changes:

```ts
const usePrintSum = (left: number, right: Sweety<number>): void => {
  // the effect runs whenever:
  // 1. `left` changes
  // 2. `right` changes (new `Sweety` instance)
  // 3. `right.getState()` changes (`right` mutates)
  useSweetyEffect(() => {
    console.log("sum is %d", left + right.getState())
  }, [left, right])
}
```

The phantom dependencies might be different per `effect` call. If a `Sweety` instance does not call the [`Sweety#getState`][sweety__get_state] method, it does not become a phantom dependency:

```ts
const usePrintSum = (left: number, right: Sweety<number>): void => {
  // the effect runs when either:
  //
  // `left` > 0:
  //   1. `left` changes
  //   2. `right` changes (new `Sweety` instance)
  //   3. `right.getState()` changes (`right` mutates)
  //
  // OR
  //
  // `left` <= 0:
  //   1. `left` changes
  //   2. `right` changes (new `Sweety` instance)
  useSweetyEffect(() => {
    if (left > 0) {
      console.log("sum is %d", left + right.getState())
    }
  }, [left, right])
}
```

> 💡 Want to see ESLint suggestions for the dependencies? Simply add the hook name to the ESLint rule override:
>
> ```json
> {
>   "react-hooks/exhaustive-deps": [
>     "error",
>     {
>       "additionalHooks": "(useSweetyEffect|useSweetyLayoutEffect|useSweetyMemo)"
>     }
>   ]
> }
> ```

### `useSweetyLayoutEffect`

The hook is a `Sweety` version of the [`React.useLayoutEffect`][react__use_layout_effect] hook. Acts similar way as [`useSweetyEffect`][use_sweety_effect].

### ~~`useSweetyInsertionEffect`~~

There is no `Sweety` version of the [`React.useInsertionEffect`][react__use_insertion_effect] hook due to backward compatibility with React from `v16.8.0`. The workaround is to use the native `React.useInsertionEffect` hook with the states extracted beforehand:

```ts
const usePrintSum = (left: number, right: Sweety<number>): void => {
  const rightState = useGetSweetyState(right)

  React.useInsertionEffect(() => {
    console.log("sum is %d", left + rightState)
  }, [left, rightState])
}
```

### `useSweetyMemo`

```dart
function useSweetyMemo<T>(
  factory: () => T,
  dependencies: ReadonlyArray<unknown> | undefined,
): T
```

- `factory` a function calculates a value `T` whenever any of the `dependencies`' values change.
- `dependencies` an array of values used in the `factory` function.

The hook is a `Sweety` version of the [`React.useMemo`][react__use_memo] hook. During the `factory` execution, all the `Sweety` instances that call the [`Sweety#getState`][sweety__get_state] method become _phantom dependencies_ of the hook. The `factory` runs again whenever any dependency or a state of any phantom dependency changes:

```ts
const useCalcSum = (left: number, right: Sweety<number>): number => {
  // the factory runs whenever:
  // 1. `left` changes
  // 2. `right` changes (new `Sweety` instance)
  // 3. `right.getState()` changes (`right` mutates)
  return useSweetyMemo(() => {
    return left + right.getState()
  }, [left, right])
}
```

The phantom dependencies might be different per `factory` call. If a `Sweety` instance does not call the [`Sweety#getState`][sweety__get_state] method, it does not become a phantom dependency:

```ts
const useCalcSum = (left: number, right: Sweety<number>): number => {
  // the factory runs when either:
  //
  // `left` > 0:
  //   1. `left` changes
  //   2. `right` changes (new `Sweety` instance)
  //   3. `right.getState()` changes (`right` mutates)
  //
  // OR
  //
  // `left` <= 0:
  //   1. `left` changes
  //   2. `right` changes (new `Sweety` instance)
  return useSweetyEffect(() => {
    if (left > 0) {
      return left + right.getState()
    }

    return left
  }, [left, right])
}
```

> 💡 Want to see ESLint suggestions for the dependencies? Simply add the hook name to the ESLint rule override:
>
> ```json
> {
>   "react-hooks/exhaustive-deps": [
>     "error",
>     {
>       "additionalHooks": "(useSweetyEffect|useSweetyLayoutEffect|useSweetyMemo)"
>     }
>   ]
> }
> ```

### `useSweetyState`

```dart
function useSweetyState<T>(
  sweety: Sweety<T>,
  compare?: null | Compare<T>,
): [T, SetSweetyState<T>]
```

A hook similar to [`React.useState`][react__use_use_state] but for `Sweety` instances. It subscribes to the `sweety` changes and returns the current state with a function to set the state.

- `sweety` is a `Sweety` instance.
- `[compare]` is an optional [`Compare`][compare] function.
  When not defined it uses [`Sweety#compare`][sweety__compare].
  When `null` the [`Object.is`][object_is] function applies to compare the states.

```tsx
const Input: React.FC<{
  value: Sweety<string>
}> = ({ value }) => {
  const [username, setUsername] = useSweetyState(value)

  return (
    <input
      type="email"
      value={username}
      onChange={(event) => setUsername(event.target.value)}
    />
  )
}
```

> 💡 The hook is a combination of [`useGetSweetyState`][use_get_sweety_state] and [`useSetSweetyState`][use_set_sweety_state], so use them if you need to either get+subscribe or set the `Sweety` state.

> 💬 The second argument `compare` function has medium priority, so it will be used instead of [`Sweety#compare`][sweety__compare].

### `useGetSweetyState`

```dart
function useGetSweetyState<T>(sweety: Sweety<T>): T
```

A hooks that subscribes to the `sweety` changes and returns the current state.

- `sweety` is a `Sweety` instance.

```tsx
const NotificationsCount: React.FC<{
  count: Sweety<number>
}> = ({ count }) => {
  const x = useGetSweetyState(count)

  return <Badge>{x}</Badge>
}
```

### `useSetSweetyState`

```dart
function useSetSweetyState<T>(
  sweety: Sweety<T>,
  compare?: null | Compare<T>,
): SetSweetyState<T>
```

A hooks that returns a function to update the `Sweety` instance state. Might be useful when you need a way to update the state without subscribing to its changes.

- `sweety` is a `Sweety` instance.
- `[compare]` is an optional [`Compare`][compare] function.
  When not defined it uses [`Sweety#compare`][sweety__compare].
  When `null` the [`Object.is`][object_is] function applies to compare the states.

```tsx
const ClearNotifications: React.FC<{
  notifications: Sweety<Array<string>>
}> = ({ notifications }) => {
  // the component won't re-render on the notifications' state change
  const setNotifications = useSetSweetyState(notifications)

  return (
    <button onClick={() => setNotifications([])}>Clear Notifications</button>
  )
}
```

> 💬 The second argument `compare` function has medium priority, so it will be used instead of [`Sweety#compare`][sweety__compare].

### `useSweetyReducer`

```dart
function useSweetyReducer<A, T>(
  sweety: Sweety<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [T, React.Dispatch<A>]
```

A hook similar to `React.useReducer` but for `Sweety` instances. It subscribes to the `sweety` changes and returns the current state and a function to dispatch an action.

- `sweety` is a `Sweety` instance.
- `reducer` is a function that transforms the current state and the dispatched action into the new state.
- `[compare]` is an optional [`Compare`][compare] function.
  When not defined it uses [`Sweety#compare`][sweety__compare].
  When `null` the [`Object.is`][object_is] function applies to compare the states.

```tsx
type CounterAction = { type: "INCREMENT" } | { type: "DECREMENT" }

const counterReducer = (state: number, action: CounterAction) => {
  switch (action.type) {
    case "INCREMENT":
      return state + 1

    case "DECREMENT":
      return state - 1
  }
}

const Counter: React.FC<{
  state: Sweety<number>
}> = ({ state }) => {
  const [count, dispatch] = useSweetyReducer(state, counterReducer)

  return (
    <div>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+</button>
    </div>
  )
}
```

> 💬 The third argument `compare` function has medium priority, so it will be used instead of [`Sweety#compare`][sweety__compare].

### `batch`

```dart
function batch(execute: VoidFunction): void
```

The `batch` function is a helper to optimize multiple `Sweety` updates.

```tsx
const SumOfTwo: React.FC<{
  left: Sweety<number>
  right: Sweety<number>
}> = watch(({ left, right }) => (
  <div>
    <span>Sum is: {left.getState() + right.getState()}</span>

    <button
      onClick={() => {
        // enqueues 1 re-render instead of 2 🎉
        batch(() => {
          left.setState(0)
          right.setState(0)
        })
      }}
    >
      Reset
    </button>
  </div>
))
```

### `Compare`

```ts
type Compare<T> = (prev: T, next: T) => boolean
```

A function that compares two values and returns `true` if they are equal. Depending on the type of the values it might be reasonable to use a custom compare function such as shallow-equal or deep-equal.

### `SetSweetyState`

```dart
type SetSweetyState<T> = (
  stateOrTransform: React.SetStateAction<T>,
  compare?: null | Compare<T>,
) => void
```

A function that similar to the [`React.useState`][react__use_use_state] callback but with extra [`Compare`][compare] function.

- `stateOrTransform` is the new state or a function that transforms the current state into the new state.
- `[compare]` is an optional [`Compare`][compare] function applied for this call only.
  When not defined it uses the `compare` function of the source hook.
  When `null` the [`Object.is`][object_is] function applies to compare the states.

> 💡 If `stateOrTransform` argument is a function it acts as [`batch`][batch].

> 💬 The second argument `compare` function has the highest priority so it will be used instead of [`Sweety#compare`][sweety__compare] and any other `compare` passed via [`Sweety#setState`][sweety__set_state], [`useSweetyState`][use_sweety_state], [`useSetSweetyState`][use_set_sweety_state], or [`useSweetyReducer`][use_sweety_reducer].

### `ExtractSweetyState`

A helper type that shallowly extracts state type from `Sweety`:

```ts
type SimpleValue = Sweety<number>
// ExtractSweetyState<SimpleValue> === number

type ArrayValue = Sweety<Array<string>>
// ExtractSweetyState<ArrayValue> === Array<string>

type ShapeValue = Sweety<{
  name: string
  age: number
}>
// ExtractSweetyState<ShapeValue> === {
//   name: string
//   age: number
// }

type ShapeOfSweeties = Sweety<{
  name: Sweety<string>
  age: Sweety<number>
}>
// ExtractSweetyState<ShapeOfSweeties> === {
//   name: Sweety<string>
//   age: Sweety<number>
// }
```

### `DeepExtractSweetyState`

A helper that deeply extracts state type from `Sweety`:

```ts
type ShapeOfSweeties = Sweety<{
  name: Sweety<string>
  age: Sweety<number>
}>
// DeepExtractSweetyState<ShapeOfSweeties> === {
//   name: string
//   age: number
// }

type ArrayOfSweeties = Sweety<Array<Sweety<boolean>>>
// DeepExtractSweetyState<ArrayOfSweeties> === Array<boolean>
```

### `Dispatch`

Re-export of `React.Dispatch`.

## Publish

Here are scripts you want to run for publishing a new version to NPM:

1. `npm version {version}` ex: `npm version 1.0.0-beta.1`
2. `npm run build`
3. `npm publish --tag {tag}` ex: `npm publish --tag beta --tag latest`
4. `git push`
5. `git push --tags`

<!-- L I N K S -->

[sweety__of]: #sweetyof
[sweety__compare]: #sweetycompare
[sweety__clone]: #sweetyclone
[sweety__get_state]: #sweetygetstate
[sweety__set_state]: #sweetysetstate
[sweety__subscribe]: #sweetysubscribe
[use_watch_sweety]: #usewatchsweety
[use_sweety_state]: #usesweetystate
[use_sweety_reducer]: #usesweetyreducer
[use_get_sweety_state]: #usegetsweetystate
[use_set_sweety_state]: #usesetsweetystate
[use_sweety]: #usesweety
[use_sweety_effect]: #usesweetyeffect
[watch]: #watch
[batch]: #batch
[compare]: #compare
[object_is]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#description
[hoc]: https://reactjs.org/docs/higher-order-components.html
[react__use_use_state]: https://reactjs.org/docs/hooks-reference.html#usestate
[react__use_memo]: https://reactjs.org/docs/hooks-reference.html#usememo
[react__use_callback]: https://reactjs.org/docs/hooks-reference.html#usecallback
[react__use_effect]: https://reactjs.org/docs/hooks-reference.html#useeffect
[react__use_layout_effect]: https://reactjs.org/docs/hooks-reference.html#uselayouteffect
[react__use_insertion_effect]: https://reactjs.org/docs/hooks-reference.html#useinsertioneffect
