import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { Sweety, useWatchSweety } from "../../src"
import { watch } from "../../src/watch"

import { CounterComponent } from "./common"

describe("watching single store", () => {
  interface AppProps {
    count: Sweety<number>
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
    const [moreThanOne, lessThanFour] = useWatchSweety(
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
    const [moreThanOne, lessThanFour] = useWatchSweety<[boolean, boolean]>(
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
    const moreThanOne = useWatchSweety(() => props.count.getState() > 1)
    const lessThanFour = useWatchSweety(() => props.count.getState() < 4)

    return (
      <GenericApp
        moreThanOne={moreThanOne}
        lessThanFour={lessThanFour}
        {...props}
      />
    )
  }

  const MultipleMemoizedWatchersApp: React.FC<AppProps> = (props) => {
    const moreThanOne = useWatchSweety(
      React.useCallback(() => props.count.getState() > 1, [props.count]),
    )
    const lessThanFour = useWatchSweety(
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
    const count = Sweety.of(0)
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

  it("should work with sweet", () => {
    const SingleWatcherHOK: React.FC<AppProps> = watch((props) => {
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

    const count = Sweety.of(0)
    const onCounterRender = vi.fn()
    const onRender = vi.fn()

    render(
      <SingleWatcherHOK
        count={count}
        onCounterRender={onCounterRender}
        onRender={onRender}
      />,
    )

    // initial render and watcher setup
    expect(screen.queryByText("more than one")).not.toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("0")

    // increment
    fireEvent.click(screen.getByTestId("increment"))
    expect(screen.queryByText("more than one")).not.toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("1")

    // increment again
    fireEvent.click(screen.getByTestId("increment"))
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("2")

    // increment from the outside
    act(() => {
      count.setState((state) => state + 1)
    })
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("3")

    // increment again
    fireEvent.click(screen.getByTestId("increment"))
    expect(screen.queryByText("more than one")).toBeInTheDocument()
    expect(screen.queryByText("less than four")).not.toBeInTheDocument()
    expect(screen.getByTestId("count")).toHaveTextContent("4")
  })
})
