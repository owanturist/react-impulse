import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { Sweety, useSweetyState, useWatchSweety, watch } from "../../src"

import { CounterComponent, expectCounts, withinNth } from "./common"

describe("watching nested stores", () => {
  abstract class AppState {
    public abstract counts: ReadonlyArray<Sweety<number>>

    public static sum({ counts }: AppState): number {
      return counts.reduce((acc, count) => acc + count.getState(), 0)
    }
  }

  interface AppProps {
    store: Sweety<AppState>
    onRender: VoidFunction
    onCounterRender: React.Dispatch<number>
  }

  const GenericApp: React.FC<
    {
      moreThanTen: boolean
      lessThanTwenty: boolean
    } & AppProps
  > = ({ moreThanTen, lessThanTwenty, store, onRender, onCounterRender }) => {
    const state = useSweetyState(store)

    return (
      <>
        <React.Profiler id="test" onRender={onRender}>
          {moreThanTen && <span>more than ten</span>}
          {lessThanTwenty && <span>less than twenty</span>}

          <button
            type="button"
            data-testid="add-counter"
            onClick={() => {
              store.setState({
                ...state,
                counts: [...state.counts, Sweety.of(0)],
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
        </React.Profiler>

        {state.counts.map((count, index) => (
          <CounterComponent
            key={index}
            count={count}
            onRender={() => onCounterRender(index)}
          />
        ))}
      </>
    )
  }

  const SingleWatcherApp: React.FC<AppProps> = (props) => {
    const [moreThanTen, lessThanTwenty] = useWatchSweety(
      () => {
        const total = AppState.sum(props.store.getState())

        return [total > 10, total < 20]
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

  const SingleMemoizedWatcherApp: React.FC<AppProps> = (props) => {
    const [moreThanTen, lessThanTwenty] = useWatchSweety<[boolean, boolean]>(
      React.useCallback(() => {
        const total = AppState.sum(props.store.getState())

        return [total > 10, total < 20]
      }, [props.store]),
      React.useCallback(
        (
          [left1, right1]: [boolean, boolean],
          [left2, right2]: [boolean, boolean],
        ) => {
          return left1 === left2 && right1 === right2
        },
        [],
      ),
    )

    return (
      <GenericApp
        moreThanTen={moreThanTen}
        lessThanTwenty={lessThanTwenty}
        {...props}
      />
    )
  }

  const MultipleWatchersApp: React.FC<AppProps> = (props) => {
    const moreThanTen = useWatchSweety(() => {
      const total = props.store.getState(AppState.sum)

      return total > 10
    })
    const lessThanTwenty = useWatchSweety(() => {
      const total = AppState.sum(props.store.getState())

      return total < 20
    })

    return (
      <GenericApp
        moreThanTen={moreThanTen}
        lessThanTwenty={lessThanTwenty}
        {...props}
      />
    )
  }

  const MultipleMemoizedWatchersApp: React.FC<AppProps> = (props) => {
    const moreThanTen = useWatchSweety(
      React.useCallback(() => {
        const total = props.store.getState(AppState.sum)

        return total > 10
      }, [props.store]),
    )
    const lessThanTwenty = useWatchSweety(
      React.useCallback(() => {
        const total = AppState.sum(props.store.getState())

        return total < 20
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

  const WatchedApp: React.FC<AppProps> = watch((props) => {
    const total = AppState.sum(props.store.getState())
    const [moreThanTen, lessThanTwenty] = [total > 10, total < 20]

    return (
      <GenericApp
        moreThanTen={moreThanTen}
        lessThanTwenty={lessThanTwenty}
        {...props}
      />
    )
  })

  it.each([
    ["single watcher", SingleWatcherApp, 0],
    ["single memoized watcher", SingleMemoizedWatcherApp, 0],
    ["multiple watchers", MultipleWatchersApp, 0],
    ["multiple memoized watchers", MultipleMemoizedWatchersApp, 0],
    ["watch()", WatchedApp, 1],
  ])("watches nested stores with %s", (_, App, unnecessaryRerendersCount) => {
    const store = Sweety.of<AppState>({
      counts: [],
    })
    const onRender = vi.fn()
    const onCounterRender = vi.fn()

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
    vi.clearAllMocks()

    // add first counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([0])
    vi.clearAllMocks()

    // increment first counter
    fireEvent.click(withinNth("counter", 0).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([1])
    vi.clearAllMocks()

    // add second counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 1)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([1, 0])
    vi.clearAllMocks()

    // increment all counters
    fireEvent.click(screen.getByTestId("increment-all"))
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
    expect(onCounterRender).toHaveBeenCalledTimes(2)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([2, 1])
    vi.clearAllMocks()

    // add third counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 2)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([2, 1, 0])
    vi.clearAllMocks()

    // reset counters
    fireEvent.click(screen.getByTestId("reset-counters"))
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
    expect(onCounterRender).toHaveBeenCalledTimes(2)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([0, 0, 0])
    vi.clearAllMocks()

    // add fourth counter from the outside
    act(() => {
      store.setState((state) => ({
        ...state,
        counts: [...state.counts, Sweety.of(9)],
      }))
    })
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 3)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([0, 0, 0, 9])
    vi.clearAllMocks()

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
    vi.clearAllMocks()

    // add fifth counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 4)
    expect(screen.queryByText("more than ten")).toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([1, 1, 1, 10, 0])
    vi.clearAllMocks()

    // increment all counters
    fireEvent.click(screen.getByTestId("increment-all"))
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
    expect(onCounterRender).toHaveBeenCalledTimes(5)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(onCounterRender).toHaveBeenNthCalledWith(3, 2)
    expect(onCounterRender).toHaveBeenNthCalledWith(4, 3)
    expect(onCounterRender).toHaveBeenNthCalledWith(5, 4)
    expect(screen.queryByText("more than ten")).toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([2, 2, 2, 11, 1])
    vi.clearAllMocks()

    // increment fifth counter
    fireEvent.click(withinNth("counter", 4).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 4)
    expect(screen.queryByText("more than ten")).toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([2, 2, 2, 11, 2])
    vi.clearAllMocks()

    // increment fourth counter
    fireEvent.click(withinNth("counter", 3).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 3)
    expect(screen.queryByText("more than ten")).toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).not.toBeInTheDocument()
    expectCounts([2, 2, 2, 12, 2])
    vi.clearAllMocks()

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
    vi.clearAllMocks()

    // reset all counters again
    fireEvent.click(screen.getByTestId("reset-counters"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).not.toHaveBeenCalled()
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([0, 0, 0, 0, 0])
  })
})
