import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { Impulse, type Scope, useScope, useScoped } from "../../src"

import { CounterComponent } from "./common"

describe("scoping single impulse", () => {
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

  const factoryLeft = (scope: Scope, count: Impulse<number>) => {
    const x = count.read(scope)

    return x > 1
  }
  const factoryRight = (scope: Scope, count: Impulse<number>) => {
    const x = count.read(scope)

    return x < 4
  }

  const equals = ([left1, right1]: [boolean, boolean], [left2, right2]: [boolean, boolean]) =>
    left1 === left2 && right1 === right2

  const SingleScopeApp: React.FC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useScoped(
      (scope) => [factoryLeft(scope, props.count), factoryRight(scope, props.count)],
      [props.count],
      {
        equals: (left, right) => equals(left, right),
      },
    )

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const SingleMemoizedScopeApp: React.FC<AppProps> = (props) => {
    const [moreThanOne, lessThanFour] = useScoped<[boolean, boolean]>(
      (scope) => [factoryLeft(scope, props.count), factoryRight(scope, props.count)],
      [props.count],
      { equals },
    )

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const MultipleScopesApp: React.FC<AppProps> = (props) => {
    const moreThanOne = useScoped((scope) => factoryLeft(scope, props.count))
    const lessThanFour = useScoped((scope) => factoryRight(scope, props.count))

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const MultipleMemoizedScopesApp: React.FC<AppProps> = (props) => {
    const moreThanOne = useScoped((scope) => factoryLeft(scope, props.count), [props.count])
    const lessThanFour = useScoped((scope) => factoryRight(scope, props.count), [props.count])

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  const ScopedApp: React.FC<AppProps> = (props) => {
    const scope = useScope()
    const moreThanOne = factoryLeft(scope, props.count)
    const lessThanFour = factoryRight(scope, props.count)

    return <GenericApp moreThanOne={moreThanOne} lessThanFour={lessThanFour} {...props} />
  }

  it.each([
    ["single scope", SingleScopeApp, 0],
    ["single memoized scope", SingleMemoizedScopeApp, 0],
    ["multiple scopes", MultipleScopesApp, 0],
    ["multiple memoized scopes", MultipleMemoizedScopesApp, 0],
    ["scoped()", ScopedApp, 1],
  ])("handles single Impulse with %s", (_, App, unnecessaryRerendersCount) => {
    const count = Impulse(0)
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
      count.update((x) => x + 1)
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
        <React.Profiler id="test" onRender={onRender} />
        <CounterComponent count={count} onRender={onCounterRender} />
      </>
    )

    const count = Impulse(5)
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
      count.update((x) => x * 2)
    })
    expect(screen.getByTestId("count")).toHaveTextContent("12")
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledOnce()
  })
})
