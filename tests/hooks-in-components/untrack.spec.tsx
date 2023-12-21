import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"

import { Impulse, untrack } from "../../src"

it("returns the `factory` function untracked result", () => {
  const onRender = vi.fn()
  const counter = Impulse.of({ count: 0 })

  const Component: React.FC<{
    multiplier: number
  }> = ({ multiplier }) => {
    const { count } = untrack((scope) => counter.getValue(scope))
    const [, rerender] = React.useState(0)

    return (
      <button type="button" onClick={() => rerender((x) => x + 1)}>
        {multiplier * count}
      </button>
    )
  }

  const { rerender } = render(<Component multiplier={1} />, {
    wrapper: (props) => (
      <React.Profiler id="test" onRender={onRender} {...props} />
    ),
  })

  expect(screen.getByRole("button")).toHaveTextContent("0")
  expect(onRender).toHaveBeenCalledTimes(1)
  vi.clearAllMocks()

  counter.setValue({ count: 1 })
  expect(screen.getByRole("button")).toHaveTextContent("0")
  expect(onRender).toHaveBeenCalledTimes(0)
  vi.clearAllMocks()

  rerender(<Component multiplier={2} />)
  expect(screen.getByRole("button")).toHaveTextContent("2")
  expect(onRender).toHaveBeenCalledTimes(1)
  vi.clearAllMocks()

  counter.setValue({ count: 2 })
  expect(screen.getByRole("button")).toHaveTextContent("2")
  expect(onRender).toHaveBeenCalledTimes(0)
  vi.clearAllMocks()

  fireEvent.click(screen.getByRole("button"))
  expect(screen.getByRole("button")).toHaveTextContent("4")
  expect(onRender).toHaveBeenCalledTimes(1)
})
