import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { Signal, useComputed } from "../../src"

import { CounterComponent, expectCounts, withinNth } from "./common"

describe("nested signals", () => {
  interface AppState {
    counts: ReadonlyArray<Signal<number>>
  }

  const App: React.FC<{
    state: Signal<AppState>
    onRender: VoidFunction
    onCounterRender: React.Dispatch<number>
  }> = ({ state, onRender, onCounterRender }) => {
    const { counts } = useComputed(state)

    return (
      <>
        <React.Profiler id="test" onRender={onRender}>
          <button
            type="button"
            data-testid="add-counter"
            onClick={() => {
              state.update((current) => ({
                ...current,
                counts: [...current.counts, Signal(0)],
              }))
            }}
          />
          <button
            type="button"
            data-testid="reset-counters"
            onClick={() => {
              state.update((current) => {
                for (const count of current.counts) {
                  count.update(0)
                }

                return current
              })
            }}
          />
        </React.Profiler>

        {counts.map((count, index) => (
          <CounterComponent key={index} count={count} onRender={() => onCounterRender(index)} />
        ))}
      </>
    )
  }

  it("performs nested signal management", ({ monitor }) => {
    const signal = Signal<AppState>({ counts: [] })
    const onRender = vi.fn()
    const onCounterRender = vi.fn()

    render(<App state={signal} onRender={onRender} onCounterRender={onCounterRender} />)

    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).not.toHaveBeenCalled()
    expectCounts([])
    vi.clearAllMocks()

    // add first counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expectCounts([0])
    vi.clearAllMocks()

    // increment the first counter
    fireEvent.click(withinNth("counter", 0).getByTestId("increment"))
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expectCounts([1])
    vi.clearAllMocks()

    // add second counter
    fireEvent.click(screen.getByTestId("add-counter"))
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
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
      signal.update((current) => ({
        ...current,
        counts: [...current.counts, Signal(3)],
      }))
    })
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 2)
    expectCounts([1, 2, 3])
    vi.clearAllMocks()

    // double the third counter from the outside
    act(() => {
      signal.read(monitor).counts[2]!.update((x) => 2 * x)
    })
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledOnce()
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
      for (const count of signal.read(monitor).counts) {
        count.update((x) => x + 1)
      }
    })
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(3)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(onCounterRender).toHaveBeenNthCalledWith(3, 2)
    expectCounts([1, 1, 1])
  })
})
