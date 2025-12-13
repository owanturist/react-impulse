import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { type Monitor, Signal, useComputed, useMonitor } from "../../src"

import { CounterComponent } from "./common"

describe("monitoring single Signal", () => {
  interface AppProps {
    count: Signal<number>
    onRender: VoidFunction
    onCounterRender: VoidFunction
  }

  const GenericApp: React.FC<
    {
      moreThanOne: boolean
      lessThanFour: boolean
    } & AppProps
  > = ({ moreThanOne, lessThanFour, count, onRender, onCounterRender }) => (
    <>
      <React.Profiler id="test" onRender={onRender}>
        {moreThanOne && <span>more than one</span>}
        {lessThanFour && <span>less than four</span>}
      </React.Profiler>

      <CounterComponent count={count} onRender={onCounterRender} />
    </>
  )

  const factoryLeft = (monitor: Monitor, count: Signal<number>) => {
    const x = count.read(monitor)

    return x > 1
  }
  const factoryRight = (monitor: Monitor, count: Signal<number>) => {
    const x = count.read(monitor)

    return x < 4
  }

  const equals = ([left1, right1]: [boolean, boolean], [left2, right2]: [boolean, boolean]) =>
    left1 === left2 && right1 === right2

  const SingleComputedApp: React.FC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useComputed(
      (monitor) => [factoryLeft(monitor, props.count), factoryRight(monitor, props.count)],
      [props.count],
      {
        equals: (left, right) => equals(left, right),
      },
    )

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const SingleMemoizedComputedApp: React.FC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useComputed<[boolean, boolean]>(
      (monitor) => [factoryLeft(monitor, props.count), factoryRight(monitor, props.count)],
      [props.count],
      { equals },
    )

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const MultipleComputedApp: React.FC<AppProps> = (props) => {
    const moreThanOne = useComputed((monitor) => factoryLeft(monitor, props.count))
    const lessThanFour = useComputed((monitor) => factoryRight(monitor, props.count))

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const MultipleMemoizedComputedApp: React.FC<AppProps> = (props) => {
    const moreThanOne = useComputed((monitor) => factoryLeft(monitor, props.count), [props.count])
    const lessThanFour = useComputed((monitor) => factoryRight(monitor, props.count), [props.count])

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const MonitoredApp: React.FC<AppProps> = (props) => {
    const monitor = useMonitor()
    const moreThanOne = factoryLeft(monitor, props.count)
    const lessThanFour = factoryRight(monitor, props.count)

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  it.each([
    ["single compute", SingleComputedApp, 0],
    ["single memoized compute", SingleMemoizedComputedApp, 0],
    ["multiple computes", MultipleComputedApp, 0],
    ["multiple memoized computes", MultipleMemoizedComputedApp, 0],
    ["monitor", MonitoredApp, 1],
  ])("handles single Signal with %s", (_, App, unnecessaryRerendersCount) => {
    const count = Signal(0)
    const onCounterRender = vi.fn()
    const onRender = vi.fn()

    render(<App count={count} onCounterRender={onCounterRender} onRender={onRender} />)

    // initial render
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(screen.queryByText("more than one")).not.toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("0")
    vi.clearAllMocks()

    // increment
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(screen.queryByText("more than one")).not.toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("1")
    vi.clearAllMocks()

    // increment again
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("2")
    vi.clearAllMocks()

    // increment from the outside
    act(() => {
      count.write((x) => x + 1)
    })
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount) // does not re-render
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("3")
    vi.clearAllMocks()

    // increment again
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).not.toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("4")
  })
})

describe("when drilling an Signal", () => {
  it("should not re-render of the host component when an Signal value changes", () => {
    const Host: React.FC<{
      count: Signal<number>
      onRender: VoidFunction
      onCounterRender: VoidFunction
    }> = ({ count, onRender, onCounterRender }) => (
      <>
        <React.Profiler id="test" onRender={onRender} />
        <CounterComponent count={count} onRender={onCounterRender} />
      </>
    )

    const count = Signal(5)
    const onRender = vi.fn()
    const onCounterRender = vi.fn()

    render(<Host count={count} onRender={onRender} onCounterRender={onCounterRender} />)

    expect(screen.getByTestId("count")).toHaveTextContent("5")
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    fireEvent.click(screen.getByTestId("increment"))
    expect(screen.getByTestId("count")).toHaveTextContent("6")
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      count.write((x) => x * 2)
    })
    expect(screen.getByTestId("count")).toHaveTextContent("12")
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledOnce()
  })
})
