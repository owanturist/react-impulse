# `react-sweety`

The clean and natural React state management.

[![codecov](https://codecov.io/gh/owanturist/react-sweety/branch/master/graph/badge.svg?token=QP3SXO8E9F)](https://codecov.io/gh/owanturist/react-sweety)
![known vulnerabilities](https://snyk.io/test/github/owanturist/react-sweety/badge.svg)
![minified + gzip](https://badgen.net/bundlephobia/minzip/react-sweety)
![dependency count](https://badgen.net/bundlephobia/dependency-count/react-sweety)
![types](https://badgen.net/npm/types/react-sweety)

```bash
# with yarn
yarn add react-sweety

# with npm
npm install react-sweety
```

## Quick start

`Sweety` is a box holding any value you want, even another `Sweety`! All [`watch`][watch]ed components that execute the [`Sweety#getState`][sweety__get_state] during the rendering phase enqueue re-render whenever a `Sweety` instance's state updates.

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

A core piece of the library is the `Sweety` class - a box that holds value. The value might be anything you like as long as it changes immutably. The class instances are mutable by design, but other `Sweety` instances can use them as values.

### `Sweety.of`

```dart
Sweety.of<T>(
  initialValue: T,
  compare?: null | Compare<T>
): Sweety<T>
```

A static method that creates a new `Sweety` instance.

- `initialValue` is the initial value.
- `[compare]` is an optional [`Compare`][compare] function applied as [`Sweety#compare`][sweety__compare]. When not defined or null [`Object.is`][object_is] applies as a fallback.

> 💡 The [`useSweety`][use_sweety] hook helps to create and store a `Sweety` instance inside a React component.

### `Sweety#getState`

```dart
Sweety<T>#getState(): T
Sweety<T>#getState<R>(select: (value: T) => R): R
```

A `Sweety` instance's method that returns the current value.

- `[select]` is an optional function that applies to the current value before returning.

```ts
const count = Sweety.of(3)

count.getState() // === 3
count.getState((x) => x > 0) // === true
```

### `Sweety#setState`

```dart
Sweety<T>#setState(
  valueOrTransform: React.SetStateAction<T>,
  compare?: null | Compare<T>
): void
```

A `Sweety` instance's method to update the value. All listeners registered via the [`Sweety#subscribe`][sweety__subscribe] method execute whenever the instance's state updates.

- `valueOrTransform` is the new value or a function that transforms the current value into the new value.
- `[compare]` is an optional [`Compare`][compare] function applied for this call only.
  When not defined the [`Sweety#compare`][sweety__compare] function of the instance will be used.
  When `null` the [`Object.is`][object_is] function applies to compare the values.

```ts
const isActive = Sweety.of(false)

isActive.setState((x) => !x)
isActive.getState() // true

isActive.setState(false)
isActive.getState() // false
```

> 💡 If `valueOrTransform` argument is a function it acts as [`batch`][batch].

> 💬 The method returns `void` to emphasize that `Sweety` instances are mutable.

> 💬 The second argument `compare` function has medium priority, so it will be used instead of [`Sweety#compare`][sweety__compare].

### `Sweety#clone`

```dart
Sweety<T>#clone(
  transform?: (value: T) => T,
  compare?: null | Compare<T>
): Sweety<T>
```

A `Sweety` instance's method for creating a new `Sweety` instance with the same value.

- `[transform]` is an optional function that applies to the current value before cloning. It might be handy when cloning a state that contains mutable values.
- `[compare]` is an optional [`Compare`][compare] function replaces [`Sweety#compare`][sweety__compare] of the cloned instance.
  When not defined, it uses the [`Sweety#compare`][sweety__compare] function from the origin.
  When `null` the [`Object.is`][object_is] function applies to compare the values.

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

The [`compare`][compare] function compares the state of a `Sweety` instance with the new value given via [`Sweety#setState`][sweety__set_state]. Whenever the function returns `true`, neither the state change nor it notifies the listeners subscribed via [`Sweety#subscribe`][sweety__subscribe].

> 💬 The `Sweety#compare` function has the lowest priority when [`Sweety#setState`][sweety__set_state], [`useSweetyState`][use_sweety_state], [`useSetSweetyState`][use_set_sweety_state] or [`useSweetyReducer`][use_sweety_reducer] execute.

### `Sweety#key`

```dart
Sweety<T>#key: string
```

Each `Sweety` instance has a unique key. It might get handy as the React `key` property.

```tsx
const CheckList: React.FC<{
  checks: Array<Sweety<boolean>>
}> = ({ checks }) => (
  <>
    {checks.map((checked) => (
      <Checkbox key={checked.key} checked={checked} />
    ))}
  </>
)
```

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

### `useWatchSweety`

```ts
function useWatchSweety<T>(watcher: () => T, compare?: null | Compare<T>): T
```

A hook that subscribes to all [`Sweety#getState`][sweety__get_state] execution involved in the `watcher` call. Due to the mutable nature of `Sweety` instances a parent component won't be re-rendered when a child's `Sweety` value is changed. The hook gives a way to watch after deep changes in the store's values and trigger a re-render when the returning value is changed.

- `watcher` is a function to read only the watching value meaning that it should never call [`Sweety.of`][sweety__of], [`Sweety#clone`][sweety__clone], [`Sweety#setState`][sweety__set_state] or [`Sweety#subscribe`][sweety__subscribe] methods inside.
- `[compare]` is an optional [`Compare`][compare] function with strict check (`===`) by default or when `null`. The hook won't trigger a re-render when the watching value is comparably equal to the current value.

```tsx
type State = {
  count: Sweety<number>
}

const App: React.FC<{
  state: State
}> = ({ state }) => {
  // the component will re-render once the `count` is greater than 5
  // and once the `count` is less or equal to 5
  const isMoreThanFive = useWatchSweety(() => state.count.getState() > 5)

  return (
    <div>
      <Counter store={state.count} />

      {isMoreThanFive && <p>You did it!</p>}
    </div>
  )
}
```

> 💡 It is recommended to memoize the `watcher` function for better performance.

> 💡 Keep in mind that the `watcher` function acts as a "reader" so you'd like to avoid heavy calculations inside it. Sometimes it might be a good idea to pass a watcher result to a separated memoization hook. The same is true for the `compare` function - you should choose wisely between avoiding extra re-renders and heavy comparisons.

### `useSweetyState`

```ts
function useSweetyState<T>(
  store: Sweety<T>,
  compare?: null | Compare<T>,
): [T, SetSweetyState<T>]
```

A hook that is similar to `React.useState` but for `Sweety` instances. It subscribes to the store changes and returns the current value and a function to set the value.

- `store` is a `Sweety` instance.
- `[compare]` is an optional [`Compare`][compare] function. The store won't update if the new value is comparably equal to the current value. If not defined it uses `Sweety#compare`. The strict equality check function (`===`) will be used if `null`.

```tsx
const UsernameInput: React.FC<{
  store: Sweety<string>
}> = ({ store }) => {
  const [username, setUsername] = useSweetyState(store)

  return (
    <input
      type="text"
      value={username}
      onChange={(event) => setUsername(event.target.value)}
    />
  )
}
```

> 💡 The hook is a combination of [`useGetSweetyState`][use_get_sweety_state] and [`useSetSweetyState`][use_set_sweety_state], so use them if you need to either get+subscribe or set the store's value.

> 💬 The second argument `compare` function has medium priority, so it will be used instead of [`Sweety#compare`][sweety__compare].

### `useGetSweetyState`

```ts
function useGetSweetyState<T>(store: Sweety<T>): T
```

A hooks that subscribes to the store's changes and returns the current value.

- `store` is a `Sweety` instance.

```tsx
const App: React.FC<{
  left: Sweety<number>
  right: Sweety<number>
}> = ({ left, right }) => {
  const countLeft = useGetSweetyState(left)
  const countRight = useGetSweetyState(right)

  return (
    <div>
      <Counter store={left} />
      <Counter store={right} />

      <p>Sum: {countLeft + countRight}</p>
    </div>
  )
}
```

### `useSetSweetyState`

```ts
function useSetSweetyState<T>(
  store: Sweety<T>,
  compare?: null | Compare<T>,
): SetSweetyState<T>
```

A hooks that returns a function to update the store's value. Might be useful when you need a way to update the store's value without subscribing to its changes.

- `store` is a `Sweety` instance.
- `[compare]` is an optional [`Compare`][compare] function. The store won't update if the new value is comparably equal to the current value. If not defined it uses `Sweety#compare`. The strict equality check function (`===`) will be used if `null`.

```tsx
type State = {
  count: Sweety<number>
}

const App: React.FC<{
  state: State
}> = ({ state }) => {
  // the component won't re-render on the count value change
  const setCount = useSetSweetyState(state.count)

  return (
    <div>
      <Counter store={state.count} />

      <button onClick={() => setCount(0)}>Reset count</button>
    </div>
  )
}
```

> 💬 The second argument `compare` function has medium priority, so it will be used instead of [`Sweety#compare`][sweety__compare].

### `useSweetyReducer`

```ts
function useSweetyReducer<A, T>(
  store: Sweety<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [T, React.Dispatch<A>]
```

A hook that is similar to `React.useReducer` but for `Sweety` instances. It subscribes to the store changes and returns the current value and a function to dispatch an action.

- `store` is a `Sweety` instance.
- `reducer` is a function that transforms the current value and the dispatched action into the new value.
- `[compare]` is an optional [`Compare`][compare] function. The store won't update if the new value is comparably equal to the current value. If not defined it uses `Sweety#compare`. The strict equality check function (`===`) will be used if `null`.

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
  store: Sweety<number>
}> = ({ store }) => {
  const [count, dispatch] = useSweetyReducer(store, counterReducer)

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

### `useSweety`

```ts
function useSweety<T>(initialValue: T): Sweety<T>

function useSweety<T>(lazyInitialValue: () => T): Sweety<T>
```

A hook that initiates a stable (never changing) Sweety store.

The first argument is either an [`initialValue`] value to initialize the store or a [`lazyInitialValue`] function returning an initial value that calls only once when the hook is called. It might be handy when the initial value is expensive to compute.

```tsx
const UsernameInput: React.FC = () => {
  const store = useSweety("")
  const [username, setUsername] = useSweetyState(store)

  return (
    <input
      type="text"
      value={username}
      onChange={(event) => setUsername(event.target.value)}
    />
  )
}
```

> 💬 The initial value is disregarded during subsequent re-renders.

### `batch`

```ts
function batch(execute: VoidFunction): void
```

The `batch` function is a helper to optimize multiple stores' updates.

```tsx
const LoginForm: React.FC<{
  email: Sweety<string>
  password: Sweety<string>
}> = ({ email: emailStore, password: passwordStore }) => {
  const [email, setEmail] = useSweetyState(emailStore)
  const [password, setPassword] = useSweetyState(passwordStore)

  return (
    <form>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button
        type="button"
        onClick={() => {
          api.login(email, password)

          // TODO await
          batch(() => {
            setEmail("")
            setPassword("")
          })
        }}
      >
        Submit
      </button>
    </form>
  )
}
```

### `Compare`

```ts
type Compare<T> = (prev: T, next: T) => boolean
```

A function that compares two values and returns `true` if they are equal. Depending on the type of the values it might be reasonable to use a custom compare function such as shallow-equal or deep-equal.

### `SetSweetyState`

```ts
type SetSweetyState<T> = (
  valueOrTransform: React.SetStateAction<T>,
  compare?: null | Compare<T>,
) => void
```

A function that similar to the `React.useState` callback but with extra [`compare`][compare] function.

- `valueOrTransform` is the new value or a function that transforms the current value into the new value.
- `[compare]` is an optional [`Compare`][compare] function to use for this call only.
  If not defined the `compare` function of the source hook will be used.
  If `null` is passed the strict equality check function (`===`) will be used.

> 💡 If `valueOrTransform` argument is a function it acts as [`batch`][batch].

> 💬 The second argument `compare` function has the highest priority so it will be used instead of [`Sweety#compare`][sweety__compare] and any other `compare` passed via [`Sweety#setState`][sweety__set_state], [`useSweetyState`][use_sweety_state], [`useSetSweetyState`][use_set_sweety_state] or [`useSweetyReducer`][use_sweety_reducer].

### `ExtractSweetyState`

A helper type that shallowly extracts value type from `Sweety`:

```ts
type SimpleStore = Sweety<number>
// ExtractSweetyState<SimpleStore> === number

type ArrayStore = Sweety<Array<string>>
// ExtractSweetyState<ArrayStore> === Array<string>

type ShapeStore = Sweety<{
  name: string
  age: number
}>
// ExtractSweetyState<ShapeStore> === {
//   name: string
//   age: number
// }

type ShapeOfStores = Sweety<{
  name: Sweety<string>
  age: Sweety<number>
}>
// ExtractSweetyState<ShapeStore> === {
//   name: Sweety<string>
//   age: Sweety<number>
// }
```

### `DeepExtractSweetyState`

A helper that deeply extracts value type from `Sweety`:

```ts
type ShapeOfStores = Sweety<{
  name: Sweety<string>
  age: Sweety<number>
}>
// DeepExtractSweetyState<ShapeStore> === {
//   name: string
//   age: number
// }

type ArrayOfStores = Sweety<Array<Sweety<boolean>>>
// DeepExtractSweetyState<ArrayOfStores> === Array<boolean>
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
[watch]: #watch
[batch]: #batch
[compare]: #compare
[object_is]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#description
[hoc]: https://reactjs.org/docs/higher-order-components.html
