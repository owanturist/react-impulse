import { type ReadableSignal, Signal, untracked } from "@owanturist/signal"
import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"

it("returns the `factory` function result without tracking signals", () => {
  const onRender = vi.fn()
  const first = Signal({ count: 1 })
  const second = Signal({ count: 2 })

  const Component: React.FC<{
    multiplier: number
  }> = ({ multiplier }) => {
    const { count: firstCount } = untracked((monitor) => first.read(monitor))
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

  first.write({ count: 2 })
  second.write({ count: 3 })
  expect(screen.getByRole("button")).toHaveTextContent("3")
  expect(onRender).toHaveBeenCalledTimes(0)
  vi.clearAllMocks()

  rerender(<Component multiplier={2} />)
  expect(screen.getByRole("button")).toHaveTextContent("10")
  expect(onRender).toHaveBeenCalledTimes(1)
  vi.clearAllMocks()

  first.write({ count: 3 })
  second.write({ count: 4 })
  expect(screen.getByRole("button")).toHaveTextContent("10")
  expect(onRender).toHaveBeenCalledTimes(0)
  vi.clearAllMocks()

  fireEvent.click(screen.getByRole("button"))
  expect(screen.getByRole("button")).toHaveTextContent("14")
  expect(onRender).toHaveBeenCalledTimes(1)
})

it("allows to use Signal", () => {
  const signal = Signal(1)

  const value = untracked(signal)

  expect(value).toBe(1)
})

it("allows to use ReadonlySignal", () => {
  const signal = Signal(() => 1)

  const value = untracked(signal)

  expect(value).toBe(1)
})

it("allows to use ReadableSignal", () => {
  class Custom implements ReadableSignal<number> {
    public constructor(public value: number) {}

    public read(): number {
      return this.value
    }
  }

  const signal = new Custom(1)

  expect(untracked(signal)).toBe(1)
  signal.value = 2
  expect(untracked(signal)).toBe(2)
})
