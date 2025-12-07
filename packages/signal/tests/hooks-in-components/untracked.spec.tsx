import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { Impulse, type ReadableImpulse, untracked } from "../../src"

it("returns the `factory` function result without tracking impulses", () => {
  const onRender = vi.fn()
  const first = Impulse({ count: 1 })
  const second = Impulse({ count: 2 })

  const Component: React.FC<{
    multiplier: number
  }> = ({ multiplier }) => {
    const { count: firstCount } = untracked((scope) => first.getValue(scope))
    const { count: secondCount } = untracked(second)
    const [, rerender] = React.useState(0)

    return (
      <button type="button" onClick={() => rerender((x) => x + 1)}>
        {multiplier * (firstCount + secondCount)}
      </button>
    )
  }

  const { rerender } = render(<Component multiplier={1} />, {
    wrapper: (props) => <React.Profiler id="test" onRender={onRender} {...props} />,
  })

  expect(screen.getByRole("button")).toHaveTextContent("3")
  expect(onRender).toHaveBeenCalledTimes(1)
  vi.clearAllMocks()

  first.setValue({ count: 2 })
  second.setValue({ count: 3 })
  expect(screen.getByRole("button")).toHaveTextContent("3")
  expect(onRender).toHaveBeenCalledTimes(0)
  vi.clearAllMocks()

  rerender(<Component multiplier={2} />)
  expect(screen.getByRole("button")).toHaveTextContent("10")
  expect(onRender).toHaveBeenCalledTimes(1)
  vi.clearAllMocks()

  first.setValue({ count: 3 })
  second.setValue({ count: 4 })
  expect(screen.getByRole("button")).toHaveTextContent("10")
  expect(onRender).toHaveBeenCalledTimes(0)
  vi.clearAllMocks()

  fireEvent.click(screen.getByRole("button"))
  expect(screen.getByRole("button")).toHaveTextContent("14")
  expect(onRender).toHaveBeenCalledTimes(1)
})

it("allows to use Impulse", () => {
  const impulse = Impulse(1)

  const value = untracked(impulse)

  expect(value).toBe(1)
})

it("allows to use ReadonlyImpulse", () => {
  const impulse = Impulse(() => 1)

  const value = untracked(impulse)

  expect(value).toBe(1)
})

it("allows to use ReadableImpulse", () => {
  class Custom implements ReadableImpulse<number> {
    public constructor(public value: number) {}

    public getValue(): number {
      return this.value
    }
  }

  const impulse = new Custom(1)

  expect(untracked(impulse)).toBe(1)
  impulse.value = 2
  expect(untracked(impulse)).toBe(2)
})
