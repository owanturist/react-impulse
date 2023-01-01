import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { Sweety, watch } from "../../src"

import { CounterComponent, expectCounts, withinNth } from "./common"

describe("nested stores", () => {
  interface AppState {
    counts: ReadonlyArray<Sweety<number>>
  }

  const App: React.FC<{
    store: Sweety<AppState>
    onRender: VoidFunction
    onCounterRender: React.Dispatch<number>
  }> = watch(({ store, onRender, onCounterRender }) => (
    <>
      <React.Profiler id="test" onRender={onRender}>
        <button
          type="button"
          data-testid="add-counter"
          onClick={() => {
            store.setState((state) => ({
              ...state,
              counts: [...state.counts, Sweety.of(0)],
            }))
          }}
        />
        <button
          type="button"
          data-testid="reset-counters"
          onClick={() => {
            store.setState((state) => {
              state.counts.forEach((count) => count.setState(0))

              return state
            })
          }}
        />
      </React.Profiler>

      {store.getState().counts.map((count, index) => (
        <CounterComponent
          key={count.key}
          count={count}
          onRender={() => onCounterRender(index)}
        />
      ))}
    </>
  ))

  it("Performs nested store management", () => {
    const store = Sweety.of<AppState>({ counts: [] })
    const onRender = vi.fn()
    const onCounterRender = vi.fn()

    render(
      <App
        store={store}
        onRender={onRender}
        onCounterRender={onCounterRender}
      />,
    )

    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(0)
    expectCounts([])
    vi.clearAllMocks()

    // add first counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expectCounts([0])
    vi.clearAllMocks()

    // increment the first counter
    fireEvent.click(withinNth("counter", 0).getByTestId("increment"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expectCounts([1])
    vi.clearAllMocks()

    // add second counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 1)
    expectCounts([1, 0])
    vi.clearAllMocks()

    // double increment second counter
    fireEvent.click(withinNth("counter", 1).getByTestId("increment"))
    fireEvent.click(withinNth("counter", 1).getByTestId("increment"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(2)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 1)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expectCounts([1, 2])
    vi.clearAllMocks()

    // add third counter from the outside
    act(() => {
      store.setState((state) => ({
        ...state,
        counts: [...state.counts, Sweety.of(3)],
      }))
    })
    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 2)
    expectCounts([1, 2, 3])
    vi.clearAllMocks()

    // double the third counter from the outside
    act(() => {
      store.getState().counts[2]!.setState((x) => 2 * x)
    })
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(1)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 2)
    expectCounts([1, 2, 6])
    vi.clearAllMocks()

    // reset
    fireEvent.click(screen.getByTestId("reset-counters"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(3)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(onCounterRender).toHaveBeenNthCalledWith(3, 2)
    expectCounts([0, 0, 0])
    vi.clearAllMocks()

    // increment all from the outside
    act(() => {
      store.getState().counts.forEach((count) => count.setState((x) => x + 1))
    })
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(3)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(onCounterRender).toHaveBeenNthCalledWith(3, 2)
    expectCounts([1, 1, 1])
  })
})
