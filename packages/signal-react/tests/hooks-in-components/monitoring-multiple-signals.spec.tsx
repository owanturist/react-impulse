import { type Monitor, Signal } from "@owanturist/signal"
import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { useComputed, useMonitor } from "../../src"

import { CounterComponent, withinNth } from "./common"

describe("monitoring multiple signals", () => {
  interface AppProps {
    firstCount: Signal<number>
    secondCount: Signal<number>
    onRender: VoidFunction
    onFirstCounterRender: VoidFunction
    onSecondCounterRender: VoidFunction
  }

  const GenericApp: React.FC<
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
  }) => (
    <>
      <React.Profiler id="test" onRender={onRender}>
        {moreThanOne && <span>more than two</span>}
        {lessThanFour && <span>less than seven</span>}

        <button
          type="button"
          data-testid="increment-both"
          onClick={() => {
            firstCount.write((x) => x + 1)
            secondCount.write((x) => x + 1)
          }}
        />
      </React.Profiler>

      <CounterComponent count={firstCount} onRender={onFirstCounterRender} />
      <CounterComponent count={secondCount} onRender={onSecondCounterRender} />
    </>
  )

  const factoryLeft = (
    monitor: Monitor,
    firstCount: Signal<number>,
    secondCount: Signal<number>,
  ) => {
    const sum = firstCount.read(monitor) + secondCount.read(monitor)

    return sum > 2
  }
  const factoryRight = (
    monitor: Monitor,
    firstCount: Signal<number>,
    secondCount: Signal<number>,
  ) => {
    const sum = firstCount.read(monitor) + secondCount.read(monitor)

    return sum < 7
  }

  const equals = ([left1, right1]: [boolean, boolean], [left2, right2]: [boolean, boolean]) =>
    left1 === left2 && right1 === right2

  const SingleComputedApp: React.FC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useComputed(
      (monitor) => [
        factoryLeft(monitor, props.firstCount, props.secondCount),
        factoryRight(monitor, props.firstCount, props.secondCount),
      ],
      [props.firstCount, props.secondCount],
      {
        equals: (left, right) => equals(left, right),
      },
    )

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const SingleMemoizedComputedApp: React.FC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useComputed<[boolean, boolean]>(
      (monitor) => [
        factoryLeft(monitor, props.firstCount, props.secondCount),
        factoryRight(monitor, props.firstCount, props.secondCount),
      ],
      [props.firstCount, props.secondCount],
      { equals },
    )

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const MultipleComputedApp: React.FC<AppProps> = (props) => {
    const moreThanOne = useComputed((monitor) =>
      factoryLeft(monitor, props.firstCount, props.secondCount),
    )
    const lessThanFour = useComputed((monitor) =>
      factoryRight(monitor, props.firstCount, props.secondCount),
    )

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const MultipleMemoizedComputedApp: React.FC<AppProps> = (props) => {
    const moreThanOne = useComputed(
      (monitor) => factoryLeft(monitor, props.firstCount, props.secondCount),
      [props.firstCount, props.secondCount],
    )
    const lessThanFour = useComputed(
      (monitor) => factoryRight(monitor, props.firstCount, props.secondCount),
      [props.firstCount, props.secondCount],
    )

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const MonitorApp: React.FC<AppProps> = (props) => {
    const monitor = useMonitor()
    const moreThanOne = factoryLeft(monitor, props.firstCount, props.secondCount)
    const lessThanFour = factoryRight(monitor, props.firstCount, props.secondCount)

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  it.each([
    ["single compute", SingleComputedApp, 0],
    ["single memoized compute", SingleMemoizedComputedApp, 0],
    ["multiple computes", MultipleComputedApp, 0],
    ["multiple memoized computes", MultipleMemoizedComputedApp, 0],
    ["monitor", MonitorApp, 1],
  ])("handles multiple Signals with %s", (_, App, unnecessaryRerendersCount) => {
    const firstCount = Signal(0)
    const secondCount = Signal(0)
    const onFirstCountRender = vi.fn()
    const onSecondCountRender = vi.fn()
    const onRender = vi.fn()

    render(
      <App
        firstCount={firstCount}
        secondCount={secondCount}
        onFirstCounterRender={onFirstCountRender}
        onSecondCounterRender={onSecondCountRender}
        onRender={onRender}
      />,
    )

    // initial render
    expect(onRender).toHaveBeenCalledOnce()
    expect(onFirstCountRender).toHaveBeenCalledOnce()
    expect(onSecondCountRender).toHaveBeenCalledOnce()
    expect(screen.queryByText("more than two")).not.toBeInTheDocument()
    expect(screen.queryByText("less than seven")).toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("0")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("0")
    vi.clearAllMocks()

    // increment first count
    fireEvent.click(withinNth("counter", 0).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
    expect(onFirstCountRender).toHaveBeenCalledOnce()
    expect(onSecondCountRender).not.toHaveBeenCalled()
    expect(screen.queryByText("more than two")).not.toBeInTheDocument()
    expect(screen.queryByText("less than seven")).toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("1")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("0")
    vi.clearAllMocks()

    // increment second count
    fireEvent.click(withinNth("counter", 1).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
    expect(onFirstCountRender).not.toHaveBeenCalled()
    expect(onSecondCountRender).toHaveBeenCalledOnce()
    expect(screen.queryByText("more than two")).not.toBeInTheDocument()
    expect(screen.queryByText("less than seven")).toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("1")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("1")
    vi.clearAllMocks()

    // increment both
    fireEvent.click(screen.getByTestId("increment-both"))
    expect(onRender).toHaveBeenCalledOnce()
    expect(onFirstCountRender).toHaveBeenCalledOnce()
    expect(onSecondCountRender).toHaveBeenCalledOnce()
    expect(screen.queryByText("more than two")).toBeInTheDocument()
    expect(screen.queryByText("less than seven")).toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("2")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("2")
    vi.clearAllMocks()

    // increment both again
    fireEvent.click(screen.getByTestId("increment-both"))
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
    expect(onFirstCountRender).toHaveBeenCalledOnce()
    expect(onSecondCountRender).toHaveBeenCalledOnce()
    expect(screen.queryByText("more than two")).toBeInTheDocument()
    expect(screen.queryByText("less than seven")).toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("3")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("3")
    vi.clearAllMocks()

    // increment first
    fireEvent.click(withinNth("counter", 0).getByTestId("increment"))
    expect(onRender).toHaveBeenCalledOnce()
    expect(onFirstCountRender).toHaveBeenCalledOnce()
    expect(onSecondCountRender).not.toHaveBeenCalled()
    expect(screen.queryByText("more than two")).toBeInTheDocument()
    expect(screen.queryByText("less than seven")).not.toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("4")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("3")
    vi.clearAllMocks()

    // increment both from the outside
    act(() => {
      firstCount.write((x) => x + 1)
      secondCount.write((x) => x + 1)
    })
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
    expect(onFirstCountRender).toHaveBeenCalledOnce()
    expect(onSecondCountRender).toHaveBeenCalledOnce()
    expect(screen.queryByText("more than two")).toBeInTheDocument()
    expect(screen.queryByText("less than seven")).not.toBeInTheDocument()
    expect(screen.getAllByTestId("count")[0]).toHaveTextContent("5")
    expect(screen.getAllByTestId("count")[1]).toHaveTextContent("4")
  })
})
