import React from "react"
import { act, render, screen, within, fireEvent } from "@testing-library/react"

import {
  InnerStore,
  useGetInnerState,
  useSetInnerState,
  useInnerState,
  useInnerReducer,
  useInnerWatch,
} from "../src"

import { Counter } from "./helpers"

const useThrowAfterChanges = (
  throwAfterCount: number,
  deps: ReadonlyArray<unknown>,
): void => {
  const count = React.useRef(0)

  React.useEffect(() => {
    count.current++

    if (count.current > throwAfterCount) {
      throw new Error(
        `Changed ${count.current} times, when ${throwAfterCount} expected`,
      )
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const withinNthCounter = (position: number) => {
  return within(screen.getAllByTestId("counter")[position]!)
}

const CounterComponent: React.VFC<{
  count: InnerStore<number>
  onRender: VoidFunction
}> = React.memo(({ count: countStore, onRender }) => {
  const [count, setCount] = useInnerState(countStore)

  useThrowAfterChanges(1, [setCount])
  onRender()

  return (
    <div data-testid="counter">
      <button
        type="button"
        data-testid="decrement"
        onClick={() => setCount((x) => x - 1)}
      />
      <span data-testid="count">{count}</span>
      <button
        type="button"
        data-testid="increment"
        onClick={() => setCount(count + 1)}
      />
    </div>
  )
})

describe("Single store", () => {
  const GetterComponent: React.VFC<{
    store: InnerStore<Counter>
    onRender: VoidFunction
  }> = ({ store, onRender }) => {
    const state = useGetInnerState(store)

    onRender()

    return <span>{state.count}</span>
  }

  const SetterComponent: React.VFC<{
    name: string
    store: InnerStore<Counter>
    onRender: VoidFunction
  }> = ({ name, store, onRender }) => {
    const setState = useSetInnerState(store, Counter.compare)

    useThrowAfterChanges(1, [setState])
    onRender()

    return (
      <div data-testid={name}>
        <button
          type="button"
          data-testid="increment"
          onClick={() => setState(Counter.inc)}
        />

        <button
          type="button"
          data-testid="reset"
          onClick={() => setState({ count: 0 })}
        />
      </div>
    )
  }

  const SingleSetterSingleGetter: React.VFC<{
    store: InnerStore<Counter>
    onRootRender: VoidFunction
    onGetterRender: VoidFunction
    onSetterRender: VoidFunction
  }> = ({ store, onRootRender, onGetterRender, onSetterRender }) => {
    onRootRender()

    return (
      <div>
        <div data-testid="getter">
          <GetterComponent store={store} onRender={onGetterRender} />
        </div>
        <SetterComponent
          name="controls"
          store={store}
          onRender={onSetterRender}
        />
      </div>
    )
  }

  it("Single Setter / Getter", () => {
    const store = InnerStore.of({ count: 0 })
    const onRootRender = jest.fn()
    const onGetterRender = jest.fn()
    const onSetterRender = jest.fn()

    render(
      <SingleSetterSingleGetter
        store={store}
        onRootRender={onRootRender}
        onGetterRender={onGetterRender}
        onSetterRender={onSetterRender}
      />,
    )

    // check initial state
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId("getter")).toMatchSnapshot()

    // increment by from the component
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId("getter")).toMatchSnapshot()

    // increment from the outside
    act(() => store.setState(Counter.inc))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(3)
    expect(screen.getByTestId("getter")).toMatchSnapshot()

    // reset from the component
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(4)
    expect(screen.getByTestId("getter")).toMatchSnapshot()

    // reset second time in a row
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(4)
    expect(screen.getByTestId("getter")).toMatchSnapshot()
  })

  const MultipleSetterMultipleGetter: React.VFC<{
    store: InnerStore<Counter>
    onRootRender: VoidFunction
    onFirstGetterRender: VoidFunction
    onSecondGetterRender: VoidFunction
    onFirstSetterRender: VoidFunction
    onSecondSetterRender: VoidFunction
  }> = ({
    store,
    onRootRender,
    onFirstGetterRender,
    onSecondGetterRender,
    onFirstSetterRender,
    onSecondSetterRender,
  }) => {
    React.useEffect(() => {
      onRootRender()
    }, [onRootRender])

    return (
      <div>
        <div data-testid="getters">
          <GetterComponent store={store} onRender={onFirstGetterRender} />
          <GetterComponent store={store} onRender={onSecondGetterRender} />
        </div>
        <SetterComponent
          name="controls-1"
          store={store}
          onRender={onFirstSetterRender}
        />
        <SetterComponent
          name="controls-2"
          store={store}
          onRender={onSecondSetterRender}
        />
      </div>
    )
  }

  it("Multiple Setters / Getters", () => {
    const store = InnerStore.of({ count: 0 })
    const onRootRender = jest.fn()
    const onFirstGetterRender = jest.fn()
    const onSecondGetterRender = jest.fn()
    const onFirstSetterRender = jest.fn()
    const onSecondSetterRender = jest.fn()

    render(
      <MultipleSetterMultipleGetter
        store={store}
        onRootRender={onRootRender}
        onFirstGetterRender={onFirstGetterRender}
        onSecondGetterRender={onSecondGetterRender}
        onFirstSetterRender={onFirstSetterRender}
        onSecondSetterRender={onSecondSetterRender}
      />,
    )

    // check initial state
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId("getters")).toMatchSnapshot()

    // increment from the first component
    fireEvent.click(
      within(screen.getByTestId("controls-1")).getByTestId("increment"),
    )
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(2)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId("getters")).toMatchSnapshot()

    // increment from the second component
    fireEvent.click(
      within(screen.getByTestId("controls-2")).getByTestId("increment"),
    )
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(3)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(3)
    expect(screen.getByTestId("getters")).toMatchSnapshot()

    // increment from the outside
    act(() => store.setState(Counter.inc))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(4)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(4)
    expect(screen.getByTestId("getters")).toMatchSnapshot()
  })
})

