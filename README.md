THE LIBRARY HAS CHANGED NPM NAME FROM `react-inner-store` TO [`react-sweety`](https://www.npmjs.com/package/react-sweety).

# react-inner-store

The clean and natural React state management

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
import React from "react"
import { InnerStore, useInnerState } from "react-inner-store"

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
      onChange={(event) => setUsername(event.target.value)}
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
    <Username store={state.username} />
    <Counter store={state.count} />

    <button
      onClick={() => {
        const username = state.username.getState()
        const count = state.count.getState()

        console.log(`User "${username}" gets ${count} score.`)
      }}
    >
      Submit
    </button>
  </div>
))

ReactDOM.render(
  <App
    state={{
      username: InnerStore.of(""),
      count: InnerStore.of(0),
    }}
  />,
  document.getElementById("root"),
)
```

## Motivation

Another one React state management library... Why do you need it? That's a fair question and it needs a decent explanation. Let me walk you through it.

<a name="simple-counter"></a>Imagine you are building a stateful Counter component:

```tsx
import React from "react"

const Counter: React.VFC = () => {
  const [count, setCount] = React.useState(0)

  return (
    <div>
      <button onClick={() => setCount(count - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

That's fairly simple but not quite useful since there is no way to read the Counter's value. You want to keep the state inside the component, so the only way to get the value is to pass the `onChange` callback to the `Counter` component:

```tsx
import React from "react"

const Counter: React.VFC<{
  onChange?(count: number): void
}> = React.memo(({ onChange }) => {
  const [count, setCount] = React.useState(0)
  const handleCount = (nextCount) => {
    setCount(nextCount)
    onChange?.(nextCount)
  }

  return (
    <div>
      <button onClick={() => handleCount(count - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => handleCount(count + 1)}>+</button>
    </div>
  )
})
```

Now you can get the value from the Counter's parent component, but you need a place to store it:

```tsx
import React from "react"

const GameScore = () => {
  const [count, setCount] = React.useState(0)

  return (
    <div>
      <Counter onChange={setCount} />
      <span>Score: {count}</span>
    </div>
  )
}
```

Two `React.useState` for storing a single value... seems a bit of overkill, huh? Let's move on and say that it should be a way not only to read but to set the Counter's value from the outside:

```tsx
import React from "react"

const Counter: React.VFC<{
  count?: number
  onChange?(count: string): void
}> = ({ count: forcedCount = 0, onChange }) => {
  const [count, setCount] = React.useState(forcedCount)
  const handleCount = (nextCount) => {
    setCount(nextCount)
    onChange?.(nextCount)
  }

  React.useEffect(() => {
    setCount(forcedCount)
  }, [forcedCount])

  return (
    <div>
      <button onClick={() => handleCount(count - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => handleCount(count + 1)}>+</button>
    </div>
  )
}

const GameScore = () => {
  const [count, setCount] = React.useState(0)

  return (
    <div>
      <Counter count={count} onChange={setCount} />
      <button onClick={() => setCount(0)}>Reset</button>
      <span>Score: {count}</span>
    </div>
  )
}
```

That is a complete implementation of two-way Counter's state management. The number of hooks to support the two-way binding grows dramatically with a more complex state.

A brute-force workaround to reduce the two-way binding hustle is to store the Input's state outside the component. This way, any component which passes the state and the setState callback might read and change the state's value:

```tsx
import React from "react"

const Counter: React.VFC<{
  count: number
  setCount: React.Dispatch<React.SetStateAction<number>>
}> = ({ count, setCount }) => (
  <div>
    <button onClick={() => setCount(count - 1)}>-</button>
    <span>{count}</span>
    <button onClick={() => setCount(count + 1)}>+</button>
  </div>
)

// The game score shows two Counters now
const GameScore = () => {
  const [firstCount, setFirstCount] = React.useState(0)
  const [secondCount, setSecondCount] = React.useState(0)

  return (
    <div>
      <Counter count={firstCount} setCount={setFirstCount} />
      <Counter count={secondCount} setCount={setSecondCount} />
      <button
        onClick={() => {
          setFirstCount(0)
          setSecondCount(0)
        }}
      >
        Reset
      </button>
      <span>
        Score: {firstCount} vs {secondCount}
      </span>
    </div>
  )
}
```

So far, so good, is not it? The problem is that the approach does not scale well. What if it needs to read and write the GameStore's state from the outside:

```tsx
const GameScore: React.VFC<{
  firstCount: number
  secondCount: number
  setFirstCount: React.Dispatch<React.SetStateAction<number>>
  setSecondCount: React.Dispatch<React.SetStateAction<number>>
}> = ({ firstCount, setFirstCount, secondCount, setSecondCount }) => (
  <div>
    <Counter count={firstCount} setCount={setFirstCount} />
    <Counter count={secondCount} setCount={setSecondCount} />
    <button
      onClick={() => {
        setFirstCount(0)
        setSecondCount(0)
      }}
    >
      Reset
    </button>
    <span>
      Score: {firstCount} vs {secondCount}
    </span>
  </div>
)
```

That's props drilling - it grows exponentially and requires too much effort to maintain. We have to figure out how to stop the props amount from growing. We can switch from `React.useState` to `React.useReducer` and have a single state prop and a single dispatch prop. Assuming so, here is how the Counter looks like now:

```tsx
type CounterId = string

interface CounterState {
  id: CounterId
  count: number
}

const initCounter = (): CounterState => ({
  id: uuid(),
  count: 0,
})

type CounterAction =
  | { type: "INCREMENT"; id: CounterId }
  | { type: "DECREMENT"; id: CounterId }

const counterReducer = (state: CounterState, action: CounterAction) => {
  switch (action.type) {
    case "INCREMENT":
      return state.id === action.id
        ? { ...state, count: state.count + 1 }
        : state

    case "DECREMENT":
      return state.id === action.id
        ? { ...state, count: state.count - 1 }
        : state

    default:
      return state
  }
}

const Counter: React.VFC<{
  state: CounterState
  dispatch: React.Dispatch<CounterAction>
}> = ({ state, dispatch }) => (
  <div>
    <button onClick={() => dispatch({ type: "DECREMENT", id: state.id })}>
      -
    </button>
    <span>{state.count}</span>
    <button onClick={() => dispatch({ type: "INCREMENT", id: state.id })}>
      +
    </button>
  </div>
)
```

We exchanged props drilling to boilerplate code. But why does it need the extra `id` field in both state and actions? The answer is that we want to have reusable components, and the Counter component will be used many times across the application. It might be a different component, rather than Counter with very complex state management. When we have done with the Counter, let's convert GameScore in the same manner:

```tsx
type GameScoreId = string

interface GameScoreState {
  id: GameScoreId
  firstCounter: CounterState
  secondCounter: CounterState
}

const initGameScore = (): GameScoreState => ({
  id: uuid(),
  firstCounter: initCounter(),
  secondCounter: initCounter(),
})

const resetGameScore = (state: GameScoreState): GameScoreState => ({
  ...state,
  firstCounter: { ...state.firstCounter, count: 0 },
  secondCounter: { ...state.secondCounter, count: 0 },
})

type GameScoreAction = { type: "RESET"; id: GameScoreId }

const gameScoreReducer = (state: GameScoreState, action: GameScoreAction) => {
  switch (action.type) {
    case "RESET":
      return resetGameScore(state)

    default:
      return {
        ...state,
        firstCounter: counterReducer(state.firstCounter, action),
        secondCounter: counterReducer(state.secondCounter, action),
      }
  }
}

const GameScore: React.VFC<{
  state: GameScoreState
  dispatch: React.Dispatch<GameScoreAction>
}> = ({ state, dispatch }) => (
  <div>
    <Counter state={state.firstCounter} dispatch={dispatch} />
    <Counter state={state.secondCounter} dispatch={dispatch} />
    <button onClick={() => dispatch({ type: "RESET", id: state.id })}>
      Reset
    </button>
    <span>
      Score: {state.firstCounter.count} vs {state.secondCounter.count}
    </span>
  </div>
)
```

Quite some boilerplate code again. But let's move on and finally make the App component:

```tsx
interface AppState {
  games: ReadonlyArray<GameScoreState>
}

const prepareAppRequestPayload = (state: AppState) => ({
  games: state.games.map((game) => ({
    firstCounter: game.firstCounter.count,
    secondCounter: game.secondCounter.count,
  })),
})

type AppAction = { type: "ADD_GAME" } | { type: "RESET_ALL_GAMES" }

const appReducer = (state: AppState, action: AppAction) => {
  switch (action.type) {
    case "ADD_GAME":
      return {
        ...state,
        games: [...state.games, initGameScore()],
      }

    case "RESET_ALL_GAMES":
      return {
        ...state,
        games: state.games.map(resetGameScore),
      }

    default:
      return {
        ...state,
        games: state.games.map((game) => gameScoreReducer(game, action)),
      }
  }
}

const App = () => {
  const [state, dispatch] = React.useReducer(appReducer, {
    games: [],
  })

  return (
    <div>
      <button onClick={() => dispatch({ type: "ADD_GAME" })}>Add game</button>
      <button onClick={() => dispatch({ type: "RESET_ALL_GAMES" })}>
        Reset all
      </button>
      <button onClick={() => sendGames(prepareAppRequestPayload(state))}>
        Submit games
      </button>

      {state.games.map((game) => (
        <GameScore key={game.id} state={game} dispatch={dispatch} />
      ))}
    </div>
  )
}
```

From now and on, any Counter increment will cause the entire App to reconcile. It might be limited by applying a bunch of React optimization techniques and extra checks in reducers, but this is extra work and extra lines of code. You might also notice that any Counter's action dispatched will cause all Counter's reducers to handle the Counter's states instances.

But the problems above are relatively small compared to the amount of boilerplate and effort required to develop an app in that way. It would not be a case if we'd deal with only local state components, but the App needs access to read and write deeply nested values, so we have no choice but to define the state on App's level.

That is where `react-inner-store` comes to the rescue. It allows working with a propagated state in the same way as with a local state. Let's transform Counter to use `react-inner-store`:

<table>
<thead>
<tr>
<th>
<code>react-inner-store</code>
</th>

<th>
classic React
</th>
</tr>
</thead>
<tbody>
<tr>
<td valign="top">

```tsx
const Counter: React.VFC<{
  store: InnerStore<number>
}> = ({ store }) => {
  const [count, setCount] = useInnerState(store)

  return (
    <div>
      <button onClick={() => setCount(count - 1)}>-</button>
      <span>{state.count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

</td>

<td>

```tsx
type CounterId = string

interface CounterState {
  id: CounterId
  count: number
}

const initCounter = (): CounterState => ({
  id: uuid(),
  count: 0,
})

type CounterAction =
  | { type: "INCREMENT"; id: CounterId }
  | { type: "DECREMENT"; id: CounterId }

const counterReducer = (state: CounterState, action: CounterAction) => {
  switch (action.type) {
    case "INCREMENT":
      return state.id === action.id
        ? { ...state, count: state.count + 1 }
        : state

    case "DECREMENT":
      return state.id === action.id
        ? { ...state, count: state.count - 1 }
        : state

    default:
      return state
  }
}

const Counter: React.VFC<{
  state: CounterState
  dispatch: React.Dispatch<CounterAction>
}> = ({ state, dispatch }) => (
  <div>
    <button onClick={() => dispatch({ type: "DECREMENT", id: state.id })}>
      -
    </button>
    <span>{state.count}</span>
    <button onClick={() => dispatch({ type: "INCREMENT", id: state.id })}>
      +
    </button>
  </div>
)
```

</td>
</tr>
</tbody>
</table>

It looks like the [first Counter implementation](#simple-counter) with `React.useState` only, doesn't it? A key difference is that any component with access to the `store` might read or write the state the same as `Counter` does!

<details>

  <summary>
    Wanna see how the rest of the app code looks like? Click here!
  </summary>

<table>
<thead>
<tr>
<th>
<code>react-inner-store</code>
</th>

<th>
classic React
</th>
</tr>
</thead>
<tbody>
<tr>
<td valign="top">

```tsx
interface GameScoreState {
  firstCounter: InnerStore<number>
  secondCounter: InnerStore<number>
}

const initGameScore = (): GameScoreState => ({
  firstCounter: InnerStore.of(0),
  secondCounter: InnerStore.of(0),
})

const resetGameScore = (state: GameScoreState): void => {
  state.firstCounter.setState(0)
  state.secondCounter.setState(0)
}

const GameScore: React.VFC<{
  store: InnerStore<GameScoreState>
}> = ({ store }) => {
  const state = useGetInnerState(store)
  const firstCount = useGetInnerState(state.firstCounter)
  const secondCount = useGetInnerState(state.secondCounter)

  return (
    <div>
      <Counter store={state.firstCounter} />
      <Counter store={state.secondCounter} />
      <button onClick={() => resetGameScore(state)}>Reset</button>
      <span>
        Score: {firstCount} vs {secondCount}
      </span>
    </div>
  )
}
```

</td>

<td>

```tsx
type GameScoreId = string

interface GameScoreState {
  id: GameScoreId
  firstCounter: CounterState
  secondCounter: CounterState
}

const initGameScore = (): GameScoreState => ({
  id: uuid(),
  firstCounter: initCounter(),
  secondCounter: initCounter(),
})

const resetGameScore = (state: GameScoreState) => ({
  ...state,
  firstCounter: { ...state.firstCounter, count: 0 },
  secondCounter: { ...state.secondCounter, count: 0 },
})

type GameScoreAction = { type: "RESET"; id: GameScoreId }

const gameScoreReducer = (state: GameScoreState, action: GameScoreAction) => {
  switch (action.type) {
    case "RESET":
      return resetGameScore(state)

    default:
      return {
        ...state,
        firstCounter: counterReducer(state.firstCounter, action),
        secondCounter: counterReducer(state.secondCounter, action),
      }
  }
}

const GameScore: React.VFC<{
  state: GameScoreState
  dispatch: React.Dispatch<GameScoreAction>
}> = ({ state, dispatch }) => (
  <div>
    <Counter state={state.firstCounter} dispatch={dispatch} />
    <Counter state={state.secondCounter} dispatch={dispatch} />
    <button onClick={() => dispatch({ type: "RESET", id: state.id })}>
      Reset
    </button>
    <span>
      Score: {state.firstCounter.count} vs {state.secondCounter.count}
    </span>
  </div>
)
```

</td>
</tr>

<tr>
<td valign="top">

```tsx
interface AppState {
  games: ReadonlyArray<InnerStore<GameScoreState>>
}

const prepareAppRequestPayload = (state: AppState) => ({
  games: state.games.map((game) =>
    game.getState((gameState) => ({
      firstCounter: gameState.firstCounter.getState(),
      secondCounter: gameState.secondCounter.getState(),
    })),
  ),
})

const appStore = InnerStore.of({ games: [] })

const App = () => {
  const [state, setState] = useInnerState(appStore)

  const addGame = () => {
    setState({
      ...state,
      games: [...state.games, InnerStore.of(initGameScore())],
    })
  }

  const resetAllGames = () => {
    setState((currentState) => {
      currentState.games.forEach((game) => game.getState(resetGameScore))

      return currentState
    })
  }

  return (
    <div>
      <button onClick={addGame}>Add game</button>
      <button onClick={resetAllGames}>Reset all</button>
      <button onClick={() => sendGames(prepareAppRequestPayload(state))}>
        Submit games
      </button>

      {state.games.map((game) => (
        <GameScore key={game.key} store={game} />
      ))}
    </div>
  )
}
```

</td>

<td>

```tsx
interface AppState {
  games: ReadonlyArray<GameScoreState>
}

const prepareAppRequestPayload = (state: AppState) => ({
  games: state.games.map((game) => ({
    firstCounter: game.firstCounter.count,
    secondCounter: game.secondCounter.count,
  })),
})

type AppAction = { type: "ADD_GAME" } | { type: "RESET_ALL_GAMES" }

const appReducer = (state: AppState, action: AppAction) => {
  switch (action.type) {
    case "ADD_GAME":
      return {
        ...state,
        games: [...state.games, initGameScore()],
      }

    case "RESET_ALL_GAMES":
      return {
        ...state,
        games: state.games.map(resetGameScore),
      }

    default:
      return {
        ...state,
        games: state.games.map((game) => gameScoreReducer(game, action)),
      }
  }
}

const App = () => {
  const [state, dispatch] = React.useReducer(appReducer, {
    games: [],
  })

  return (
    <div>
      <button onClick={() => dispatch({ type: "ADD_GAME" })}>Add game</button>
      <button onClick={() => dispatch({ type: "RESET_ALL_GAMES" })}>
        Reset all
      </button>
      <button onClick={() => sendGames(prepareAppRequestPayload(state))}>
        Submit games
      </button>

      {state.games.map((game) => (
        <GameScore key={game.id} state={game} dispatch={dispatch} />
      ))}
    </div>
  )
}
```

</td>
</tr>
</tbody>
</table>

</details>

With `react-inner-store` we can now implement the same functionality without any boilerplate code but keep control over the app state. Moreover, any Counter's "action" will cause reconciliations only for its GameScore parent since no other components read the affected Counter's state.

## API

A core concept of the library is the `InnerStore` class. It is a mutable wrapper around an immutable value that allows to prevent unnecessary re-renders. The class provides an API to get and set the value, and to observe changes. There are hooks built on top of the API for convenient usage in React components.

### `InnerStore.of`

```ts
InnerStore.of<T>(value: T, compare?: null | Compare<T>): InnerStore<T>
```

A static method that creates a new `InnerStore` instance. The instance is mutable so once created it should be used for all future operations.

- `value` is the initial immutable value of the store.
- `[compare]` is an optional [`Compare`][compare] function to set as [`InnerStore#compare`][inner_store__compare]. If the `compare` function is not defined or `null` the strict equality check function (`===`) will be used.

```ts
type SignInFormState = {
  isSubmitting: boolean
  username: InnerStore<string>
  password: InnerStore<string>
  rememberMe: InnerStore<boolean>
}

const signInFormStore = InnerStore.of<SignInFormState>({
  isSubmitting: false,
  username: InnerStore.of(""),
  password: InnerStore.of(""),
  rememberMe: InnerStore.of(false),
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
    {options.map((option) => (
      <Toggle key={option.key} store={option} />
    ))}
  </>
)
```

### `InnerStore#compare`

```ts
InnerStore<T>#compare: Compare<T>
```

The [`compare`][compare] function compares the value of the store with the new value given via [`InnerStore#setState`][inner_store__set_state]. If the function returns `true` the store will not be updated so no listeners subscribed via [`InnerStore#subscribe`][inner_store__subscribe] will be notified.

> 💬 The `InnerStore#compare` function has the lowest priority when [`InnerStore#setState`][inner_store__set_state], [`useInnerState`][use_inner_state], [`useSetInnerState`][use_set_inner_state] or [`useInnerReducer`][use_inner_reducer] are called.

### `InnerStore#clone`

```ts
InnerStore<T>#clone(
  transform?: (value: T) => T,
  compare?: null | Compare<T>
): InnerStore<T>
```

An `InnerStore` instance's method that creates a new `InnerStore` instance with the same value.

- `[transform]` is an optional function that will be applied to the current value before cloning. It might be handy when cloning a `InnerStore` instance that contains mutable values (e.g. `InnerStore`).
- `[compare]` an optional [`Compare`][compare] function to replace [`InnerStore#compare`][inner_store__compare] of the cloned instance. If not defined the `InnerStore#compare` function of the source instance will be used. If `null` is passed the strict equality check function (`===`) will be used.

```ts
const signInFormStoreClone = signInFormStore.clone(
  ({ isSubmitting, username, password, rememberMe }) => ({
    isSubmitting,
    username: username.clone(),
    password: password.clone(),
    rememberMe: rememberMe.clone(),
  }),
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
    rememberMe: rememberMe.getState(),
  }),
)
```

### `InnerStore#setState`

```ts
InnerStore<T>#setState(
  valueOrTransform: React.SetStateAction<T>,
  compare?: null | Compare<T>
): void
```

An `InnerStore` instance's method that sets the value. Each time when the value changes all of the store's listeners passed via [`InnerStore#subscribe`][inner_store__subscribe] are called.

- `valueOrTransform` is the new value or a function that transforms the current value into the new value.
- `[compare]` is an optional [`Compare`][compare] function to use for this call only.
  If not defined the [`InnerStore#compare`][inner_store__compare] function of the instance will be used.
  If `null` is passed the strict equality check function (`===`) will be used.

```ts
const onSubmit = () => {
  signInFormStore.update((state) => {
    // reset password field
    state.password.setState("")

    return {
      ...state,
      isSubmitting: true,
    }
  })
}
```

> 💡 If `valueOrTransform` argument is a function it acts as [`batch`][batch].

> 💬 The method returns `void` to emphasize that `InnerStore` instances are mutable.

> 💬 The second argument `compare` function has medium priority, so it will be used instead of [`InnerStore#compare`][inner_store__compare].

### `InnerStore#subscribe`

```ts
InnerStore<T>#subscribe(listener: VoidFunction): VoidFunction
```

An `InnerStore` instance's method that subscribes to the store's value changes caused by [`InnerStore#setState`][inner_store__set_state] calls. Returns a cleanup function that unsubscribes the listener.

- `listener` is a function that a store will call when the value changes.

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
      onChange={(event) => store.setState(event.target.value)}
    />
  )
})
```

> 💬 The example above is for demonstration purposes only. In real world app it's usually better use provided hooks in most cases.

### `useInnerWatch`

```ts
function useInnerWatch<T>(watcher: () => T, compare?: null | Compare<T>): T
```

A hook that subscribes to all [`InnerStore#getState`][inner_store__get_state] execution involved in the `watcher` call. Due to the mutable nature of `InnerStore` instances a parent component won't be re-rendered when a child's `InnerStore` value is changed. The hook gives a way to watch after deep changes in the store's values and trigger a re-render when the returning value is changed.

- `watcher` is a function to read only the watching value meaning that it should never call [`InnerStore.of`][inner_store__of], [`InnerStore#clone`][inner_store__clone], [`InnerStore#setState`][inner_store__set_state] or [`InnerStore#subscribe`][inner_store__subscribe] methods inside.
- `[compare]` is an optional [`Compare`][compare] function with strict check (`===`) by default or when `null`. The hook won't trigger a re-render when the watching value is comparably equal to the current value.

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

> 💡 Keep in mind that the `watcher` function acts as a "reader" so you'd like to avoid heavy calculations inside it. Sometimes it might be a good idea to pass a watcher result to a separated memoization hook. The same is true for the `compare` function - you should choose wisely between avoiding extra re-renders and heavy comparisons.

### `useInnerState`

```ts
function useInnerState<T>(
  store: InnerStore<T>,
  compare?: null | Compare<T>,
): [T, SetInnerState<T>]

function useInnerState<T>(
  store: null | undefined | InnerStore<T>,
  compare?: null | Compare<T>,
): [null | undefined | T, SetInnerState<T>]
```

A hook that is similar to `React.useState` but for `InnerStore` instances. It subscribes to the store changes and returns the current value and a function to set the value.

- `store` is an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
- `[compare]` is an optional [`Compare`][compare] function. The store won't update if the new value is comparably equal to the current value. If not defined it uses `InnerStore#compare`. The strict equality check function (`===`) will be used if `null`.

```tsx
const UsernameInput: React.VFC<{
  store: InnerStore<string>
}> = React.memo(({ store }) => {
  const [username, setUsername] = useInnerState(store)

  return (
    <input
      type="text"
      value={username}
      onChange={(event) => setUsername(event.target.value)}
    />
  )
})
```

> 💡 The hook is a combination of [`useGetInnerState`][use_get_inner_state] and [`useSetInnerState`][use_set_inner_state], so use them if you need to either get+subscribe or set the store's value.

> 💬 The second argument `compare` function has medium priority, so it will be used instead of [`InnerStore#compare`][inner_store__compare].

### `useGetInnerState`

```ts
function useGetInnerState<T>(store: InnerStore<T>): T

function useGetInnerState<T>(
  store: null | undefined | InnerStore<T>,
): null | undefined | T
```

A hooks that subscribes to the store's changes and returns the current value.

- `store` is an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.

```tsx
const App: React.VFC<{
  left: InnerStore<number>
  right: InnerStore<number>
}> = React.memo(({ left, right }) => {
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
  compare?: null | Compare<T>,
): SetInnerState<T>
```

A hooks that returns a function to update the store's value. Might be useful when you need a way to update the store's value without subscribing to its changes.

- `store` is an `InnerStore` instance but can be `null` or `undefined` as a bypass when a store might be not defined.
- `[compare]` is an optional [`Compare`][compare] function. The store won't update if the new value is comparably equal to the current value. If not defined it uses `InnerStore#compare`. The strict equality check function (`===`) will be used if `null`.

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

> 💬 The second argument `compare` function has medium priority, so it will be used instead of [`InnerStore#compare`][inner_store__compare].

### `useInnerReducer`

```ts
function useInnerReducer<A, T>(
  store: InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [T, React.Dispatch<A>]

function useInnerReducer<A, T>(
  store: null | undefined | InnerStore<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [null | undefined | T, React.Dispatch<A>]
```

A hook that is similar to `React.useReducer` but for `InnerStore` instances. It subscribes to the store changes and returns the current value and a function to dispatch an action.

- `store` is an `InnerStore` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
- `reducer` is a function that transforms the current value and the dispatched action into the new value.
- `[compare]` is an optional [`Compare`][compare] function. The store won't update if the new value is comparably equal to the current value. If not defined it uses `InnerStore#compare`. The strict equality check function (`===`) will be used if `null`.

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

const Counter: React.VFC<{
  store: InnerStore<number>
}> = React.memo(({ store }) => {
  const [count, dispatch] = useInnerReducer(store, counterReducer)

  return (
    <div>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+</button>
    </div>
  )
})
```

> 💬 The third argument `compare` function has medium priority, so it will be used instead of [`InnerStore#compare`][inner_store__compare].

### `batch`

```ts
function batch(execute: VoidFunction): void
```

The `batch` function is a helper to optimise multiple stores' updates.

```tsx
const LoginForm: React.VFC<{
  email: InnerStore<string>
  password: InnerStore<string>
}> = ({ email: emailStore, password: passwordStore }) => {
  const [email, setEmail] = useInnerState(emailStore)
  const [password, setPassword] = useInnerState(passwordStore)

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

### `SetInnerState`

```ts
type SetInnerState<T> = (
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

> 💬 The second argument `compare` function has the highest priority so it will be used instead of [`InnerStore#compare`][inner_store__compare] and any other `compare` passed via [`InnerStore#setState`][inner_store__set_state], [`useInnerState`][use_inner_state], [`useSetInnerState`][use_set_inner_state] or [`useInnerReducer`][use_inner_reducer].

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

[inner_store__of]: #innerstoreof
[inner_store__compare]: #innerstorecompare
[inner_store__clone]: #innerstoreclone
[inner_store__get_state]: #innerstoregetstate
[inner_store__set_state]: #innerstoresetstate
[inner_store__subscribe]: #innerstoresubscribe
[use_inner_watch]: #useinnerwatch
[use_inner_state]: #useinnerstate
[use_inner_reducer]: #useinnerreducer
[use_get_inner_state]: #usegetinnerstate
[use_set_inner_state]: #usesetinnerstate
[batch]: #batch
[compare]: #compare
