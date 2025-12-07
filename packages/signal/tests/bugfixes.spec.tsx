import { act, fireEvent, render, renderHook, screen } from "@testing-library/react"
import React from "react"

import { Signal, effect, useComputed, useMonitor } from "../src"

describe("watching misses when defined after useEffect #140", () => {
  interface ComponentProps {
    first: Signal<number>
    second: Signal<number>
    useGetFirst(first: Signal<number>): number
    useGetSecond(second: Signal<number>): number
  }

  const ComponentComputedBeforeEffect: React.FC<ComponentProps> = ({
    first,
    second,
    useGetFirst,
    useGetSecond,
  }) => {
    const x = useGetFirst(first)
    const y = useGetSecond(second)

    React.useEffect(() => {
      second.update(x)
    }, [second, x])

    return (
      <button type="button" onClick={() => first.update(x + 1)}>
        {y}
      </button>
    )
  }

  const ComponentComputedAfterEffect: React.FC<ComponentProps> = ({
    first,
    second,
    useGetFirst,
    useGetSecond,
  }) => {
    const x = useGetFirst(first)

    React.useEffect(() => {
      second.update(x)
    }, [second, x])

    const y = useGetSecond(second)

    return (
      <button type="button" onClick={() => first.update(x + 1)}>
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
          first.update(10)
        })
        expect(button).toHaveTextContent("10")

        fireEvent.click(button)
        expect(button).toHaveTextContent("11")

        act(() => {
          second.update(20)
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
    const Component: React.FC<{
      count: Signal<number>
    }> = ({ count }) => {
      const [value, setValue] = React.useState(() => convert(count))

      React.useEffect(
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
      count.update(2)
    })
    expect(result).toHaveTextContent("2")
  })
})

describe("return the same component type from watch #322", () => {
  const StatelessInput: React.FC<{
    value: string
    onChange: React.Dispatch<string>
  }> = ({ value, onChange }) => (
    <input value={value} onChange={(event) => onChange(event.target.value)} />
  )

  const StatefulInput: React.FC<{
    value: Signal<string>
  }> = ({ value }) => {
    const monitor = useMonitor()

    return (
      <StatelessInput
        value={value.read(monitor)}
        onChange={(nextValue) => value.update(nextValue)}
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
      text.update("world")
    })
    expect(first).toHaveValue("world")
  })
})

describe("in StrictMode, fails due to unexpected .setValue during watch call #336", () => {
  const Button: React.FC<{
    count: Signal<number>
  }> = ({ count }) => {
    const monitor = useMonitor()
    React.useState(0)

    return (
      <button type="button" onClick={() => count.update((x) => x + 1)}>
        {count.read(monitor)}
      </button>
    )
  }

  it("does not fail in strict mode", () => {
    const signal = Signal(0)

    render(
      <React.StrictMode>
        <Button count={signal} />
      </React.StrictMode>,
    )

    const btn = screen.getByRole("button")
    expect(btn).toHaveTextContent("0")

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("1")

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("2")

    act(() => {
      signal.update((x) => x + 1)
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
      signal.update(1)
    })

    expect(result.current).toBe(0)
  })
})

describe("ImpulseForm.reset() does not run subscribers #969", () => {
  it("runs the effect listeners for every derived update", ({ monitor }) => {
    const spy = vi.fn()
    const source1 = Signal(1)
    const source2 = Signal<string>()
    const derived = Signal((monitor) => source2.read(monitor) ?? source1.read(monitor) > 0)

    effect((monitor) => {
      const output = derived.read(monitor)

      spy(output)

      if (output === false) {
        source2.update("error")
      }
    })

    // initial run
    expect(spy).toHaveBeenCalledExactlyOnceWith(true)
    expect(derived.read(monitor)).toBe(true)
    spy.mockClear()

    // cause the source_2 update
    source1.update(-1)
    expect(spy).toHaveBeenCalledTimes(2)
    // source_1 update causes the listener run
    expect(spy).toHaveBeenNthCalledWith(1, false)
    // the source_2 inside the listener causes the listener run again
    expect(spy).toHaveBeenNthCalledWith(2, "error")
    expect(derived.read(monitor)).toBe("error")
    spy.mockClear()

    // source_1 is not relevant to the current derived value, so it does not cause the listener run
    source1.update(1)
    expect(spy).not.toHaveBeenCalled()
    expect(derived.read(monitor)).toBe("error")

    // enable the source_1 to derive the derived value again
    source2.update(undefined)
    expect(spy).toHaveBeenCalledExactlyOnceWith(true)
    expect(derived.read(monitor)).toBe(true)
  })
})