// TODO use CounterComponent
describe("Multiple stores", () => {
  const LoginForm: React.VFC<{
    email: InnerStore<string>
    password: InnerStore<string>
    onRender: React.Dispatch<{
      email: string
      password: string
    }>
  }> = ({ email: emailStore, password: passwordStore, onRender }) => {
    const [email, setEmail] = useInnerState(emailStore)
    const [password, setPassword] = useInnerState(passwordStore)

    useThrowAfterChanges(1, [setEmail, setPassword])
    onRender({ email, password })

    return (
      <div>
        <input
          type="email"
          data-testid="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="password"
          data-testid="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button
          type="button"
          data-testid="reset"
          onClick={() => {
            setEmail("")
            setPassword("")
          }}
        />
      </div>
    )
  }

  it("Performs multi store management", () => {
    const email = InnerStore.of("")
    const password = InnerStore.of("")
    const onRender = jest.fn()

    render(<LoginForm email={email} password={password} onRender={onRender} />)

    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onRender).toHaveBeenNthCalledWith(1, {
      email: "",
      password: "",
    })

    // change email
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "john-doe@gmail.com" },
    })
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(onRender).toHaveBeenNthCalledWith(2, {
      email: "john-doe@gmail.com",
      password: "",
    })

    // change password
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "qwerty" },
    })
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(onRender).toHaveBeenNthCalledWith(3, {
      email: "john-doe@gmail.com",
      password: "qwerty",
    })

    // changes from the outside
    act(() => {
      email.setState("admin@gmail.com")
      password.setState("admin")
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onRender).toHaveBeenNthCalledWith(4, {
      email: "admin@gmail.com",
      password: "admin",
    })

    // reset
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRender).toHaveBeenCalledTimes(5)
    expect(onRender).toHaveBeenNthCalledWith(5, {
      email: "",
      password: "",
    })
  })
})

