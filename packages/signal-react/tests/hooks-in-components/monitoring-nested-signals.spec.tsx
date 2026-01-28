import { type Monitor, Signal } from "@owanturist/signal"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { type Dispatch, type FC, Profiler } from "react"

import { useComputed, useMonitor } from "../../src"

import { CounterComponent, expectCounts, withinNth } from "./common"

describe("monitoring nested Signals", () => {
  abstract class AppState {
    public abstract counts: ReadonlyArray<Signal<number>>

    public static sum(monitor: Monitor, { counts }: AppState): number {
      return counts.reduce((acc, count) => acc + count.read(monitor), 0)
    }
  }

  interface AppProps {
    state: Signal<AppState>
    onRender: VoidFunction
    onCounterRender: Dispatch<number>
  }

  const GenericApp: FC<
    {
      moreThanTen: boolean
      lessThanTwenty: boolean
    } & AppProps
  > = ({ moreThanTen, lessThanTwenty, state: appState, onRender, onCounterRender }) => {
    const state = useComputed(appState)

    return (
      <>
        <Profiler id="test" onRender={onRender}>
          {moreThanTen && <span>more than ten</span>}
          {lessThanTwenty && <span>less than twenty</span>}

          <button
            type="button"
            data-testid="add-counter"
            onClick={() => {
              appState.write({
                ...state,
                counts: [...state.counts, Signal(0)],
              })
            }}
          />

          <button
            type="button"
            data-testid="reset-counters"
            onClick={() => {
              for (const count of state.counts) {
                count.write(0)
              }
            }}
          />

          <button
            type="button"
            data-testid="increment-all"
            onClick={() => {
              appState.write((current) => {
                for (const count of current.counts) {
                  count.write((x) => x + 1)
                }

                return current
              })
            }}
          />
        </Profiler>

        {state.counts.map((count, index) => (
          <CounterComponent key={index} count={count} onRender={() => onCounterRender(index)} />
        ))}
      </>
    )
  }

  const factoryLeft = (monitor: Monitor, state: Signal<AppState>) => {
    const total = AppState.sum(monitor, state.read(monitor))

    return total > 10
  }
  const factoryRight = (monitor: Monitor, state: Signal<AppState>) => {
    const total = AppState.sum(monitor, state.read(monitor))

    return total < 20
  }

  const equals = ([left1, right1]: [boolean, boolean], [left2, right2]: [boolean, boolean]) =>
    left1 === left2 && right1 === right2

  const SingleComputedApp: FC<AppProps> = (props) => {
    const [moreThanTen, lessThanTwenty] = useComputed(
      (monitor) => [factoryLeft(monitor, props.state), factoryRight(monitor, props.state)],
      [props.state],
      {
        equals: (left, right) => equals(left, right),
      },
    )

    return <GenericApp moreThanTen={moreThanTen} lessThanTwenty={lessThanTwenty} {...props} />
  }

  const SingleMemoizedComputedApp: FC<AppProps> = (props) => {
    const [moreThanTen, lessThanTwenty] = useComputed<[boolean, boolean]>(
      (monitor) => [factoryLeft(monitor, props.state), factoryRight(monitor, props.state)],
      [props.state],
      { equals },
    )

    return <GenericApp moreThanTen={moreThanTen} lessThanTwenty={lessThanTwenty} {...props} />
  }

  const MultipleComputedApp: FC<AppProps> = (props) => {
    const moreThanTen = useComputed((monitor) => factoryLeft(monitor, props.state))
    const lessThanTwenty = useComputed((monitor) => factoryRight(monitor, props.state))

    return <GenericApp moreThanTen={moreThanTen} lessThanTwenty={lessThanTwenty} {...props} />
  }

  const MultipleMemoizedComputedApp: FC<AppProps> = (props) => {
    const moreThanTen = useComputed((monitor) => factoryLeft(monitor, props.state), [props.state])
    const lessThanTwenty = useComputed(
      (monitor) => factoryRight(monitor, props.state),
      [props.state],
    )

    return <GenericApp moreThanTen={moreThanTen} lessThanTwenty={lessThanTwenty} {...props} />
  }

  const MonitorApp: FC<AppProps> = (props) => {
    const monitor = useMonitor()
    const moreThanTen = factoryLeft(monitor, props.state)
    const lessThanTwenty = factoryRight(monitor, props.state)

    return <GenericApp moreThanTen={moreThanTen} lessThanTwenty={lessThanTwenty} {...props} />
  }

  it.each([
    ["single compute", SingleComputedApp, 0],
    ["single memoized compute", SingleMemoizedComputedApp, 0],
    ["multiple computes", MultipleComputedApp, 0],
    ["multiple memoized computes", MultipleMemoizedComputedApp, 0],
    ["monitor", MonitorApp, 1],
  ])("handles nested Signals with %s", (_, App, unnecessaryRerendersCount) => {
    const state = Signal<AppState>({
      counts: [],
    })
    const onRender = vi.fn()
    const onCounterRender = vi.fn()

    render(<App state={state} onRender={onRender} onCounterRender={onCounterRender} />)

    // initial render
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
      state.write((current) => ({
        ...current,
        counts: [...current.counts, Signal(9)],
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
