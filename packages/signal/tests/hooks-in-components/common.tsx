import { screen, within } from "@testing-library/react"
import React from "react"

import { type Impulse, useScoped } from "../../src"

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
  count: Impulse<number>
  onRender: VoidFunction
}>(
  ({ count: countImpulse, onRender }) => {
    const count = useScoped((scope) => countImpulse.read(scope))

    return (
      <React.Profiler id="test" onRender={onRender}>
        <div data-testid="counter">
          <span data-testid="count">{count}</span>
          <button
            type="button"
            data-testid="increment"
            onClick={() => countImpulse.update(count + 1)}
          />
        </div>
      </React.Profiler>
    )
  },
  (prevProps, nextProps) => prevProps.count === nextProps.count,
)

export { withinNth, expectCounts, CounterComponent }
