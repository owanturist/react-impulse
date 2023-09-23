import React from "react"
import { act, render, screen, fireEvent } from "@testing-library/react"

import { Impulse, useWatchImpulse } from "../../src"

import { CounterComponent, expectCounts, withinNth } from "./common"

describe("nested impulses", () => {
  interface AppState {
    counts: ReadonlyArray<Impulse<number>>
  }

  const App: React.FC<{
    state: Impulse<AppState>
    onRender: VoidFunction
    onCounterRender: React.Dispatch<number>
  }> = ({ state, onRender, onCounterRender }) => {
    const { counts } = useWatchImpulse(() => state.getValue())

    return (
      <>
        <React.Profiler id="test" onRender={onRender}>
          <button
            type="button"
            data-testid="add-counter"
            onClick={() => {
              state.setValue((current) => ({
                ...current,
                counts: [...current.counts, Impulse.of(0)],
              }))
            }}
          />
          <button
            type="button"
            data-testid="reset-counters"
            onClick={() => {
              state.setValue((current) => {
                current.counts.forEach((count) => count.setValue(0))

                return current
              })
            }}
          />
        </React.Profiler>

        {counts.map((count, index) => (
          <CounterComponent
            key={index}
            count={count}
            onRender={() => onCounterRender(index)}
          />
        ))}
      </>
    )
  }

  it("performs nested impulse management", () => {
    const impulse = Impulse.of<AppState>({ counts: [] })
    const onRender = vi.fn()
    const onCounterRender = vi.fn()

    render(
      <App
        state={impulse}
        onRender={onRender}
        onCounterRender={onCounterRender}
      />,
    )

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
      impulse.setValue((current) => ({
        ...current,
        counts: [...current.counts, Impulse.of(3)],
      }))
    })
    expect(onRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenCalledOnce()
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 2)
    expectCounts([1, 2, 3])
    vi.clearAllMocks()

    // double the third counter from the outside
    act(() => {
      impulse.getValue().counts[2]!.setValue((x) => 2 * x)
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
      impulse.getValue().counts.forEach((count) => count.setValue((x) => x + 1))
    })
    expect(onRender).not.toHaveBeenCalled()
    expect(onCounterRender).toHaveBeenCalledTimes(3)
    expect(onCounterRender).toHaveBeenNthCalledWith(1, 0)
    expect(onCounterRender).toHaveBeenNthCalledWith(2, 1)
    expect(onCounterRender).toHaveBeenNthCalledWith(3, 2)
    expectCounts([1, 1, 1])
  })
})