describe("Nested stores", () => {
  interface AppState {
    counts: ReadonlyArray<InnerStore<number>>
  }
  type AppAction = { type: "AddCounter" } | { type: "ResetCounters" }

  const App: React.VFC<{
    store: InnerStore<AppState>
    onRender: VoidFunction
    onCountRender: VoidFunction
  }> = ({ store, onRender, onCountRender }) => {
    const [state, dispatch] = useInnerReducer<AppState, AppAction>(
      store,
      (currentState, action) => {
        switch (action.type) {
          case "AddCounter": {
            return {
              ...currentState,
              counts: [...currentState.counts, InnerStore.of(0)],
            }
          }

          case "ResetCounters": {
            currentState.counts.forEach((count) => count.setState(0))

            return currentState
          }
        }
      },
    )

    useThrowAfterChanges(1, [dispatch])
    onRender()

    return (
      <div>
        <button
          type="button"
          data-testid="add-counter"
          onClick={() => dispatch({ type: "AddCounter" })}
        />
        <button
          type="button"
          data-testid="reset-counters"
          onClick={() => dispatch({ type: "ResetCounters" })}
        />
        <div data-testid="counters">
          {state.counts.map((count) => (
            <CounterComponent
              key={count.key}
              count={count}
              onRender={onCountRender}
            />
          ))}
        </div>
      </div>
    )
  }

  it("Performs nested store management", () => {
    const store = InnerStore.of<AppState>({ counts: [] })
    const onRender = jest.fn()
    const onCountRender = jest.fn()

    render(
      <App store={store} onRender={onRender} onCountRender={onCountRender} />,
    )

    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCountRender).toHaveBeenCalledTimes(0)

    // add first counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(onCountRender).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId("counters")).toMatchSnapshot()

    // increment the first counter
    fireEvent.click(withinNthCounter(0).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(onCountRender).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId("counters")).toMatchSnapshot()

    // add second counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(onCountRender).toHaveBeenCalledTimes(3)
    expect(screen.getByTestId("counters")).toMatchSnapshot()

    // double increment second counter
    fireEvent.click(withinNthCounter(1).getByTestId("increment"))
    fireEvent.click(withinNthCounter(1).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(onCountRender).toHaveBeenCalledTimes(5)
    expect(screen.getByTestId("counters")).toMatchSnapshot()

    // add third counter from the outside
    act(() => {
      store.setState((state) => ({
        ...state,
        counts: [...state.counts, InnerStore.of(3)],
      }))
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onCountRender).toHaveBeenCalledTimes(6)
    expect(screen.getByTestId("counters")).toMatchSnapshot()

    // double the third counter from the outside
    act(() => {
      store.getState().counts[2]!.setState((x) => 2 * x)
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onCountRender).toHaveBeenCalledTimes(7)
    expect(screen.getByTestId("counters")).toMatchSnapshot()

    // reset
    fireEvent.click(screen.getByTestId("reset-counters"))
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onCountRender).toHaveBeenCalledTimes(10)
    expect(screen.getByTestId("counters")).toMatchSnapshot()

    // increment all from the outside
    act(() => {
      store.getState().counts.forEach((count) => count.setState((x) => x + 1))
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onCountRender).toHaveBeenCalledTimes(13)
    expect(screen.getByTestId("counters")).toMatchSnapshot()
  })
})

describe("Watch single store", () => {
  const App: React.VFC<{
    store: InnerStore<number>
    onRender: VoidFunction
    onCountRender: VoidFunction
  }> = ({ store, onCountRender, onRender }) => {
    const [moreThenOne, lessThanFour] = useInnerWatch(
      () => {
        const count = store.getState()

        return [count > 1, count < 4]
      },
      ([left1, right1], [left2, right2]) => {
        return left1 === left2 && right1 === right2
      },
    )
    onRender()

    return (
      <div data-testid="app">
        {moreThenOne && <span>more than one</span>}
        {lessThanFour && <span>less than four</span>}

        <CounterComponent count={store} onRender={onCountRender} />
      </div>
    )
  }

  it("Performs single store watching", () => {
    const store = InnerStore.of(0)
    const onCountRender = jest.fn()
    const onRender = jest.fn()

    render(
      <App store={store} onCountRender={onCountRender} onRender={onRender} />,
    )

    // initial render and watcher setup
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCountRender).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId("app")).toMatchSnapshot()

    // increment
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(1) // does not re-render
    expect(onCountRender).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId("app")).toMatchSnapshot()

    // increment again
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(onCountRender).toHaveBeenCalledTimes(3)
    expect(screen.getByTestId("app")).toMatchSnapshot()

    // increment from the outside
    act(() => {
      store.setState((state) => state + 1)
    })
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(onCountRender).toHaveBeenCalledTimes(4)
    expect(screen.getByTestId("app")).toMatchSnapshot()

    // increment again
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(onCountRender).toHaveBeenCalledTimes(5)
    expect(screen.getByTestId("app")).toMatchSnapshot()
  })
})
