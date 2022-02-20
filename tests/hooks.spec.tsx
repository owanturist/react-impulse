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

const withinNth = (testId: string, position: number) => {
  return within(screen.getAllByTestId(testId)[position]!)
}

const expectCounts = (expecting: ReadonlyArray<number>): void => {
  const counters = screen.queryAllByTestId("counter")

  expect(counters).toHaveLength(expecting.length)

  for (let i = 0; i < expecting.length; i++) {
    expect(within(counters[i]!).getByTestId("count")).toHaveTextContent(
      expecting[i]!.toString(),
    )
  }
}

const CounterComponent: React.VFC<{
  count: InnerStore<number>
  onRender: VoidFunction
}> = React.memo(
  ({ count: countStore, onRender }) => {
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
  },
  // onRender is ignored
  (prevProps, nextProps) => prevProps.count === nextProps.count,
)

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
    expect(screen.getByTestId("getter")).toHaveTextContent("0")

    // increment by from the component
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId("getter")).toHaveTextContent("1")

    // increment from the outside
    act(() => store.setState(Counter.inc))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(3)
    expect(screen.getByTestId("getter")).toHaveTextContent("2")

    // reset from the component
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(4)
    expect(screen.getByTestId("getter")).toHaveTextContent("0")

    // reset second time in a row
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(4)
    expect(screen.getByTestId("getter")).toHaveTextContent("0")

    // increment twice in a row
    fireEvent.click(screen.getByTestId("increment"))
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(6)
    expect(screen.getByTestId("getter")).toHaveTextContent("2")

    // increment twice in a row from the outside
    act(() => {
      store.setState(Counter.inc)
      store.setState(Counter.inc)
    })
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(7)
    expect(screen.getByTestId("getter")).toHaveTextContent("4")
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
    onRootRender()

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
    onCounterRender: React.Dispatch<number>
  }> = ({ store, onRender, onCounterRender }) => {
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
        {state.counts.map((count, index) => (
          <CounterComponent
            key={count.key}
            count={count}
            onRender={() => onCounterRender(index)}
          />
        ))}
      </>
    )
  }

  it("Performs nested store management", () => {
    const store = InnerStore.of<AppState>({ counts: [] })
    const onRender = jest.fn()
    const onCounterRender = jest.fn()

    render(
      <App
        store={store}
        onRender={onRender}
        onCounterRender={onCounterRender}
      />,
    )

    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(0)
    expectCounts([])
    jest.clearAllMocks()

    // add first counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expectCounts([0])
    jest.clearAllMocks()

    // increment the first counter
    fireEvent.click(withinNth("counter", 0).getByTestId("increment"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expectCounts([1])
    jest.clearAllMocks()

    // add second counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 1)
    expectCounts([1, 0])
    jest.clearAllMocks()

    // double increment second counter
    fireEvent.click(withinNth("counter", 1).getByTestId("increment"))
    fireEvent.click(withinNth("counter", 1).getByTestId("increment"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(2)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 1)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expectCounts([1, 2])
    jest.clearAllMocks()

    // add third counter from the outside
    act(() => {
      store.setState((state) => ({
        ...state,
        counts: [...state.counts, InnerStore.of(3)],
      }))
    })
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 2)
    expectCounts([1, 2, 3])
    jest.clearAllMocks()

    // double the third counter from the outside
    act(() => {
      store.getState().counts[2]!.setState((x) => 2 * x)
    })
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 2)
    expectCounts([1, 2, 6])
    jest.clearAllMocks()

    // reset
    fireEvent.click(screen.getByTestId("reset-counters"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(3)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(onCounterRender).toHaveBeenNthCalledWith(3, 2)
    expectCounts([0, 0, 0])
    jest.clearAllMocks()

    // increment all from the outside
    act(() => {
      store.getState().counts.forEach((count) => count.setState((x) => x + 1))
    })
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(3)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(onCounterRender).toHaveBeenNthCalledWith(3, 2)
    expectCounts([1, 1, 1])
  })
})

describe("Watch single store", () => {
  interface AppProps {
    count: InnerStore<number>
    onRender: VoidFunction
    onCounterRender: VoidFunction
  }

  const GenericApp: React.VFC<
    {
      moreThanOne: boolean
      lessThanFour: boolean
    } & AppProps
  > = ({ moreThanOne, lessThanFour, count, onRender, onCounterRender }) => {
    onRender()

    return (
      <>
        {moreThanOne && <span>more than one</span>}
        {lessThanFour && <span>less than four</span>}

        <CounterComponent count={count} onRender={onCounterRender} />
      </>
    )
  }

  const SingleWatcherApp: React.VFC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useInnerWatch(
      () => {
        const count = props.count.getState()

        return [count > 1, count < 4]
      },
      ([left1, right1], [left2, right2]) => {
        return left1 === left2 && right1 === right2
      },
    )

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  }

  const SingleMemoizedWatcherApp: React.VFC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useInnerWatch(
      React.useCallback(() => {
        const count = props.count.getState()

        return [count > 1, count < 4]
      }, [props.count]),
      React.useCallback(([left1, right1], [left2, right2]) => {
        return left1 === left2 && right1 === right2
      }, []),
    )

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  }

  const MultipleWatchersApp: React.VFC<AppProps> = (props) => {
    const moreThanOne = useInnerWatch(() => props.count.getState() > 1)
    const lessThanFour = useInnerWatch(() => props.count.getState() < 4)

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  }

  const MultipleMemoizedWatchersApp: React.VFC<AppProps> = (props) => {
    const moreThanOne = useInnerWatch(
      React.useCallback(() => props.count.getState() > 1, [props.count]),
    )
    const lessThanFour = useInnerWatch(
      React.useCallback(() => props.count.getState() < 4, [props.count]),
    )

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  }

  it.each([
    ["single watcher", SingleWatcherApp],
    ["single memoized watcher", SingleMemoizedWatcherApp],
    ["multiple watchers", MultipleWatchersApp],
    ["multiple memoized watchers", MultipleMemoizedWatchersApp],
  ])("watches single store with %s", (_, App) => {
    const count = InnerStore.of(0)
    const onCounterRender = jest.fn()
    const onRender = jest.fn()

    render(
      <App
        count={count}
        onCounterRender={onCounterRender}
        onRender={onRender}
      />,
    )

    // initial render and watcher setup
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("more than one")).not.toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("0")

    // increment
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(1) // does not re-render
    expect(onCounterRender).toHaveBeenCalledTimes(2)
    expect(screen.queryByText("more than one")).not.toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("1")

    // increment again
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(2)
    expect(onCounterRender).toHaveBeenCalledTimes(3)
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("2")

    // increment from the outside
    act(() => {
      count.setState((state) => state + 1)
    })
    expect(onRender).toHaveBeenCalledTimes(2) // does not re-render
    expect(onCounterRender).toHaveBeenCalledTimes(4)
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("3")

    // increment again
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(onCounterRender).toHaveBeenCalledTimes(5)
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).not.toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("4")
  })
})

