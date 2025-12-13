import { screen, within } from "@testing-library/react"
import React from "react"

import { type Signal, useComputed } from "../../src"

function withinNth(testId: string, position: number) {
  return within(screen.getAllByTestId(testId)[position]!)
}

function expectCounts(expecting: ReadonlyArray<number>): void {
  const counters = screen.queryAllByTestId("counter")

  expect(counters).toHaveLength(expecting.length)

  for (let i = 0; i < expecting.length; i++) {
    expect(within(counters[i]!).getByTestId("count")).toHaveTextContent(expecting[i]!.toString())
  }
}

const CounterComponent = React.memo<{
  count: Signal<number>
  onRender: VoidFunction
}>(
  ({ count: countSignal, onRender }) => {
    const count = useComputed((monitor) => countSignal.read(monitor))

    return (
      <React.Profiler id="test" onRender={onRender}>
        <div data-testid="counter">
          <span data-testid="count">{count}</span>
          <button
            type="button"
            data-testid="increment"
            onClick={() => countSignal.write(count + 1)}
          />
        </div>
      </React.Profiler>
    )
  },
  (prevProps, nextProps) => prevProps.count === nextProps.count,
)

export { withinNth, expectCounts, CounterComponent }
