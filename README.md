# react-inner-store

A lightweight and performant React state management.

## Get started

First, install the package:

```bash
# with yarn
yarn add react-inner-store

# with npm
npm install react-inner-store
```

And use it in your project:

```tsx
import React from 'react'
import { InnerStore, useInnerState } from 'react-inner-store'

type State = {
  username: InnerStore<string>
  count: InnerStore<number>
}

const Username: React.VFC<{
  store: InnerStore<string>
}> = React.memo(({ store }) => {
  const [username, setUsername] = useInnerState(store)

  return (
    <input
      type="text"
      value={username}
      onChange={event => setUsername(event.target.value)}
    />
  )
})

const Counter: React.VFC<{
  store: InnerStore<number>
}> = React.memo(({ store }) => {
  const [count, setCount] = useInnerState(store)

  return (
    <div>
      <button onClick={() => setCount(count - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
})

const App: React.VFC<{
  state: State
}> = React.memo(({ state }) => (
  <div>
    <h1>
      The app component will never re-render due to neither state.count nor
      state.username change
    </h1>

    <Username store={state.username} />
    <Counter store={state.count} />

    <button
      onClick={() => {
        const username = state.username.getState()
        const count = state.count.getState()

        console.log(`User "${username}" get ${count} score.`)
      }}
    >
      Submit
    </button>
  </div>
))

ReactDOM.render(
  <App
    state={{
      username: InnerStore.of(''),
      count: InnerStore.of(0)
    }}
  />,
  document.getElementById('root')
)
```

## API

A core concept of the library is the `InnerStore` class. It is a mutable wrapper around a value that allows to prevent unnecessary re-renders. The class provides an API to get and set the value, and to observe changes. There are hooks built on top of the API for convenient usage in React components.

### `InnerStore.of`

```ts
InnerStore.of<T>(value: T): InnerStore<T>
```

A static method that creates a new `InnerStore` instance. The instance is mutable so once created it should be used for all future operations.

```ts
type SignInFormState = {
  isSubmitting: boolean
  username: InnerStore<string>
  password: InnerStore<string>
  rememberMe: InnerStore<boolean>
}

const signInFormStore = InnerStore.of<SignInFormState>({
  isSubmitting: false,
  username: InnerStore.of(''),
  password: InnerStore.of(''),
  rememberMe: InnerStore.of(false)
})
```

### `InnerStore#key`

```ts
InnerStore<T>#key: string
```

Each `InnerStore` instance has a unique key. This key is used internally for [`useInnerWatch`][use_inner_watch] but can be used as the React key property.

```tsx
const Toggles: React.VFC<{
  options: Array<InnerStore<boolean>>
}> = ({ options }) => (
  <>
    {options.map(option => (
      <Toggle key={option.key} store={option} />
    ))}
  </>
)
```

### `InnerStore#clone`

```ts
InnerStore<T>#clone(transform?: (value: T) => T): InnerStore<T>
```

An `InnerStore` instance's method that creates a new `InnerStore` instance with the same value.

- `[transform]` is an optional function that will be applied to the current value before cloning. It might be handy when cloning a `InnerStore` instance that contains mutable values (e.g. `InnerStore`).

```ts
const signInFormStoreClone = signInFormStore.clone(
  ({ isSubmitting, username, password, rememberMe }) => ({
    isSubmitting,
    username: username.clone(),
    password: password.clone(),
    rememberMe: rememberMe.clone()
  })
)
```

### `InnerStore#getState`

```ts
InnerStore<T>#getState(): T
InnerStore<T>#getState<R>(transform: (value: T) => R): R
```

An `InnerStore` instance's method that returns the current value.

- `[transform]` is an optional function that will be applied to the current value before returning.

```ts
const plainSignInState = signInFormStore.getState(
  ({ isSubmitting, username, password, rememberMe }) => ({
    isSubmitting,
    username: username.getState(),
    password: password.getState(),
    rememberMe: rememberMe.getState()
  })
)
```

### `InnerStore#setState`

```ts
InnerStore<T>#setState(
  valueOrTransform: React.SetStateAction<T>,
  compare?: Compare<T>
): void
```

An `InnerStore` instance's method that sets the value. Each time when the value is changed all of the store's listeners passed via [`InnerStore#subscribe`][inner_store__subscribe] are called.

