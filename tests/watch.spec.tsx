import { act, render, screen, fireEvent } from "@testing-library/react"
import React from "react"

import { Sweety, watch } from "../src"

const Component: React.FC<{
  count: Sweety<number>
  onRender: VoidFunction
}> = watch(({ count, onRender }) => {
  const value = React.useMemo(() => {
    return count.getState()
  }, [count])

  return (
    <React.Profiler id="test" onRender={onRender}>
      <button
        type="button"
        data-testid="increment"
        onClick={() => count.setState((x) => x + 1)}
      />
      <span data-testid="count">{value}</span>
    </React.Profiler>
  )
})
it("should watch after Sweety used in useMemo", () => {
  const count = Sweety.of(1)
  const onRender = vi.fn()

  render(<Component count={count} onRender={onRender} />)

  const countNode = screen.getByTestId("count")
  expect(countNode).toHaveTextContent("1")
  expect(onRender).toHaveBeenCalledTimes(1)

  act(() => {
    count.setState(2)
  })
  expect(countNode).toHaveTextContent("2")

  fireEvent.click(screen.getByTestId("increment"))
  expect(countNode).toHaveTextContent("3")
})
