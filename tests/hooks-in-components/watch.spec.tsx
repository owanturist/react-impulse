import { render, screen, fireEvent } from "@testing-library/react-hooks"
import React from "react"

import { Sweety, watch } from "../../src"

it("should handle multi store updates without batching", () => {
  const Component: React.FC<{
    first: Sweety<number>
    second: Sweety<number>
    third: Sweety<number>
  }> = watch(({ first, second, third }) => (
    <button
      type="button"
      data-testid="btn"
      onClick={() => {
        first.setState((x) => x + 1)
        second.setState((x) => x + 1)
        third.setState((x) => x + 1)
      }}
    >
      {first.getState() * second.getState() + third.getState()}
    </button>
  ))

  const first = Sweety.of(2)
  const second = Sweety.of(3)
  const third = Sweety.of(4)
  const onRender = vi.fn()

  render(
    <React.Profiler id="test" onRender={onRender}>
      <Component first={first} second={second} third={third} />
    </React.Profiler>,
  )

  const btn = screen.getByTestId("btn")

  expect(btn).toHaveTextContent("10")
  expect(onRender).toHaveBeenCalledTimes(1)
  vi.clearAllMocks()

  fireEvent.click(btn)
  expect(btn).toHaveTextContent("17")
  expect(onRender).toHaveBeenCalledTimes(1)
})
