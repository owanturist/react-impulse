export { withinNth, expectCounts, CounterComponent }

import React from "react"
import { screen, within } from "@testing-library/react"

import { type Impulse, useWatchImpulse } from "../../src"

const withinNth = (testId: string, position: number) => {
  return within(screen.getAllByTestId(testId)[position]!)
}

const expectCounts = (expecting: ReadonlyArray<number>): void => {
  const counters = screen.queryAllByTestId("counter")

  expect(counters).toHaveLength(expecting.length)

  for (let i = 0; i < expecting.length; i++) {
    expect(within(counters[i]!).getByTestId("count")).toHaveTextContent(
      expecting[i]!.toString(),
    )
  }
}

const CounterComponent: React.FC<{
  count: Impulse<number>
  onRender: VoidFunction
}> = React.memo(
  ({ count: countImpulse, onRender }) => {
    const count = useWatchImpulse(() => countImpulse.getValue())

    return (
      <React.Profiler id="test" onRender={onRender}>
        <div data-testid="counter">
          <span data-testid="count">{count}</span>
          <button
            type="button"
            data-testid="increment"
            onClick={() => countImpulse.setValue(count + 1)}
          />
        </div>
      </React.Profiler>
    )
  },
  (prevProps, nextProps) => prevProps.count === nextProps.count,
)
