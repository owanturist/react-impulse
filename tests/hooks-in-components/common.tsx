import React from "react"
import { screen, within } from "@testing-library/react"

import { InnerStore, useInnerState } from "../../src"

export const withinNth = (testId: string, position: number) => {
  return within(screen.getAllByTestId(testId)[position]!)
}

export const expectCounts = (expecting: ReadonlyArray<number>): void => {
  const counters = screen.queryAllByTestId("counter")

  expect(counters).toHaveLength(expecting.length)

  for (let i = 0; i < expecting.length; i++) {
    expect(within(counters[i]!).getByTestId("count")).toHaveTextContent(
      expecting[i]!.toString(),
    )
  }
}

export const CounterComponent: React.VFC<{
  count: InnerStore<number>
  onRender: VoidFunction
}> = React.memo(
  ({ count: countStore, onRender }) => {
    const [count, setCount] = useInnerState(countStore)

    onRender()

    return (
      <div data-testid="counter">
        <span data-testid="count">{count}</span>
        <button
          type="button"
          data-testid="increment"
          onClick={() => setCount(count + 1)}
        />
      </div>
    )
  },
  // onRender is ignored
  (prevProps, nextProps) => prevProps.count === nextProps.count,
)