- `valueOrTransform` is either the new value or a function that will be applied to the current value before setting.
- `[compare]` is an optional [`Compare`][compare] function with strict check (`===`) by default. If the new value is comparably equal to the current value neither the value is set nor the listeners are called.

```ts
const onSubmit = () => {
  signInFormStore.update(state => {
    // reset password field
    state.password.setState('')

    return {
      ...state,
      isSubmitting: true
    }
  })
}
```

> 💬 The method returns `void` to emphasize that `InnerStore` instances are mutable.

### `InnerStore#subscribe`

```ts
InnerStore<T>#subscribe(listener: VoidFunction): VoidFunction
```

An `InnerStore` instance's method that subscribes to the store's value changes caused by [`InnerStore#setState`][inner_store__set_state] calls. Returns a cleanup function that can be used to unsubscribe the listener.

- `listener` is a function that will be called on store updates.

```tsx
const UsernameInput: React.VFC<{
  store: InnerStore<string>
}> = React.memo(({ store }) => {
  const [username, setUsername] = React.useState(store.getState())

  React.useEffect(() => {
    // the listener is called on every store.setState() call across the app
    return store.subscribe(() => setUsername(store.getState()))
  }, [store])

  return (
    <input
      type="text"
      value={username}
      // all store.subscribe across the app will call their listeners
      onChange={event => store.setState(event.target.value)}
    />
  )
})
```

### `useInnerWatch`

```ts
function useInnerWatch<T>(watcher: () => T, compare?: Compare<T>): T
```

A hook that subscribes to all [`InnerStore#getState`][inner_store__get_state] execution involved in the `watcher` call. Due to the mutable nature of `InnerStore` instances a parent component won't be re-rendered when a child's `InnerStore` value is changed. The hook gives a way to watch after deep changes in the store's values and trigger a re-render when the returning value is changed.

- `watcher` is a function to read only the watching value meaning that it never should call [`InnerStore.of`][inner_store__of], [`InnerStore#clone`][inner_store__clone], [`InnerStore#setState`][inner_store__set_state] or [`InnerStore#subscribe`][inner_store__subscribe] methods inside.
- `[compare]` is an optional [`Compare`][compare] function with strict check (`===`) by default. The hook won't trigger a re-render when the watching value is comparably equal to the current value.

```tsx
type State = {
  count: InnerStore<number>
}

const App: React.VFC<{
  state: State
}> = React.memo(({ state }) => {
  // the component will re-render once the `count` is greater than 5
  // and once the `count` is less or equal to 5
  const isMoreThanFive = useInnerWatch(() => state.count.getState() > 5)

  return (
    <div>
      <Counter store={state.count} />

      {isMoreThanFive && <p>You did it!</p>}
    </div>
  )
})
```

> 💡 It is recommended to memoize the `watcher` function for better performance.

### `useInnerState`

```ts
function useInnerState<T>(
  store: InnerStore<T>,
  compare?: Compare<T>
): [T, React.Dispatch<React.SetStateAction<T>>]

function useInnerState<T>(
  store: null | undefined | InnerStore<T>,
  compare?: Compare<T>
): [null | undefined | T, React.Dispatch<React.SetStateAction<T>>]
```

A hook that is similar to `React.useState` but for `InnerStore` instances. It subscribes to the store changes and returns the current value and a function to set the value.

- `store` is an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
- `[compare]` is an optional [`Compare`][compare] function with strict check (`===`) by default. The store won't update if the new value is comparably equal to the current value.

```tsx
const UsernameInput: React.VFC<{
  store: InnerStore<string>
}> = React.memo(({ store }) => {
  const [username, setUsername] = useInnerState(store)

  return (
    <input
      type="text"
      value={username}
      onChange={event => setUsername(event.target.value)}
    />
  )
})
```

> 💡 The hook is a combination of [`useGetInnerState`][use_get_inner_state] and [`useSetInnerState`][use_set_inner_state], so use them if you need to either get/subscribe or set the store's value.

### `useGetInnerState`

```ts
function useGetInnerState<T>(store: InnerStore<T>): T

function useGetInnerState<T>(
  store: null | undefined | InnerStore<T>
): null | undefined | T
```

A hooks that subscribes to the store's changes and returns the current value.

- `store` is an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.

