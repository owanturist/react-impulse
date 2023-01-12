import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { Impulse, useImpulseValue } from "../../src"
import { Counter } from "../common"

import { withinNth } from "./common"

describe("single impulse", () => {
  const GetterComponent: React.FC<{
    counter: Impulse<Counter>
    onRender: VoidFunction
  }> = ({ counter, onRender }) => {
    const { count } = useImpulseValue(counter)

    return (
      <React.Profiler id="test" onRender={onRender}>
        <span data-testid="getter">{count}</span>
      </React.Profiler>
    )
  }

  const SetterComponent: React.FC<{
    counter: Impulse<Counter>
    onRender: VoidFunction
  }> = ({ counter, onRender }) => (
    <React.Profiler id="test" onRender={onRender}>
      <div data-testid="setter">
        <button
          type="button"
          data-testid="increment"
          onClick={() => counter.setValue(Counter.inc)}
        />
        <button
          type="button"
          data-testid="reset"
          onClick={() => counter.setValue({ count: 0 }, Counter.compare)}
        />
      </div>
    </React.Profiler>
  )

  const SingleSetterSingleGetter: React.FC<{
    counter: Impulse<Counter>
    onRootRender: VoidFunction
    onGetterRender: VoidFunction
    onSetterRender: VoidFunction
  }> = ({ counter, onRootRender, onGetterRender, onSetterRender }) => (
    <>
      <React.Profiler id="test" onRender={onRootRender} />

      <GetterComponent counter={counter} onRender={onGetterRender} />
      <SetterComponent counter={counter} onRender={onSetterRender} />
    </>
  )

  it("Single Setter / Getter", () => {
    const counter = Impulse.of({ count: 0 })
    const onRootRender = vi.fn()
    const onGetterRender = vi.fn()
    const onSetterRender = vi.fn()

    render(
      <SingleSetterSingleGetter
        counter={counter}
        onRootRender={onRootRender}
        onGetterRender={onGetterRender}
        onSetterRender={onSetterRender}
      />,
    )

    // check initial value
    expect(onRootRender).toHaveBeenCalledOnce()
    expect(onSetterRender).toHaveBeenCalledOnce()
    expect(onGetterRender).toHaveBeenCalledOnce()
    expect(screen.getByTestId("getter")).toHaveTextContent("0")
    vi.clearAllMocks()

    // increment by from the component
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRootRender).not.toHaveBeenCalled()
    expect(onSetterRender).not.toHaveBeenCalled()
    expect(onGetterRender).toHaveBeenCalledOnce()
    expect(screen.getByTestId("getter")).toHaveTextContent("1")
    vi.clearAllMocks()

    // increment from the outside
    act(() => counter.setValue(Counter.inc))
    expect(onRootRender).not.toHaveBeenCalled()
    expect(onSetterRender).not.toHaveBeenCalled()
    expect(onGetterRender).toHaveBeenCalledOnce()
    expect(screen.getByTestId("getter")).toHaveTextContent("2")
    vi.clearAllMocks()

    // reset from the component
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRootRender).not.toHaveBeenCalled()
    expect(onSetterRender).not.toHaveBeenCalled()
    expect(onGetterRender).toHaveBeenCalledOnce()
    expect(screen.getByTestId("getter")).toHaveTextContent("0")
    vi.clearAllMocks()

    // reset second time in a row
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRootRender).not.toHaveBeenCalled()
    expect(onSetterRender).not.toHaveBeenCalled()
    expect(onGetterRender).not.toHaveBeenCalled()
    expect(screen.getByTestId("getter")).toHaveTextContent("0")
    vi.clearAllMocks()

    // increment twice in a row
    fireEvent.click(screen.getByTestId("increment"))
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRootRender).not.toHaveBeenCalled()
    expect(onSetterRender).not.toHaveBeenCalled()
    expect(onGetterRender).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId("getter")).toHaveTextContent("2")
    vi.clearAllMocks()

    // increment twice in a row from the outside
    act(() => {
      counter.setValue(Counter.inc)
      counter.setValue(Counter.inc)
    })
    expect(onRootRender).not.toHaveBeenCalled()
    expect(onSetterRender).not.toHaveBeenCalled()
    expect(onGetterRender).toHaveBeenCalledOnce()
    expect(screen.getByTestId("getter")).toHaveTextContent("4")
  })

  const MultipleSetterMultipleGetter: React.FC<{
    counter: Impulse<Counter>
    onRootRender: VoidFunction
    onFirstGetterRender: VoidFunction
    onSecondGetterRender: VoidFunction
    onFirstSetterRender: VoidFunction
    onSecondSetterRender: VoidFunction
  }> = ({
    counter,
    onRootRender,
    onFirstGetterRender,
    onSecondGetterRender,
    onFirstSetterRender,
    onSecondSetterRender,
  }) => (
    <>
      <React.Profiler id="test" onRender={onRootRender} />
      <GetterComponent counter={counter} onRender={onFirstGetterRender} />
      <GetterComponent counter={counter} onRender={onSecondGetterRender} />
      <SetterComponent counter={counter} onRender={onFirstSetterRender} />
      <SetterComponent counter={counter} onRender={onSecondSetterRender} />
    </>
  )

  it("Multiple Setters / Getters", () => {
    const counter = Impulse.of({ count: 0 })
    const onRootRender = vi.fn()
    const onFirstGetterRender = vi.fn()
    const onSecondGetterRender = vi.fn()
    const onFirstSetterRender = vi.fn()
    const onSecondSetterRender = vi.fn()

    render(
      <MultipleSetterMultipleGetter
        counter={counter}
        onRootRender={onRootRender}
        onFirstGetterRender={onFirstGetterRender}
        onSecondGetterRender={onSecondGetterRender}
        onFirstSetterRender={onFirstSetterRender}
        onSecondSetterRender={onSecondSetterRender}
      />,
    )

    // check initial value
    expect(onRootRender).toHaveBeenCalledOnce()
    expect(onFirstSetterRender).toHaveBeenCalledOnce()
    expect(onSecondSetterRender).toHaveBeenCalledOnce()
    expect(onFirstGetterRender).toHaveBeenCalledOnce()
    expect(onSecondGetterRender).toHaveBeenCalledOnce()
    expect(screen.getAllByTestId("getter")).toMatchSnapshot()
    vi.clearAllMocks()

    // increment from the first component
    fireEvent.click(withinNth("setter", 0).getByTestId("increment"))
    expect(onRootRender).not.toHaveBeenCalled()
    expect(onFirstSetterRender).not.toHaveBeenCalled()
    expect(onSecondSetterRender).not.toHaveBeenCalled()
    expect(onFirstGetterRender).toHaveBeenCalledOnce()
    expect(onSecondGetterRender).toHaveBeenCalledOnce()
    expect(screen.getAllByTestId("getter")).toMatchSnapshot()
    vi.clearAllMocks()

    // increment from the second component
    fireEvent.click(withinNth("setter", 1).getByTestId("increment"))
    expect(onRootRender).not.toHaveBeenCalled()
    expect(onFirstSetterRender).not.toHaveBeenCalled()
    expect(onSecondSetterRender).not.toHaveBeenCalled()
    expect(onFirstGetterRender).toHaveBeenCalledOnce()
    expect(onSecondGetterRender).toHaveBeenCalledOnce()
    expect(screen.getAllByTestId("getter")).toMatchSnapshot()
    vi.clearAllMocks()

    // increment from the outside
    act(() => counter.setValue(Counter.inc))
    expect(onRootRender).not.toHaveBeenCalled()
    expect(onFirstSetterRender).not.toHaveBeenCalled()
    expect(onSecondSetterRender).not.toHaveBeenCalled()
    expect(onFirstGetterRender).toHaveBeenCalledOnce()
    expect(onSecondGetterRender).toHaveBeenCalledOnce()
    expect(screen.getAllByTestId("getter")).toMatchSnapshot()
  })
})
