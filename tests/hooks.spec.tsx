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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const withinNth = (testId: string, position: number) => {
  return within(screen.getAllByTestId(testId)[position]!)
}

const CounterComponent: React.VFC<{
  count: InnerStore<number>
  onRender: VoidFunction
}> = React.memo(({ count: countStore, onRender }) => {
  const [count, setCount] = useInnerState(countStore)

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

    return <span data-testid="getter">{state.count}</span>
  }

  const SetterComponent: React.VFC<{
    store: InnerStore<Counter>
    onRender: VoidFunction
  }> = ({ store, onRender }) => {
    const setState = useSetInnerState(store, Counter.compare)

    onRender()

    return (
      <div data-testid="setter">
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
      <>
        <GetterComponent store={store} onRender={onGetterRender} />
        <SetterComponent store={store} onRender={onSetterRender} />
      </>
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
        <GetterComponent store={store} onRender={onFirstGetterRender} />
        <GetterComponent store={store} onRender={onSecondGetterRender} />
        <SetterComponent store={store} onRender={onFirstSetterRender} />
        <SetterComponent store={store} onRender={onSecondSetterRender} />
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
    expect(screen.getAllByTestId("getter")).toMatchSnapshot()

    // increment from the first component
    fireEvent.click(withinNth("setter", 0).getByTestId("increment"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(2)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(2)
    expect(screen.getAllByTestId("getter")).toMatchSnapshot()

    // increment from the second component
    fireEvent.click(withinNth("setter", 1).getByTestId("increment"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(3)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(3)
    expect(screen.getAllByTestId("getter")).toMatchSnapshot()

    // increment from the outside
    act(() => store.setState(Counter.inc))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(4)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(4)
    expect(screen.getAllByTestId("getter")).toMatchSnapshot()
  })
})

describe("Multiple stores", () => {
  const LoginForm: React.VFC<{
    email: InnerStore<string>
    password: InnerStore<string>
    onRender: VoidFunction
  }> = ({ email: emailStore, password: passwordStore, onRender }) => {
    const [email, setEmail] = useInnerState(emailStore)
    const [password, setPassword] = useInnerState(passwordStore)

    onRender()

    return (
      <>
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
      </>
    )
  }

  it("Performs multi store management", () => {
    const email = InnerStore.of("")
    const password = InnerStore.of("")
    const onRender = jest.fn()

    const { container } = render(
      <LoginForm email={email} password={password} onRender={onRender} />,
    )

    expect(onRender).toHaveBeenCalledTimes(1)
    expect(container).toMatchSnapshot()

    // change email
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "john-doe@gmail.com" },
    })
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(container).toMatchSnapshot()

    // change password
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "qwerty" },
    })
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(container).toMatchSnapshot()

    // changes from the outside
    act(() => {
      email.setState("admin@gmail.com")
      password.setState("admin")
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(container).toMatchSnapshot()

    // reset
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRender).toHaveBeenCalledTimes(5)
    expect(container).toMatchSnapshot()
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

    onRender()

    return (
      <>
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
        {state.counts.map((count) => (
          <CounterComponent
            key={count.key}
            count={count}
            onRender={onCountRender}
          />
        ))}
      </>
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
    expect(screen.getAllByTestId("counter")).toMatchSnapshot()

    // increment the first counter
    fireEvent.click(withinNth("counter", 0).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(onCountRender).toHaveBeenCalledTimes(2)
    expect(screen.getAllByTestId("counter")).toMatchSnapshot()

    // add second counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(onCountRender).toHaveBeenCalledTimes(3)
    expect(screen.getAllByTestId("counter")).toMatchSnapshot()

    // double increment second counter
    fireEvent.click(withinNth("counter", 1).getByTestId("increment"))
    fireEvent.click(withinNth("counter", 1).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(onCountRender).toHaveBeenCalledTimes(5)
    expect(screen.getAllByTestId("counter")).toMatchSnapshot()

    // add third counter from the outside
    act(() => {
      store.setState((state) => ({
        ...state,
        counts: [...state.counts, InnerStore.of(3)],
      }))
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onCountRender).toHaveBeenCalledTimes(6)
    expect(screen.getAllByTestId("counter")).toMatchSnapshot()

    // double the third counter from the outside
    act(() => {
      store.getState().counts[2]!.setState((x) => 2 * x)
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onCountRender).toHaveBeenCalledTimes(7)
    expect(screen.getAllByTestId("counter")).toMatchSnapshot()

    // reset
    fireEvent.click(screen.getByTestId("reset-counters"))
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onCountRender).toHaveBeenCalledTimes(10)
    expect(screen.getAllByTestId("counter")).toMatchSnapshot()

    // increment all from the outside
    act(() => {
      store.getState().counts.forEach((count) => count.setState((x) => x + 1))
    })
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(onCountRender).toHaveBeenCalledTimes(13)
    expect(screen.getAllByTestId("counter")).toMatchSnapshot()
  })
})

describe("Watch single store", () => {
  interface AppProps {
    store: InnerStore<number>
    onRender: VoidFunction
    onCountRender: VoidFunction
  }

  const SingleWatcherApp: React.VFC<AppProps> = ({
    store,
    onCountRender,
    onRender,
  }) => {
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
      <>
        {moreThenOne && <span>more than one</span>}
        {lessThanFour && <span>less than four</span>}

        <CounterComponent count={store} onRender={onCountRender} />
      </>
    )
  }

  const SingleMemoizedWatcherApp: React.VFC<AppProps> = ({
    store,
    onCountRender,
    onRender,
  }) => {
    const [moreThenOne, lessThanFour] = useInnerWatch(
      React.useCallback(() => {
        const count = store.getState()

        return [count > 1, count < 4]
      }, [store]),
      React.useCallback(([left1, right1], [left2, right2]) => {
        return left1 === left2 && right1 === right2
      }, []),
    )
    onRender()

    return (
      <>
        {moreThenOne && <span>more than one</span>}
        {lessThanFour && <span>less than four</span>}

        <CounterComponent count={store} onRender={onCountRender} />
      </>
    )
  }

  const MultipleWatchersApp: React.VFC<AppProps> = ({
    store,
    onCountRender,
    onRender,
  }) => {
    const moreThenOne = useInnerWatch(() => store.getState() > 1)
    const lessThanFour = useInnerWatch(() => store.getState() < 4)
    onRender()

    return (
      <>
        {moreThenOne && <span>more than one</span>}
        {lessThanFour && <span>less than four</span>}

        <CounterComponent count={store} onRender={onCountRender} />
      </>
    )
  }

  const MultipleMemoizedWatchersApp: React.VFC<AppProps> = ({
    store,
    onCountRender,
    onRender,
  }) => {
    const moreThenOne = useInnerWatch(
      React.useCallback(() => store.getState() > 1, [store]),
    )
    const lessThanFour = useInnerWatch(
      React.useCallback(() => store.getState() < 4, [store]),
    )
    onRender()

    return (
      <>
        {moreThenOne && <span>more than one</span>}
        {lessThanFour && <span>less than four</span>}

        <CounterComponent count={store} onRender={onCountRender} />
      </>
    )
  }

  it.each([
    ["single watcher", SingleWatcherApp],
    ["single memoized watcher", SingleMemoizedWatcherApp],
    ["multiple watchers", MultipleWatchersApp],
    ["multiple memoized watchers", MultipleMemoizedWatchersApp],
  ])("watches single store with %s", (_, App) => {
    const store = InnerStore.of(0)
    const onCountRender = jest.fn()
    const onRender = jest.fn()

    render(
      <App store={store} onCountRender={onCountRender} onRender={onRender} />,
    )

    // initial render and watcher setup
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCountRender).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("more than one")).not.toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("0")

    // increment
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(1) // does not re-render
    expect(onCountRender).toHaveBeenCalledTimes(2)
    expect(screen.queryByText("more than one")).not.toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("1")

    // increment again
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(onCountRender).toHaveBeenCalledTimes(3)
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("2")

    // increment from the outside
    act(() => {
      store.setState((state) => state + 1)
    })
    expect(onRender).toHaveBeenCalledTimes(2) // does not re-render
    expect(onCountRender).toHaveBeenCalledTimes(4)
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("3")

    // increment again
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(onCountRender).toHaveBeenCalledTimes(5)
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).not.toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("4")
  })
})

