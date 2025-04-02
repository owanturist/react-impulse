import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"

import { Impulse, untrack, type ImpulseGetter } from "../../src"

it("returns the `factory` function result without tracking impulses", () => {
  const onRender = vi.fn()
  const first = Impulse.of({ count: 1 })
  const second = Impulse.of({ count: 2 })

  const Component: React.FC<{
    multiplier: number
  }> = ({ multiplier }) => {
    const { count: firstCount } = untrack((scope) => first.getValue(scope))
    const { count: secondCount } = untrack(second)
    const [, rerender] = React.useState(0)

    return (
      <button type="button" onClick={() => rerender((x) => x + 1)}>
        {multiplier * (firstCount + secondCount)}
      </button>
    )
  }

  const { rerender } = render(<Component multiplier={1} />, {
    wrapper: (props) => (
      <React.Profiler id="test" onRender={onRender} {...props} />
    ),
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
  const impulse = Impulse.of(1)

  const value = untrack(impulse)

  expect(value).toBe(1)
})

it("allows to use ReadonlyImpulse", () => {
  const impulse = Impulse.transmit(() => 1)

  const value = untrack(impulse)

  expect(value).toBe(1)
})

it("allows to use ImpulseGetter", () => {
  class Custom implements ImpulseGetter<number> {
    public constructor(public value: number) {}

    public getValue(): number {
      return this.value
    }
  }

  const impulse = new Custom(1)

  expect(untrack(impulse)).toBe(1)
  impulse.value = 2
  expect(untrack(impulse)).toBe(2)
})
