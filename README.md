# react-inner-store

A lightweight and performant React state management.

## Get started

```bash
# with yarn
yarn add react-inner-store

# with npm
npm install react-inner-store
```

```tsx
import React from 'react'
import { InnerStore, useInnerState, useInnerWatch } from 'react-inner-store'

type State = {
  count: InnerStore<number>
  name: InnerStore<string>
}

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

const Password: React.VFC<{
  store: InnerStore<string>
}> = React.memo(({ store }) => {
  const [password, setPassword] = useInnerState(store)

  return (
    <input
      type="password"
      value={password}
      onChange={e => setPassword(e.target.value)}
    />
  )
})

const App: React.VFC<{
  state: State
}> = React.memo(({ state }) => (
  <div>
    <Counter store={state.count} />
    <Password store={state.name} />
  </div>
))

ReactDOM.render(
  <App
    store={{
      count: InnerStore.of(0),
      password: InnerStore.of('')
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

Each `InnerStore` instance has a unique key. This key is used internally for [`useInnerWatch`][use_inner_watch] but can be used as the React key for the component.

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

An `InnerStore` instance's method that creates a new `InnerStore` instance with the same value. Takes optional `transform` function that is applied to the value before cloning - might be useful when cloning a `InnerStore` instance that contains a mutable values (e.g. `InnerStore`).

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

An `InnerStore` instance's method that returns the current value. Takes optional `transform` function that is applied to the value before returning.

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
  transformOrValue: React.SetStateAction<T>,
  compare?: Compare<T>
): void
```

An `InnerStore` instance's method that sets the value. Each time when the value is changed all listeners defined with [`InnerStore#subscribe`][inner_store__subscribe] are called. Takes either a value or a `transform` function that is applied to the value before setting. Takes optional `compare` function that is used to compare the new value with the current value. If the new value is equal to the current value neither the value is set nor listeners are called.

> 💬 The method returns `void` to emphasize that `InnerStore` instances are mutable.

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

### `InnerStore#subscribe`

```ts
InnerStore<T>#subscribe(listener: VoidFunction): VoidFunction
```

An `InnerStore` instance's method that adds a listener that is called each time when the value is changed via [`InnerStore#setState`][inner_store__set_state].

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
      onChange={e => store.setState(e.target.value)}
    />
  )
})
```

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

The hook that is similar to `React.useState` but for `InnerStore` instances. It subscribes to the store and returns the current value and a function to set the value. The first argument might be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes. The second argument is an optional `compare` function that is used to compare the new value with the current value. The store won't update if the new value is equal to the current value.

```tsx
const UsernameInput: React.VFC<{
  store: InnerStore<string>
}> = React.memo(({ store }) => {
  const [username, setUsername] = useInnerState(store)

  return (
    <input
      type="text"
      value={username}
      onChange={e => setUsername(e.target.value)}
    />
  )
})
```

### `useInnerWatch`

```ts
function useInnerWatch<T>(watcher: () => T, compare?: Compare<T>): T
```

The hook that subscribes to all `InnerStore#getState` execution involved in the `watcher` call. Due to the mutable nature of `InnerStore` instances a parent component won't be re-rendered when a child's `InnerStore` value is changed. The hook gives a way to watch after deep changes in the store's values and trigger a re-render when the value is changed. The second optional argument is a `compare` function that is used to compare the new value with the current value. The store won't update if the new value is equal to the current value.

```tsx
type State = {
  count: InnerStore<number>
}

const App: React.VFC<{
  state: State
}> = React.memo(({ state }) => {
  // the component will re-render only when the count value is greater than 5
  const isMoreThanFive = useInnerWatch(() => state.count.getState() > 5)

  return (
    <div>
      <Counter store={state.count} />

      {isMoreThanFive && <p>You did it!</p>}
    </div>
  )
})
```

> 💡 It is recommended to memoize the `watcher` and `compare` functions for better performance.

### `useInnerDispatch`

```ts
function useInnerDispatch<T, A>(
  store: InnerStore<T>,
  update: (action: A, state: T) => T,
  compare?: Compare<T>
): [T, React.Dispatch<A>]
function useInnerDispatch<T, A>(
  store: null | undefined | InnerStore<T>,
  update: (action: A, state: T) => T,
  compare?: Compare<T>
): [null | undefined | T, React.Dispatch<A>]
```

The hook that is similar to `React.useDispatch` but for `InnerStore` instances. It subscribes to the store and returns the current value and a function to dispatch an action. The first argument might be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes. The second argument is an optional `compare` function that is used to compare the new value with the current value. It won't trigger a re-render if the new value is equal to the current value.

```tsx
type CounterAction = { type: 'INCREMENT' } | { type: 'DECREMENT' }

const counterReducer = (action: CounterAction, state: number) => {
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
  const [count, dispatch] = useInnerDispatch(store, counterReducer)

  return (
    <div>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
    </div>
  )
})
```

### `useInnerUpdate`

```ts
function useInnerUpdate<T>(
  store: null | undefined | InnerStore<T>,
  compare?: Compare<T>
): React.Dispatch<React.SetStateAction<T>>
```

The hooks that returns a function to update the store's value. Might be useful when you need a way to update the store's value without subscribing to its changes. The second argument is an optional `compare` function that is used to compare the new value with the current value. The store won't update if the new value is equal to the current value.

```tsx
type State = {
  count: InnerStore<number>
}

const App: React.VFC<{
  state: State
}> = React.memo(({ state }) => {
  // the component won't re-render on the count value change
  const setCount = useInnerUpdate(state.count)

  return (
    <div>
      <Counter store={state.count} />

      <button onClick={() => setCount(0)>Reset count</button>
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

[inner_store__subscribe]: #innerstoresubscribe
[inner_store__set_state]: #innerstoresetstate
[use_inner_watch]: #useinnerwatch
[use_inner_state]: #useinnerstate
