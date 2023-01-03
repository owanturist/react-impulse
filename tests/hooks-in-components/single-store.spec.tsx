import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { Impulse, useSweetyState } from "../../src"
import { Counter } from "../common"

import { withinNth } from "./common"

describe("single store", () => {
  const GetterComponent: React.FC<{
    store: Impulse<Counter>
    onRender: VoidFunction
  }> = ({ store, onRender }) => {
    const state = useSweetyState(store)

    return (
      <React.Profiler id="test" onRender={onRender}>
        <span data-testid="getter">{state.count}</span>
      </React.Profiler>
    )
  }

  const SetterComponent: React.FC<{
    store: Impulse<Counter>
    onRender: VoidFunction
  }> = ({ store, onRender }) => (
    <React.Profiler id="test" onRender={onRender}>
      <div data-testid="setter">
        <button
          type="button"
          data-testid="increment"
          onClick={() => store.setState(Counter.inc)}
        />
        <button
          type="button"
          data-testid="reset"
          onClick={() => store.setState({ count: 0 }, Counter.compare)}
        />
      </div>
    </React.Profiler>
  )

  const SingleSetterSingleGetter: React.FC<{
    store: Impulse<Counter>
    onRootRender: VoidFunction
    onGetterRender: VoidFunction
    onSetterRender: VoidFunction
  }> = ({ store, onRootRender, onGetterRender, onSetterRender }) => (
    <>
      <React.Profiler id="test" onRender={onRootRender} />

      <GetterComponent store={store} onRender={onGetterRender} />
      <SetterComponent store={store} onRender={onSetterRender} />
    </>
  )

  it("Single Setter / Getter", () => {
    const store = Impulse.of({ count: 0 })
    const onRootRender = vi.fn()
    const onGetterRender = vi.fn()
    const onSetterRender = vi.fn()

    render(
      <SingleSetterSingleGetter
        store={store}
        onRootRender={onRootRender}
        onGetterRender={onGetterRender}
        onSetterRender={onSetterRender}
      />,
    )

    // check initial state
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId("getter")).toHaveTextContent("0")

    // increment by from the component
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId("getter")).toHaveTextContent("1")

    // increment from the outside
    act(() => store.setState(Counter.inc))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(3)
    expect(screen.getByTestId("getter")).toHaveTextContent("2")

    // reset from the component
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(4)
    expect(screen.getByTestId("getter")).toHaveTextContent("0")

    // reset second time in a row
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(4)
    expect(screen.getByTestId("getter")).toHaveTextContent("0")

    // increment twice in a row
    fireEvent.click(screen.getByTestId("increment"))
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(6)
    expect(screen.getByTestId("getter")).toHaveTextContent("2")

    // increment twice in a row from the outside
    act(() => {
      store.setState(Counter.inc)
      store.setState(Counter.inc)
    })
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(7)
    expect(screen.getByTestId("getter")).toHaveTextContent("4")
  })

  const MultipleSetterMultipleGetter: React.FC<{
    store: Impulse<Counter>
    onRootRender: VoidFunction
    onFirstGetterRender: VoidFunction
    onSecondGetterRender: VoidFunction
    onFirstSetterRender: VoidFunction
    onSecondSetterRender: VoidFunction
  }> = ({
    store,
    onRootRender,
    onFirstGetterRender,
    onSecondGetterRender,
    onFirstSetterRender,
    onSecondSetterRender,
  }) => (
    <>
      <React.Profiler id="test" onRender={onRootRender} />
      <GetterComponent store={store} onRender={onFirstGetterRender} />
      <GetterComponent store={store} onRender={onSecondGetterRender} />
      <SetterComponent store={store} onRender={onFirstSetterRender} />
      <SetterComponent store={store} onRender={onSecondSetterRender} />
    </>
  )

  it("Multiple Setters / Getters", () => {
    const store = Impulse.of({ count: 0 })
    const onRootRender = vi.fn()
    const onFirstGetterRender = vi.fn()
    const onSecondGetterRender = vi.fn()
    const onFirstSetterRender = vi.fn()
    const onSecondSetterRender = vi.fn()

    render(
      <MultipleSetterMultipleGetter
        store={store}
        onRootRender={onRootRender}
        onFirstGetterRender={onFirstGetterRender}
        onSecondGetterRender={onSecondGetterRender}
        onFirstSetterRender={onFirstSetterRender}
        onSecondSetterRender={onSecondSetterRender}
      />,
    )

    // check initial state
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(1)
    expect(screen.getAllByTestId("getter")).toMatchSnapshot()

    // increment from the first component
    fireEvent.click(withinNth("setter", 0).getByTestId("increment"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(2)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(2)
    expect(screen.getAllByTestId("getter")).toMatchSnapshot()

    // increment from the second component
    fireEvent.click(withinNth("setter", 1).getByTestId("increment"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(3)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(3)
    expect(screen.getAllByTestId("getter")).toMatchSnapshot()

    // increment from the outside
    act(() => store.setState(Counter.inc))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onFirstSetterRender).toHaveBeenCalledTimes(1)
    expect(onSecondSetterRender).toHaveBeenCalledTimes(1)
    expect(onFirstGetterRender).toHaveBeenCalledTimes(4)
    expect(onSecondGetterRender).toHaveBeenCalledTimes(4)
    expect(screen.getAllByTestId("getter")).toMatchSnapshot()
  })
})
