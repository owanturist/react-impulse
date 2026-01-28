import { Signal, effect } from "@owanturist/signal"
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react"
import { type Dispatch, type FC, StrictMode, useEffect, useState } from "react"

import { useComputed, useMonitor } from "../src"

describe("watching misses when defined after useEffect #140", () => {
  interface ComponentProps {
    first: Signal<number>
    second: Signal<number>
    useGetFirst(first: Signal<number>): number
    useGetSecond(second: Signal<number>): number
  }

  const ComponentComputedBeforeEffect: FC<ComponentProps> = ({
    first,
    second,
    useGetFirst,
    useGetSecond,
  }) => {
    const x = useGetFirst(first)
    const y = useGetSecond(second)

    useEffect(() => {
      second.write(x)
    }, [second, x])

    return (
      <button type="button" onClick={() => first.write(x + 1)}>
        {y}
      </button>
    )
  }

  const ComponentComputedAfterEffect: FC<ComponentProps> = ({
    first,
    second,
    useGetFirst,
    useGetSecond,
  }) => {
    const x = useGetFirst(first)

    useEffect(() => {
      second.write(x)
    }, [second, x])

    const y = useGetSecond(second)

    return (
      <button type="button" onClick={() => first.write(x + 1)}>
        {y}
      </button>
    )
  }

  const useComputedInline = (signal: Signal<number>) =>
    useComputed((monitor) => signal.read(monitor))

  const useComputedMemoized = (signal: Signal<number>) =>
    useComputed((monitor) => signal.read(monitor), [signal])

  const useComputedShortcut = (signal: Signal<number>) => useComputed(signal)

  describe.each([
    ["before", ComponentComputedBeforeEffect],
    ["after", ComponentComputedAfterEffect],
  ])("calls depending hook %s useEffect", (_, Component) => {
    describe.each([
      ["inline useComputed", useComputedInline],
      ["memoized useComputed", useComputedMemoized],
      ["shortcut useComputed", useComputedShortcut],
    ])("with %s as useGetFirst", (_, useGetFirst) => {
      it.each([
        ["inline useComputed", useComputedInline],
        ["memoized useComputed", useComputedMemoized],
        ["shortcut useComputed", useComputedShortcut],
      ])("with %s as useGetSecond", (_, useGetSecond) => {
        const first = Signal(0)
        const second = Signal(5)

        render(
          <Component
            first={first}
            second={second}
            useGetFirst={useGetFirst}
            useGetSecond={useGetSecond}
          />,
        )

        const button = screen.getByRole("button")
        expect(button).toHaveTextContent("0")

        fireEvent.click(button)
        expect(button).toHaveTextContent("1")

        fireEvent.click(button)
        expect(button).toHaveTextContent("2")

        act(() => {
          first.write(10)
        })
        expect(button).toHaveTextContent("10")

        fireEvent.click(button)
        expect(button).toHaveTextContent("11")

        act(() => {
          second.write(20)
        })
        expect(button).toHaveTextContent("20")

        fireEvent.click(button)
        expect(button).toHaveTextContent("12")
      })
    })
  })
})

describe("use Impulse#getValue() in Impulse#toJSON() and Impulse#toString() #321", () => {
  it.each([
    ["toString()", (value: unknown) => String(value)],
    ["toJSON()", (value: unknown) => JSON.stringify(value)],
  ])("reacts on %s call via `effect`", (_, convert) => {
    const Component: FC<{
      count: Signal<number>
    }> = ({ count }) => {
      const [value, setValue] = useState(() => convert(count))

      useEffect(
        () =>
          effect(() => {
            setValue(convert(count))
          }),
        [count, convert],
      )

      return <span data-testid="result">{value}</span>
    }

    const count = Signal(1)
    render(<Component count={count} />)

    const result = screen.getByTestId("result")
    expect(result).toHaveTextContent("1")

    act(() => {
      count.write(2)
    })
    expect(result).toHaveTextContent("2")
  })
})

describe("return the same component type from watch #322", () => {
  const StatelessInput: FC<{
    value: string
    onChange: Dispatch<string>
  }> = ({ value, onChange }) => (
    <input value={value} onChange={(event) => onChange(event.target.value)} />
  )

  const StatefulInput: FC<{
    value: Signal<string>
  }> = ({ value }) => {
    const monitor = useMonitor()

    return (
      <StatelessInput
        value={value.read(monitor)}
        onChange={(nextValue) => value.write(nextValue)}
      />
    )
  }

  const Input = Object.assign(StatefulInput, { stateless: StatelessInput })

  it("monitors the StatefulInput", () => {
    const text = Signal("hello")
    render(<Input value={text} />)

    const first = screen.getByRole("textbox")
    expect(first).toHaveValue("hello")

    act(() => {
      text.write("world")
    })
    expect(first).toHaveValue("world")
  })
})

describe("in StrictMode, fails due to unexpected .setValue during watch call #336", () => {
  const Button: FC<{
    count: Signal<number>
  }> = ({ count }) => {
    const monitor = useMonitor()
    useState(0)

    return (
      <button type="button" onClick={() => count.write((x) => x + 1)}>
        {count.read(monitor)}
      </button>
    )
  }

  it("does not fail in strict mode", () => {
    const signal = Signal(0)

    render(
      <StrictMode>
        <Button count={signal} />
      </StrictMode>,
    )

    const btn = screen.getByRole("button")
    expect(btn).toHaveTextContent("0")

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("1")

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("2")

    act(() => {
      signal.write((x) => x + 1)
    })
    expect(btn).toHaveTextContent("3")
  })
})

describe("TransmittingImpulse.setValue does not enqueue a rerender when sets a not reactive value #627", () => {
  it("does not enqueue a rerender when sets a not reactive value", () => {
    const counter = { count: 0 }
    const signal = Signal(
      () => counter.count,
      (count) => {
        counter.count = count
      },
    )

    const { result } = renderHook(() => useComputed(signal))

    expect(result.current).toBe(0)

    act(() => {
      signal.write(1)
    })

    expect(result.current).toBe(0)
  })
})