describe("Watch multiple stores", () => {
  interface AppProps {
    firstCount: InnerStore<number>
    secondCount: InnerStore<number>
    onRender: VoidFunction
    onFirstCounterRender: VoidFunction
    onSecondCounterRender: VoidFunction
  }

  const GenericApp: React.VFC<
    {
      moreThanOne: boolean
      lessThanFour: boolean
    } & AppProps
  > = ({
    moreThanOne,
    lessThanFour,
    firstCount,
    secondCount,
    onRender,
    onFirstCounterRender,
    onSecondCounterRender,
  }) => {
    onRender()

    return (
      <>
        {moreThanOne && <span>more than two</span>}
        {lessThanFour && <span>less than seven</span>}

        <button
          type="button"
          data-testid="increment-both"
          onClick={() => {
            firstCount.setState((state) => state + 1)
            secondCount.setState((state) => state + 1)
          }}
        />

        <CounterComponent count={firstCount} onRender={onFirstCounterRender} />
        <CounterComponent
          count={secondCount}
          onRender={onSecondCounterRender}
        />
      </>
    )
  }

  const SingleWatcherApp: React.VFC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useInnerWatch(
      () => {
        const sum = props.firstCount.getState() + props.secondCount.getState()

        return [sum > 2, sum < 7]
      },
      ([left1, right1], [left2, right2]) => {
        return left1 === left2 && right1 === right2
      },
    )

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  }

  const SingleMemoizedWatcherApp: React.VFC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useInnerWatch(
      React.useCallback(() => {
        const sum = props.firstCount.getState() + props.secondCount.getState()

        return [sum > 2, sum < 7]
      }, [props.firstCount, props.secondCount]),
      React.useCallback(([left1, right1], [left2, right2]) => {
        return left1 === left2 && right1 === right2
      }, []),
    )

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  }

  const MultipleWatchersApp: React.VFC<AppProps> = (props) => {
    const moreThanOne = useInnerWatch(() => {
      const sum = props.firstCount.getState() + props.secondCount.getState()

      return sum > 2
    })
    const lessThanFour = useInnerWatch(() => {
      const sum = props.firstCount.getState() + props.secondCount.getState()

      return sum < 7
    })

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  }

  const MultipleMemoizedWatchersApp: React.VFC<AppProps> = (props) => {
    const moreThanOne = useInnerWatch(
      React.useCallback(() => {
        const sum = props.firstCount.getState() + props.secondCount.getState()

        return sum > 2
      }, [props.firstCount, props.secondCount]),
    )
    const lessThanFour = useInnerWatch(
      React.useCallback(() => {
        const sum = props.firstCount.getState() + props.secondCount.getState()

        return sum < 7
      }, [props.firstCount, props.secondCount]),
    )

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
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
        onFirstCounterRender={onFirstCountRender}
        onSecondCounterRender={onSecondCountRender}
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

describe("Watch nested stores", () => {
  abstract class AppState {
    public abstract counts: ReadonlyArray<InnerStore<number>>

    public static sum({ counts }: AppState): number {
      return counts.reduce((acc, count) => acc + count.getState(), 0)
    }
  }

  interface AppProps {
    store: InnerStore<AppState>
    onRender: VoidFunction
    onCounterRender: React.Dispatch<number>
  }

  const GenericApp: React.VFC<
    {
      moreThanTen: boolean
      lessThanTwenty: boolean
    } & AppProps
  > = ({ moreThanTen, lessThanTwenty, store, onRender, onCounterRender }) => {
    const [state, setState] = useInnerState(store)

    onRender()

    return (
      <>
        {moreThanTen && <span>more than ten</span>}
        {lessThanTwenty && <span>less than twenty</span>}

        <button
          type="button"
          data-testid="add-counter"
          onClick={() => {
            setState({
              ...state,
              counts: [...state.counts, InnerStore.of(0)],
            })
          }}
        />
        <button
          type="button"
          data-testid="reset-counters"
          onClick={() => {
            state.counts.forEach((count) => {
              count.setState(0)

              return count
            })
          }}
        />
        <button
          type="button"
          data-testid="increment-all"
          onClick={() => {
            store.setState((current) => {
              current.counts.forEach((count) => {
                count.setState((x) => x + 1)

                return count
              })

              return current
            })
          }}
        />
        {state.counts.map((count, index) => (
          <CounterComponent
            key={count.key}
            count={count}
            onRender={() => onCounterRender(index)}
          />
        ))}
      </>
    )
  }

  const SingleWatcherApp: React.VFC<AppProps> = (props) => {
    const [moreThanTen, lessThanTwenty] = useInnerWatch(
      () => {
        const count = AppState.sum(props.store.getState())

        return [count > 10, count < 20]
      },
      ([left1, right1], [left2, right2]) => {
        return left1 === left2 && right1 === right2
      },
    )

    return (
      <GenericApp
        moreThanTen={moreThanTen}
        lessThanTwenty={lessThanTwenty}
        {...props}
      />
    )
  }

  const SingleMemoizedWatcherApp: React.VFC<AppProps> = (props) => {
    const [moreThanTen, lessThanTwenty] = useInnerWatch(
      React.useCallback(() => {
        const count = AppState.sum(props.store.getState())

        return [count > 10, count < 20]
      }, [props.store]),
      React.useCallback(([left1, right1], [left2, right2]) => {
        return left1 === left2 && right1 === right2
      }, []),
    )

    return (
      <GenericApp
        moreThanTen={moreThanTen}
        lessThanTwenty={lessThanTwenty}
        {...props}
      />
    )
  }

  const MultipleWatchersApp: React.VFC<AppProps> = (props) => {
    const moreThanTen = useInnerWatch(() => {
      const count = props.store.getState(AppState.sum)

      return count > 10
    })
    const lessThanTwenty = useInnerWatch(() => {
      const count = AppState.sum(props.store.getState())

      return count < 20
    })

    return (
      <GenericApp
        moreThanTen={moreThanTen}
        lessThanTwenty={lessThanTwenty}
        {...props}
      />
    )
  }

  const MultipleMemoizedWatchersApp: React.VFC<AppProps> = (props) => {
    const moreThanTen = useInnerWatch(
      React.useCallback(() => {
        const count = props.store.getState(AppState.sum)

        return count > 10
      }, [props.store]),
    )
    const lessThanTwenty = useInnerWatch(
      React.useCallback(() => {
        const count = AppState.sum(props.store.getState())

        return count < 20
      }, [props.store]),
    )

    return (
      <GenericApp
        moreThanTen={moreThanTen}
        lessThanTwenty={lessThanTwenty}
        {...props}
      />
    )
  }

  it.each([
    ["single watcher", SingleWatcherApp],
    ["single memoized watcher", SingleMemoizedWatcherApp],
    ["multiple watchers", MultipleWatchersApp],
    ["multiple memoized watchers", MultipleMemoizedWatchersApp],
  ])("watches nested stores with %s", (_, App) => {
    const store = InnerStore.of<AppState>({
      counts: [],
    })
    const onRender = jest.fn()
    const onCounterRender = jest.fn()

    render(
      <App
        store={store}
        onRender={onRender}
        onCounterRender={onCounterRender}
      />,
    )

    // initial render and watcher setup
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(0)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([])
    jest.clearAllMocks()

    // add first counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([0])
    jest.clearAllMocks()

    // increment first counter
    fireEvent.click(withinNth("counter", 0).getByTestId("increment"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([1])
    jest.clearAllMocks()

    // add second counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 1)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([1, 0])
    jest.clearAllMocks()

    // increment all counters
    fireEvent.click(screen.getByTestId("increment-all"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(2)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([2, 1])
    jest.clearAllMocks()

    // add third counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 2)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([2, 1, 0])
    jest.clearAllMocks()

    // reset counters
    fireEvent.click(screen.getByTestId("reset-counters"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(2)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([0, 0, 0])
    jest.clearAllMocks()

    // add fourth counter from the outside
    act(() => {
      store.setState((state) => ({
        ...state,
        counts: [...state.counts, InnerStore.of(9)],
      }))
    })
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 3)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([0, 0, 0, 9])
    jest.clearAllMocks()

    // increment all counters
    fireEvent.click(screen.getByTestId("increment-all"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(4)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(onCounterRender).toHaveBeenNthCalledWith(3, 2)
    expect(onCounterRender).toHaveBeenNthCalledWith(4, 3)
    expect(screen.queryByText("more than ten")).toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([1, 1, 1, 10])
    jest.clearAllMocks()

    // add fifth counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 4)
    expect(screen.queryByText("more than ten")).toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([1, 1, 1, 10, 0])
    jest.clearAllMocks()

    // increment all counters
    fireEvent.click(screen.getByTestId("increment-all"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(5)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(onCounterRender).toHaveBeenNthCalledWith(3, 2)
    expect(onCounterRender).toHaveBeenNthCalledWith(4, 3)
    expect(onCounterRender).toHaveBeenNthCalledWith(5, 4)
    expect(screen.queryByText("more than ten")).toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([2, 2, 2, 11, 1])
    jest.clearAllMocks()

    // increment fifth counter
    fireEvent.click(withinNth("counter", 4).getByTestId("increment"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 4)
    expect(screen.queryByText("more than ten")).toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([2, 2, 2, 11, 2])
    jest.clearAllMocks()

    // increment fourth counter
    fireEvent.click(withinNth("counter", 3).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 3)
    expect(screen.queryByText("more than ten")).toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).not.toBeInTheDocument()
    expectCounts([2, 2, 2, 12, 2])
    jest.clearAllMocks()

    // reset all counters
    fireEvent.click(screen.getByTestId("reset-counters"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(5)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(onCounterRender).toHaveBeenNthCalledWith(3, 2)
    expect(onCounterRender).toHaveBeenNthCalledWith(4, 3)
    expect(onCounterRender).toHaveBeenNthCalledWith(5, 4)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([0, 0, 0, 0, 0])
    jest.clearAllMocks()

    // reset all counters again
    fireEvent.click(screen.getByTestId("reset-counters"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).not.toHaveBeenCalled()
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([0, 0, 0, 0, 0])
  })
})
