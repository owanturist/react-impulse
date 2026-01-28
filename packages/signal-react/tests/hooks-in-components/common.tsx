import type { Signal } from "@owanturist/signal"
import { screen, within } from "@testing-library/react"
import { Profiler, memo } from "react"

import { useComputed } from "../../src"

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

const CounterComponent = memo<{
  count: Signal<number>
  onRender: VoidFunction
}>(
  ({ count: countSignal, onRender }) => {
    const count = useComputed((monitor) => countSignal.read(monitor))

    return (
      <Profiler id="test" onRender={onRender}>
        <div data-testid="counter">
          <span data-testid="count">{count}</span>
          <button
            type="button"
            data-testid="increment"
            onClick={() => countSignal.write(count + 1)}
          />
        </div>
      </Profiler>
    )
  },
  (prevProps, nextProps) => prevProps.count === nextProps.count,
)

export { withinNth, expectCounts, CounterComponent }