describe("Watch multiple store", () => {
  interface AppProps {
    firstCount: InnerStore<number>
    secondCount: InnerStore<number>
    onRender: VoidFunction
    onFirstCountRender: VoidFunction
    onSecondCountRender: VoidFunction
  }

  const SingleWatcherApp: React.VFC<AppProps> = ({
    firstCount,
    secondCount,
    onFirstCountRender,
    onSecondCountRender,
    onRender,
  }) => {
    const [moreThenOne, lessThanFour] = useInnerWatch(
      () => {
        const sum = firstCount.getState() + secondCount.getState()

        return [sum > 2, sum < 7]
      },
      ([left1, right1], [left2, right2]) => {
        return left1 === left2 && right1 === right2
      },
    )
    onRender()

    return (
      <>
        {moreThenOne && <span>more than two</span>}
        {lessThanFour && <span>less than seven</span>}

        <button
          type="button"
          data-testid="increment-both"
          onClick={() => {
            firstCount.setState((state) => state + 1)
            secondCount.setState((state) => state + 1)
          }}
        />

        <CounterComponent count={firstCount} onRender={onFirstCountRender} />
        <CounterComponent count={secondCount} onRender={onSecondCountRender} />
      </>
    )
  }

  const SingleMemoizedWatcherApp: React.VFC<AppProps> = ({
    firstCount,
    secondCount,
    onFirstCountRender,
    onSecondCountRender,
    onRender,
  }) => {
    const [moreThenOne, lessThanFour] = useInnerWatch(
      React.useCallback(() => {
        const sum = firstCount.getState() + secondCount.getState()

        return [sum > 2, sum < 7]
      }, [firstCount, secondCount]),
      React.useCallback(([left1, right1], [left2, right2]) => {
        return left1 === left2 && right1 === right2
      }, []),
    )
    onRender()

    return (
      <>
        {moreThenOne && <span>more than two</span>}
        {lessThanFour && <span>less than seven</span>}

        <button
          type="button"
          data-testid="increment-both"
          onClick={() => {
            firstCount.setState((state) => state + 1)
            secondCount.setState((state) => state + 1)
          }}
        />

        <CounterComponent count={firstCount} onRender={onFirstCountRender} />
        <CounterComponent count={secondCount} onRender={onSecondCountRender} />
      </>
    )
  }

  const MultipleWatchersApp: React.VFC<AppProps> = ({
    firstCount,
    secondCount,
    onFirstCountRender,
    onSecondCountRender,
    onRender,
  }) => {
    const moreThenOne = useInnerWatch(() => {
      const sum = firstCount.getState() + secondCount.getState()

      return sum > 2
    })
    const lessThanFour = useInnerWatch(() => {
      const sum = firstCount.getState() + secondCount.getState()

      return sum < 7
    })
    onRender()

    return (
      <>
        {moreThenOne && <span>more than two</span>}
        {lessThanFour && <span>less than seven</span>}

        <button
          type="button"
          data-testid="increment-both"
          onClick={() => {
            firstCount.setState((state) => state + 1)
            secondCount.setState((state) => state + 1)
          }}
        />

        <CounterComponent count={firstCount} onRender={onFirstCountRender} />
        <CounterComponent count={secondCount} onRender={onSecondCountRender} />
      </>
    )
  }

  const MultipleMemoizedWatchersApp: React.VFC<AppProps> = ({
    firstCount,
    secondCount,
    onFirstCountRender,
    onSecondCountRender,
    onRender,
  }) => {
    const moreThenOne = useInnerWatch(
      React.useCallback(() => {
        const sum = firstCount.getState() + secondCount.getState()

        return sum > 2
      }, [firstCount, secondCount]),
    )
    const lessThanFour = useInnerWatch(
      React.useCallback(() => {
        const sum = firstCount.getState() + secondCount.getState()

        return sum < 7
      }, [firstCount, secondCount]),
    )
    onRender()

    return (
      <>
        {moreThenOne && <span>more than two</span>}
        {lessThanFour && <span>less than seven</span>}

        <button
          type="button"
          data-testid="increment-both"
          onClick={() => {
            firstCount.setState((state) => state + 1)
            secondCount.setState((state) => state + 1)
          }}
        />

        <CounterComponent count={firstCount} onRender={onFirstCountRender} />
        <CounterComponent count={secondCount} onRender={onSecondCountRender} />
      </>
    )
  }

  it.each([
    ["single watcher", SingleWatcherApp],
    ["single memoized watcher", SingleMemoizedWatcherApp],
    ["multiple watchers", MultipleWatchersApp],
    ["multiple memoized watchers", MultipleMemoizedWatchersApp],
  ])("watches multiple stores with %s", (_, App) => {
    const firstCount = InnerStore.of(0)
    const secondCount = InnerStore.of(0)
    const onFirstCountRender = jest.fn()
    const onSecondCountRender = jest.fn()
    const onRender = jest.fn()

    render(
      <App
        firstCount={firstCount}
        secondCount={secondCount}
        onFirstCountRender={onFirstCountRender}
        onSecondCountRender={onSecondCountRender}
        onRender={onRender}
      />,
    )

    // initial render and watcher setup
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onFirstCountRender).toHaveBeenCalledTimes(1)
    expect(onSecondCountRender).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("more than two")).not.toBeInTheDocument()
    expect(screen.queryByText("less than seven")).toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("0")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("0")

    // increment first count
    fireEvent.click(withinNth("counter", 0).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(1) // does not re-render
    expect(onFirstCountRender).toHaveBeenCalledTimes(2)
    expect(onSecondCountRender).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("more than two")).not.toBeInTheDocument()
    expect(screen.queryByText("less than seven")).toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("1")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("0")

    // increment second count
    fireEvent.click(withinNth("counter", 1).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(1) // does not re-render
    expect(onFirstCountRender).toHaveBeenCalledTimes(2)
    expect(onSecondCountRender).toHaveBeenCalledTimes(2)
    expect(screen.queryByText("more than two")).not.toBeInTheDocument()
    expect(screen.queryByText("less than seven")).toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("1")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("1")

    // increment both
    fireEvent.click(screen.getByTestId("increment-both"))
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(onFirstCountRender).toHaveBeenCalledTimes(3)
    expect(onSecondCountRender).toHaveBeenCalledTimes(3)
    expect(screen.queryByText("more than two")).toBeInTheDocument()
    expect(screen.queryByText("less than seven")).toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("2")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("2")

    // increment both again
    fireEvent.click(screen.getByTestId("increment-both"))
    expect(onRender).toHaveBeenCalledTimes(2) // does not re-render
    expect(onFirstCountRender).toHaveBeenCalledTimes(4)
    expect(onSecondCountRender).toHaveBeenCalledTimes(4)
    expect(screen.queryByText("more than two")).toBeInTheDocument()
    expect(screen.queryByText("less than seven")).toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("3")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("3")

    // increment first
    fireEvent.click(withinNth("counter", 0).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(onFirstCountRender).toHaveBeenCalledTimes(5)
    expect(onSecondCountRender).toHaveBeenCalledTimes(4)
    expect(screen.queryByText("more than two")).toBeInTheDocument()
    expect(screen.queryByText("less than seven")).not.toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("4")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("3")

    // increment both from the outside
    act(() => {
      firstCount.setState((state) => state + 1)
      secondCount.setState((state) => state + 1)
    })
    expect(onRender).toHaveBeenCalledTimes(3) // does not re-render
    expect(onFirstCountRender).toHaveBeenCalledTimes(6)
    expect(onSecondCountRender).toHaveBeenCalledTimes(5)
    expect(screen.queryByText("more than two")).toBeInTheDocument()
    expect(screen.queryByText("less than seven")).not.toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("5")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("4")
  })
})
