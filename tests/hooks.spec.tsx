import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import {
  InnerStore,
  SetInnerState,
  useGetInnerState,
  useSetInnerState,
} from "../src"

import { Counter } from "./helpers"

describe("useGetInnerState + useSetInnerState", () => {
  const GetterComponent: React.VFC<{
    name: string
    store: InnerStore<Counter>
    onRender: React.Dispatch<Counter>
  }> = ({ name, store, onRender }) => {
    const state = useGetInnerState(store)

    React.useEffect(() => {
      onRender(state)
    }, [state, onRender])

    return <div data-testid={name}>{state.count}</div>
  }

  const SetterComponent: React.VFC<{
    name: string
    store: InnerStore<Counter>
    onRender: React.Dispatch<SetInnerState<Counter>>
  }> = ({ name, store, onRender }) => {
    const setState = useSetInnerState(store, Counter.compare)

    React.useEffect(() => {
      onRender(setState)
    }, [setState, onRender])

    return (
      <div data-testid={name}>
        <button
          type="button"
          data-testid="increment"
          onClick={() => setState(Counter.inc)}
        />

        <button
          type="button"
          data-testid="reset"
          onClick={() => setState({ count: 0 })}
        />
      </div>
    )
  }

  const SingleSetterSingleGetter: React.VFC<{
    store: InnerStore<Counter>
    onRootRender: VoidFunction
    onGetterRender: React.Dispatch<Counter>
    onSetterRender: React.Dispatch<SetInnerState<Counter>>
  }> = ({ store, onRootRender, onGetterRender, onSetterRender }) => {
    React.useEffect(() => {
      onRootRender()
    }, [onRootRender])

    return (
      <div>
        <GetterComponent name="count" store={store} onRender={onGetterRender} />
        <SetterComponent
          name="controls"
          store={store}
          onRender={onSetterRender}
        />
      </div>
    )
  }

  it("Single Setter / Getter", () => {
    const store = InnerStore.of({ count: 0 })
    const onRootRender = jest.fn()
    const onGetterRender = jest.fn()
    const onSetterRender = jest.fn()

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
    expect(onGetterRender).toHaveBeenNthCalledWith(1, { count: 0 })
    expect(screen.getByTestId("count")).toHaveTextContent("0")

    // increment by from the component
    fireEvent.click(screen.getByTestId("increment"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(2)
    expect(onGetterRender).toHaveBeenNthCalledWith(2, { count: 1 })
    expect(screen.getByTestId("count")).toHaveTextContent("1")

    // increment from the outside
    act(() => store.setState(Counter.inc))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(3)
    expect(onGetterRender).toHaveBeenNthCalledWith(3, { count: 2 })
    expect(screen.getByTestId("count")).toHaveTextContent("2")

    // reset from the component
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(4)
    expect(onGetterRender).toHaveBeenNthCalledWith(4, { count: 0 })
    expect(screen.getByTestId("count")).toHaveTextContent("0")

    // reset second time in a row
    fireEvent.click(screen.getByTestId("reset"))
    expect(onRootRender).toHaveBeenCalledTimes(1)
    expect(onSetterRender).toHaveBeenCalledTimes(1)
    expect(onGetterRender).toHaveBeenCalledTimes(4)
    expect(onGetterRender).toHaveBeenNthCalledWith(4, { count: 0 })
    expect(screen.getByTestId("count")).toHaveTextContent("0")
  })

  const MultipleSetterMultipleGetter: React.VFC<{
    store: InnerStore<Counter>
    onRootRender: VoidFunction
    onFirstGetterRender: React.Dispatch<Counter>
    onSecondGetterRender: React.Dispatch<Counter>
    onFirstSetterRender: React.Dispatch<SetInnerState<Counter>>
    onSecondSetterRender: React.Dispatch<SetInnerState<Counter>>
  }> = ({
    store,
    onRootRender,
    onFirstGetterRender,
    onSecondGetterRender,
    onFirstSetterRender,
    onSecondSetterRender,
  }) => {
    React.useEffect(() => {
      onRootRender()
    }, [onRootRender])

    return (
      <div>
        <GetterComponent
          name="count-1"
          store={store}
          onRender={onFirstGetterRender}
        />
        <GetterComponent
          name="count-2"
          store={store}
          onRender={onSecondGetterRender}
        />
        <SetterComponent
          name="controls-1"
          store={store}
          onRender={onFirstSetterRender}
        />
        <SetterComponent
          name="controls-2"
          store={store}
          onRender={onSecondSetterRender}
        />
      </div>
    )
  }

  it("Multiple Setters / Getters", () => {})
})
