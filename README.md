# `react-sweety` 🍬

The clean and natural React state management.

[![codecov](https://codecov.io/gh/owanturist/react-sweety/branch/master/graph/badge.svg?token=QP3SXO8E9F)](https://codecov.io/gh/owanturist/react-sweety)

## Demos

- [Todo MVC](https://codesandbox.io/s/react-sweety-todo-mvc-inr46?file=/src/TodoApp.tsx) - an implementation of [todomvc.com](https://todomvc.com) template.
- [Obstacle maze](https://obstacle-maze.surge.sh) - an application to build and solve mazes with [source code](https://github.com/owanturist/obstacle-maze) at GitHub.
- [Catanstat](https://catanstat.surge.sh) - an application to track [Catan](https://www.catan.com) game statistics with [source code](https://github.com/owanturist/catanstat) at GitHub.

## Get started

First, install the package:

```bash
# with yarn
yarn add react-sweety

# with npm
npm install react-sweety
```

And use it in your project:

```tsx
import React from "react"
import { Sweety, useSweetyState } from "react-sweety"

type State = {
  username: Sweety<string>
  count: Sweety<number>
}

const Username: React.FC<{
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

const Counter: React.FC<{
  store: Sweety<number>
}> = ({ store }) => {
  const [count, setCount] = useSweetyState(store)

  return (
    <div>
      <button onClick={() => setCount(count - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}

const App: React.FC<{
  state: State
}> = ({ state }) => (
  <div>
    <Username store={state.username} />
    <Counter store={state.count} />

    <button
      onClick={() => {
        // read values
        const username = state.username.getState()
        const count = state.count.getState()

        console.log(`User "${username}" gets ${count} score.`)

        // change values
        state.username.setState("")
        state.count.setState(0)
      }}
    >
      Submit
    </button>
  </div>
)

ReactDOM.render(
  <App
    state={{
      username: Sweety.of(""),
      count: Sweety.of(0),
    }}
  />,
  document.getElementById("root"),
)
```

## Motivation

Yet another React state management library... Why do you need it? That's a fair question and it needs a decent explanation. Let me walk you through it.

<a name="simple-counter"></a>Imagine you are building a stateful Counter component:

```tsx
import React from "react"

const Counter: React.FC = () => {
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

const Counter: React.FC<{
  onChange?(count: number): void
}> = ({ onChange }) => {
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
}
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

const Counter: React.FC<{
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

const Counter: React.FC<{
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
const GameScore: React.FC<{
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

const Counter: React.FC<{
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

const GameScore: React.FC<{
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

That is where `react-sweety` comes to the rescue. It allows working with a propagated state in the same way as with a local state. Let's transform Counter to use `react-sweety`:

<table>
<thead>
<tr>
<th>
<code>react-sweety</code>
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
const Counter: React.FC<{
  store: Sweety<number>
}> = ({ store }) => {
  const [count, setCount] = useSweetyState(store)

  return (
    <div>
      <button onClick={() => setCount(count - 1)}>-</button>
      <span>{count}</span>
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

const Counter: React.FC<{
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
<code>react-sweety</code>
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
  firstCounter: Sweety<number>
  secondCounter: Sweety<number>
}

const initGameScore = (): GameScoreState => ({
  firstCounter: Sweety.of(0),
  secondCounter: Sweety.of(0),
})

const resetGameScore = (state: GameScoreState): void => {
  state.firstCounter.setState(0)
  state.secondCounter.setState(0)
}

const GameScore: React.FC<{
  store: Sweety<GameScoreState>
}> = ({ store }) => {
  const state = useGetSweetyState(store)
  const firstCount = useGetSweetyState(state.firstCounter)
  const secondCount = useGetSweetyState(state.secondCounter)

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

const GameScore: React.FC<{
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
  games: ReadonlyArray<Sweety<GameScoreState>>
}

const prepareAppRequestPayload = (state: AppState) => ({
  games: state.games.map((game) =>
    game.getState((gameState) => ({
      firstCounter: gameState.firstCounter.getState(),
      secondCounter: gameState.secondCounter.getState(),
    })),
  ),
})

const App = () => {
  const store = useSweety({ games: [] })
  const [state, setState] = useSweetyState(store)

  const addGame = () => {
    setState({
      ...state,
      games: [...state.games, Sweety.of(initGameScore())],
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

With `react-sweety` we can now implement the same functionality without any boilerplate code but keep control over the app state. Moreover, any Counter's "action" will cause reconciliations only for its GameScore parent since no other components read the affected Counter's state.

## API

A core concept of the library is the `Sweety` class. It is a mutable wrapper around an immutable value that allows to prevent unnecessary re-renders. The class provides an API to get and set the value, and to observe changes. There are hooks built on top of the API for convenient usage in React components.

### `Sweety.of`

```ts
Sweety.of<T>(value: T, compare?: null | Compare<T>): Sweety<T>
```

A static method that creates a new `Sweety` instance. The instance is mutable so once created it should be used for all future operations.

- `value` is the initial immutable value of the store.
- `[compare]` is an optional [`Compare`][compare] function to set as [`Sweety#compare`][sweety__compare]. If the `compare` function is not defined or `null` the strict equality check function (`===`) will be used.

> 💡 The [`useSweety`][use_sweety] hook might help to create and store a `Sweety` instance inside a React component.

```ts
type SignInFormState = {
  isSubmitting: boolean
  username: Sweety<string>
  password: Sweety<string>
  rememberMe: Sweety<boolean>
}

const signInFormStore = Sweety.of<SignInFormState>({
  isSubmitting: false,
  username: Sweety.of(""),
  password: Sweety.of(""),
  rememberMe: Sweety.of(false),
})
```

### `Sweety#key`

```ts
Sweety<T>#key: string
```

Each `Sweety` instance has a unique key. This key is used internally for [`useWatchSweety`][use_watch_sweety] but can be used as the React key property.

```tsx
const Toggles: React.FC<{
  options: Array<Sweety<boolean>>
}> = ({ options }) => (
  <>
    {options.map((option) => (
      <Toggle key={option.key} store={option} />
    ))}
  </>
)
```

### `Sweety#compare`

```ts
Sweety<T>#compare: Compare<T>
```

The [`compare`][compare] function compares the value of the store with the new value given via [`Sweety#setState`][sweety__set_state]. If the function returns `true` the store will not be updated so no listeners subscribed via [`Sweety#subscribe`][sweety__subscribe] will be notified.

> 💬 The `Sweety#compare` function has the lowest priority when [`Sweety#setState`][sweety__set_state], [`useSweetyState`][use_sweety_state], [`useSetSweetyState`][use_set_sweety_state] or [`useSweetyReducer`][use_sweety_reducer] are called.

### `Sweety#clone`

```ts
Sweety<T>#clone(
  transform?: (value: T) => T,
  compare?: null | Compare<T>
): Sweety<T>
```

A `Sweety` instance's method that creates a new `Sweety` instance with the same value.

- `[transform]` is an optional function that will be applied to the current value before cloning. It might be handy when cloning a `Sweety` instance that contains mutable values (e.g. `Sweety`).
- `[compare]` an optional [`Compare`][compare] function to replace [`Sweety#compare`][sweety__compare] of the cloned instance. If not defined the `Sweety#compare` function of the source instance will be used. If `null` is passed the strict equality check function (`===`) will be used.

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

### `Sweety#getState`

```ts
Sweety<T>#getState(): T
Sweety<T>#getState<R>(transform: (value: T) => R): R
```

A `Sweety` instance's method that returns the current value.

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

### `Sweety#setState`

```ts
Sweety<T>#setState(
  valueOrTransform: React.SetStateAction<T>,
  compare?: null | Compare<T>
): void
```

A `Sweety` instance's method that sets the value. Each time when the value changes all of the store's listeners passed via [`Sweety#subscribe`][sweety__subscribe] are called.

- `valueOrTransform` is the new value or a function that transforms the current value into the new value.
- `[compare]` is an optional [`Compare`][compare] function to use for this call only.
  If not defined the [`Sweety#compare`][sweety__compare] function of the instance will be used.
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

> 💬 The method returns `void` to emphasize that `Sweety` instances are mutable.

> 💬 The second argument `compare` function has medium priority, so it will be used instead of [`Sweety#compare`][sweety__compare].

### `Sweety#subscribe`

```ts
Sweety<T>#subscribe(listener: VoidFunction): VoidFunction
```

A `Sweety` instance's method that subscribes to the store's value changes caused by [`Sweety#setState`][sweety__set_state] calls. Returns a cleanup function that unsubscribes the listener.

- `listener` is a function that a store will call when the value changes.

```tsx
const UsernameInput: React.FC<{
  store: Sweety<string>
}> = ({ store }) => {
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
}
```

> 💬 The example above is for demonstration purposes only. In real world app it's usually better use provided hooks in most cases.

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

function useSweetyState<T>(
  store: null | undefined | Sweety<T>,
  compare?: null | Compare<T>,
): [null | undefined | T, SetSweetyState<T>]
```

A hook that is similar to `React.useState` but for `Sweety` instances. It subscribes to the store changes and returns the current value and a function to set the value.

- `store` is A `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
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

function useGetSweetyState<T>(
  store: null | undefined | Sweety<T>,
): null | undefined | T
```

A hooks that subscribes to the store's changes and returns the current value.

- `store` is A `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.

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
  store: null | undefined | Sweety<T>,
  compare?: null | Compare<T>,
): SetSweetyState<T>
```

A hooks that returns a function to update the store's value. Might be useful when you need a way to update the store's value without subscribing to its changes.

- `store` is A `Sweety` instance but can be `null` or `undefined` as a bypass when a store might be not defined.
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

function useSweetyReducer<A, T>(
  store: null | undefined | Sweety<T>,
  reducer: (state: T, action: A) => T,
  compare?: null | Compare<T>,
): [null | undefined | T, React.Dispatch<A>]
```

A hook that is similar to `React.useReducer` but for `Sweety` instances. It subscribes to the store changes and returns the current value and a function to dispatch an action.

- `store` is A `Sweety` instance but can be `null` or `undefined` as a bypass when there is no need to subscribe to the store's changes.
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

The first argument is either [`initialValue`] is a value to initialize the store or [`lazyInitialValue`] is a function returning an initial value that calls only once when the hook is called. It might be handy when the initial value is expensive to compute.

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

The `batch` function is a helper to optimise multiple stores' updates.

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
[batch]: #batch
[compare]: #compare