```tsx
const App: React.VFC<{
  left: InnerStore<number>
  right: InnerStore<number>
}> = React.memo(({ left }) => {
  const countLeft = useGetInnerState(left)
  const countRight = useGetInnerState(right)

  return (
    <div>
      <Counter store={left} />
      <Counter store={right} />

      <p>Sum: {countLeft + countRight}</p>
    </div>
  )
})
```

### `useSetInnerState`

```ts
function useSetInnerState<T>(
  store: null | undefined | InnerStore<T>,
  compare?: Compare<T>
): React.Dispatch<React.SetStateAction<T>>
```

A hooks that returns a function to update the store's value. Might be useful when you need a way to update the store's value without subscribing to its changes.

- `store` is an `InnerStore` instance but can be `null` or `undefined` as a bypass when a store might be not defined.
- `[compare]` is an optional [`Compare`][compare] function with strict check (`===`) by default. The store won't update if the new value is comparably equal to the current value.

```tsx
type State = {
  count: InnerStore<number>
}

const App: React.VFC<{
  state: State
}> = React.memo(({ state }) => {
  // the component won't re-render on the count value change
  const setCount = useSetInnerState(state.count)

  return (
    <div>
      <Counter store={state.count} />

      <button onClick={() => setCount(0)}>Reset count</button>
    </div>
  )
})
```

### `useInnerReducer`

```ts
function useInnerReducer<A, T>(
  store: InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare?: Compare<T>
): [T, React.Dispatch<A>]

function useInnerReducer<A, T>(
  store: null | undefined | InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare?: Compare<T>
): [null | undefined | T, React.Dispatch<A>]
```

A hook that is similar to `React.useReducer` but for `InnerStore` instances. It subscribes to the store changes and returns the current value and a function to dispatch an action.

- `store` is an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
- `reducer` is a function that transforms the current value and the dispatched action into the new value.
- `[compare]` is an optional [`Compare`][compare] function with strict check (`===`) by default. The store won't update if the new value is comparably equal to the current value.

```tsx
type CounterAction = { type: 'INCREMENT' } | { type: 'DECREMENT' }

const counterReducer = (state: number, action: CounterAction) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1

    case 'DECREMENT':
      return state - 1
  }
}

const Counter: React.VFC<{
  store: InnerStore<number>
}> = React.memo(({ store }) => {
  const [count, dispatch] = useInnerReducer(store, counterReducer)

  return (
    <div>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
    </div>
  )
})
```

### `Compare`

```ts
type Compare<T> = (prev: T, next: T) => boolean
```

A function that compares two values and returns `true` if they are equal. Depending on the type of the values it might be more efficient to use a custom compare function such as shallow-equal or deep-equal.

### `ExtractInnerState`

A helper type that shallowly extracts value type from `InnerStore`:

```ts
type SimpleStore = InnerStore<number>
// ExtractInnerState<SimpleStore> === number

type ArrayStore = InnerStore<Array<string>>
// ExtractInnerState<ArrayStore> === Array<string>

type ShapeStore = InnerStore<{
  name: string
  age: number
}>
// ExtractInnerState<ShapeStore> === {
//   name: string
//   age: number
// }

type ShapeOfStores = InnerStore<{
  name: InnerStore<string>
  age: InnerStore<number>
}>
// ExtractInnerState<ShapeStore> === {
//   name: InnerStore<string>
//   age: InnerStore<number>
// }
```

### `DeepExtractInnerState`

A helper that deeply extracts value type from `InnerStore`:

```ts
type ShapeOfStores = InnerStore<{
  name: InnerStore<string>
  age: InnerStore<number>
}>
// DeepExtractInnerState<ShapeStore> === {
//   name: string
//   age: number
// }

type ArrayOfStores = InnerStore<Array<InnerStore<boolean>>>
// DeepExtractInnerState<ArrayOfStores> === Array<boolean>
```

<!-- L I N K S -->

[inner_store__of]: #innerstoreof
[inner_store__clone]: #innerstoreclone
[inner_store__get_state]: #innerstoregetstate
[inner_store__set_state]: #innerstoresetstate
[inner_store__subscribe]: #innerstoresubscribe
[use_inner_watch]: #useinnerwatch
[use_get_inner_state]: #usegetinnerstate
[use_set_inner_state]: #usesetinnerstate
[compare]: #compare
