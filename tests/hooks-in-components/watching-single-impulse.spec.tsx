import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { Impulse, useWatchImpulse, watch } from "../../src"

import { CounterComponent } from "./common"

describe("watching single impulse", () => {
  interface AppProps {
    count: Impulse<number>
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

  const watcherLeft = (count: Impulse<number>) => {
    const x = count.getValue()

    return x > 1
  }
  const watcherRight = (count: Impulse<number>) => {
    const x = count.getValue()

    return x < 4
  }

  const compare = (
    [left1, right1]: [boolean, boolean],
    [left2, right2]: [boolean, boolean],
  ) => {
    return left1 === left2 && right1 === right2
  }

  const SingleWatcherApp: React.FC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useWatchImpulse(
      () => [watcherLeft(props.count), watcherRight(props.count)],
      [props.count],
      {
        compare: (left, right) => compare(left, right),
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

  const SingleMemoizedWatcherApp: React.FC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useWatchImpulse<[boolean, boolean]>(
      () => [watcherLeft(props.count), watcherRight(props.count)],
      [props.count],
      { compare },
    )

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  }

  const MultipleWatchersApp: React.FC<AppProps> = (props) => {
    const moreThanOne = useWatchImpulse(() => watcherLeft(props.count))
    const lessThanFour = useWatchImpulse(() => watcherRight(props.count))

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  }

  const MultipleWatchersWithDepsApp: React.FC<AppProps> = (props) => {
    const moreThanOne = useWatchImpulse(
      () => watcherLeft(props.count),
      [props.count],
    )
    const lessThanFour = useWatchImpulse(
      () => watcherRight(props.count),
      [props.count],
    )

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  }

  const WatchedApp: React.FC<AppProps> = watch((props) => {
    const moreThanOne = watcherLeft(props.count)
    const lessThanFour = watcherRight(props.count)

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  })

  it.each([
    ["single watcher", SingleWatcherApp, 0],
    ["single memoized watcher", SingleMemoizedWatcherApp, 0],
    ["multiple watchers", MultipleWatchersApp, 0],
    ["multiple memoized watchers", MultipleWatchersWithDepsApp, 0],
    ["watch()", WatchedApp, 1],
  ])("handles single Impulse with %s", (_, App, unnecessaryRerendersCount) => {
    const count = Impulse.of(0)
    const onCounterRender = vi.fn()
    const onRender = vi.fn()

    render(
      <App
        count={count}
        onCounterRender={onCounterRender}
        onRender={onRender}
      />,
    )

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
      count.setValue((x) => x + 1)
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

describe("when drilling an Impulse", () => {
  it("should not re-render of the host component when an Impulse value changes", () => {
    const Host: React.FC<{
      count: Impulse<number>
      onRender: VoidFunction
      onCounterRender: VoidFunction
    }> = ({ count, onRender, onCounterRender }) => (
      <>
        <React.Profiler id="host" onRender={onRender} />
        <CounterComponent count={count} onRender={onCounterRender} />
      </>
    )

    const count = Impulse.of(5)
    const onRender = vi.fn()
    const onCounterRender = vi.fn()

    render(
      <Host
        count={count}
        onRender={onRender}
        onCounterRender={onCounterRender}
      />,
    )

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
      count.setValue((x) => x * 2)
    })
    expect(screen.getByTestId("count")).toHaveTextContent("12")
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledOnce()
  })
})
