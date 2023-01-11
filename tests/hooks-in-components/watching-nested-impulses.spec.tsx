import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { Impulse, useImpulseValue, useWatchImpulse, watch } from "../../src"

import { CounterComponent, expectCounts, withinNth } from "./common"

describe("watching nested impulses", () => {
  abstract class AppState {
    public abstract counts: ReadonlyArray<Impulse<number>>

    public static sum({ counts }: AppState): number {
      return counts.reduce((acc, count) => acc + count.getValue(), 0)
    }
  }

  interface AppProps {
    state: Impulse<AppState>
    onRender: VoidFunction
    onCounterRender: React.Dispatch<number>
  }

  const GenericApp: React.FC<
    {
      moreThanTen: boolean
      lessThanTwenty: boolean
    } & AppProps
  > = ({
    moreThanTen,
    lessThanTwenty,
    state: appState,
    onRender,
    onCounterRender,
  }) => {
    const state = useImpulseValue(appState)

    return (
      <>
        <React.Profiler id="test" onRender={onRender}>
          {moreThanTen && <span>more than ten</span>}
          {lessThanTwenty && <span>less than twenty</span>}

          <button
            type="button"
            data-testid="add-counter"
            onClick={() => {
              appState.setValue({
                ...state,
                counts: [...state.counts, Impulse.of(0)],
              })
            }}
          />

          <button
            type="button"
            data-testid="reset-counters"
            onClick={() => {
              state.counts.forEach((count) => {
                count.setValue(0)

                return count
              })
            }}
          />

          <button
            type="button"
            data-testid="increment-all"
            onClick={() => {
              appState.setValue((current) => {
                current.counts.forEach((count) => {
                  count.setValue((x) => x + 1)

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
    const [moreThanTen, lessThanTwenty] = useWatchImpulse(
      () => {
        const total = AppState.sum(props.state.getValue())

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
    const [moreThanTen, lessThanTwenty] = useWatchImpulse<[boolean, boolean]>(
      React.useCallback(() => {
        const total = AppState.sum(props.state.getValue())

        return [total > 10, total < 20]
      }, [props.state]),
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
    const moreThanTen = useWatchImpulse(() => {
      const total = props.state.getValue(AppState.sum)

      return total > 10
    })
    const lessThanTwenty = useWatchImpulse(() => {
      const total = AppState.sum(props.state.getValue())

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
    const moreThanTen = useWatchImpulse(
      React.useCallback(() => {
        const total = props.state.getValue(AppState.sum)

        return total > 10
      }, [props.state]),
    )
    const lessThanTwenty = useWatchImpulse(
      React.useCallback(() => {
        const total = AppState.sum(props.state.getValue())

        return total < 20
      }, [props.state]),
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
    const total = AppState.sum(props.state.getValue())
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
  ])("watches nested impulses with %s", (_, App, unnecessaryRerendersCount) => {
    const state = Impulse.of<AppState>({
      counts: [],
    })
    const onRender = vi.fn()
    const onCounterRender = vi.fn()

    render(
      <App
        state={state}
        onRender={onRender}
        onCounterRender={onCounterRender}
      />,
    )

    // initial render and watcher setup
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).not.toHaveBeenCalled()
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([])
    vi.clearAllMocks()

    // add first counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([0])
    vi.clearAllMocks()

    // increment first counter
    fireEvent.click(withinNth("counter", 0).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([1])
    vi.clearAllMocks()

    // add second counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
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
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
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
      state.setValue((current) => ({
        ...current,
        counts: [...current.counts, Impulse.of(9)],
      }))
    })
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 3)
    expect(screen.queryByText("more than ten")).not.toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([0, 0, 0, 9])
    vi.clearAllMocks()

    // increment all counters
    fireEvent.click(screen.getByTestId("increment-all"))
    expect(onRender).toHaveBeenCalledOnce()
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
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
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
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 4)
    expect(screen.queryByText("more than ten")).toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).toBeInTheDocument()
    expectCounts([2, 2, 2, 11, 2])
    vi.clearAllMocks()

    // increment fourth counter
    fireEvent.click(withinNth("counter", 3).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 3)
    expect(screen.queryByText("more than ten")).toBeInTheDocument()
    expect(screen.queryByText("less than twenty")).not.toBeInTheDocument()
    expectCounts([2, 2, 2, 12, 2])
    vi.clearAllMocks()

    // reset all counters
    fireEvent.click(screen.getByTestId("reset-counters"))
    expect(onRender).toHaveBeenCalledOnce()
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
