import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { Impulse, useWatchImpulse, watch } from "../../src"

import { CounterComponent } from "./common"

describe("watching single store", () => {
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

  const SingleWatcherApp: React.FC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useWatchImpulse(
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

  const SingleMemoizedWatcherApp: React.FC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useWatchImpulse<[boolean, boolean]>(
      React.useCallback(() => {
        const count = props.count.getState()

        return [count > 1, count < 4]
      }, [props.count]),
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
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  }

  const MultipleWatchersApp: React.FC<AppProps> = (props) => {
    const moreThanOne = useWatchImpulse(() => props.count.getState() > 1)
    const lessThanFour = useWatchImpulse(() => props.count.getState() < 4)

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  }

  const MultipleMemoizedWatchersApp: React.FC<AppProps> = (props) => {
    const moreThanOne = useWatchImpulse(
      React.useCallback(() => props.count.getState() > 1, [props.count]),
    )
    const lessThanFour = useWatchImpulse(
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

  const WatchedApp: React.FC<AppProps> = watch((props) => {
    const count = props.count.getState()
    const [moreThanOne, lessThanFour] = [count > 1, count < 4]

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
    ["multiple memoized watchers", MultipleMemoizedWatchersApp, 0],
    ["watch()", WatchedApp, 1],
  ])("watches single store with %s", (_, App, unnecessaryRerendersCount) => {
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

    // initial render and watcher setup
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("more than one")).not.toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("0")
    vi.clearAllMocks()

    // increment
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("more than one")).not.toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("1")
    vi.clearAllMocks()

    // increment again
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("2")
    vi.clearAllMocks()

    // increment from the outside
    act(() => {
      count.setState((state) => state + 1)
    })
    expect(onRender).toHaveBeenCalledTimes(unnecessaryRerendersCount) // does not re-render
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("3")
    vi.clearAllMocks()

    // increment again
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).not.toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("4")
  })
})
