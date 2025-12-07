import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { Impulse, type Scope, useScope, useScoped } from "../../src"

import { CounterComponent, withinNth } from "./common"

describe("scoping multiple impulses", () => {
  interface AppProps {
    firstCount: Impulse<number>
    secondCount: Impulse<number>
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
            firstCount.setValue((x) => x + 1)
            secondCount.setValue((x) => x + 1)
          }}
        />
      </React.Profiler>

      <CounterComponent count={firstCount} onRender={onFirstCounterRender} />
      <CounterComponent count={secondCount} onRender={onSecondCounterRender} />
    </>
  )

  const factoryLeft = (scope: Scope, firstCount: Impulse<number>, secondCount: Impulse<number>) => {
    const sum = firstCount.read(scope) + secondCount.read(scope)

    return sum > 2
  }
  const factoryRight = (
    scope: Scope,
    firstCount: Impulse<number>,
    secondCount: Impulse<number>,
  ) => {
    const sum = firstCount.read(scope) + secondCount.read(scope)

    return sum < 7
  }

  const equals = ([left1, right1]: [boolean, boolean], [left2, right2]: [boolean, boolean]) =>
    left1 === left2 && right1 === right2

  const SingleScopeApp: React.FC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useScoped(
      (scope) => [
        factoryLeft(scope, props.firstCount, props.secondCount),
        factoryRight(scope, props.firstCount, props.secondCount),
      ],
      [props.firstCount, props.secondCount],
      {
        equals: (left, right) => equals(left, right),
      },
    )

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const SingleMemoizedScopesApp: React.FC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useScoped<[boolean, boolean]>(
      (scope) => [
        factoryLeft(scope, props.firstCount, props.secondCount),
        factoryRight(scope, props.firstCount, props.secondCount),
      ],
      [props.firstCount, props.secondCount],
      { equals },
    )

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const MultipleScopesApp: React.FC<AppProps> = (props) => {
    const moreThanOne = useScoped((scope) =>
      factoryLeft(scope, props.firstCount, props.secondCount),
    )
    const lessThanFour = useScoped((scope) =>
      factoryRight(scope, props.firstCount, props.secondCount),
    )

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const MultipleMemoizedScopesApp: React.FC<AppProps> = (props) => {
    const moreThanOne = useScoped(
      (scope) => factoryLeft(scope, props.firstCount, props.secondCount),
      [props.firstCount, props.secondCount],
    )
    const lessThanFour = useScoped(
      (scope) => factoryRight(scope, props.firstCount, props.secondCount),
      [props.firstCount, props.secondCount],
    )

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const ScopedApp: React.FC<AppProps> = (props) => {
    const scope = useScope()
    const moreThanOne = factoryLeft(scope, props.firstCount, props.secondCount)
    const lessThanFour = factoryRight(scope, props.firstCount, props.secondCount)

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  it.each([
    ["single scope", SingleScopeApp, 0],
    ["single memoized scope", SingleMemoizedScopesApp, 0],
    ["multiple scopes", MultipleScopesApp, 0],
    ["multiple memoized scopes", MultipleMemoizedScopesApp, 0],
    ["scope()", ScopedApp, 1],
  ])("handles multiple Impulses with %s", (_, App, unnecessaryRerendersCount) => {
    const firstCount = Impulse(0)
    const secondCount = Impulse(0)
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
      firstCount.setValue((x) => x + 1)
      secondCount.setValue((x) => x + 1)
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
