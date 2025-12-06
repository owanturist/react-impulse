import { act, fireEvent, render, renderHook, screen } from "@testing-library/react"
import React from "react"

import { Impulse, subscribe, useScope, useScoped } from "../src"

describe("watching misses when defined after useEffect #140", () => {
  interface ComponentProps {
    first: Impulse<number>
    second: Impulse<number>
    useGetFirst(first: Impulse<number>): number
    useGetSecond(second: Impulse<number>): number
  }

  const ComponentScopedBeforeEffect: React.FC<ComponentProps> = ({
    first,
    second,
    useGetFirst,
    useGetSecond,
  }) => {
    const x = useGetFirst(first)
    const y = useGetSecond(second)

    React.useEffect(() => {
      second.setValue(x)
    }, [second, x])

    return (
      <button type="button" onClick={() => first.setValue(x + 1)}>
        {y}
      </button>
    )
  }

  const ComponentScopedAfterEffect: React.FC<ComponentProps> = ({
    first,
    second,
    useGetFirst,
    useGetSecond,
  }) => {
    const x = useGetFirst(first)

    React.useEffect(() => {
      second.setValue(x)
    }, [second, x])

    const y = useGetSecond(second)

    return (
      <button type="button" onClick={() => first.setValue(x + 1)}>
        {y}
      </button>
    )
  }

  const useScopedInline = (impulse: Impulse<number>) =>
    useScoped((scope) => impulse.getValue(scope))

  const useScopedMemoized = (impulse: Impulse<number>) =>
    useScoped((scope) => impulse.getValue(scope), [impulse])

  const useScopedShortcut = (impulse: Impulse<number>) => useScoped(impulse)

  describe.each([
    ["before", ComponentScopedBeforeEffect],
    ["after", ComponentScopedAfterEffect],
  ])("calls depending hook %s useEffect", (_, Component) => {
    describe.each([
      ["inline useScoped", useScopedInline],
      ["memoized useScoped", useScopedMemoized],
      ["shortcut useScoped", useScopedShortcut],
    ])("with %s as useGetFirst", (_, useGetFirst) => {
      it.each([
        ["inline useScoped", useScopedInline],
        ["memoized useScoped", useScopedMemoized],
        ["shortcut useScoped", useScopedShortcut],
      ])("with %s as useGetSecond", (_, useGetSecond) => {
        const first = Impulse(0)
        const second = Impulse(5)

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
          first.setValue(10)
        })
        expect(button).toHaveTextContent("10")

        fireEvent.click(button)
        expect(button).toHaveTextContent("11")

        act(() => {
          second.setValue(20)
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
  ])("reacts on %s call via `subscribe`", (_, convert) => {
    const Component: React.FC<{
      count: Impulse<number>
    }> = ({ count }) => {
      const [value, setValue] = React.useState(() => convert(count))

      React.useEffect(
        () =>
          subscribe(() => {
            setValue(convert(count))
          }),
        [count, convert],
      )

      return <span data-testid="result">{value}</span>
    }

    const count = Impulse(1)
    render(<Component count={count} />)

    const result = screen.getByTestId("result")
    expect(result).toHaveTextContent("1")

    act(() => {
      count.setValue(2)
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
    value: Impulse<string>
  }> = ({ value }) => {
    const scope = useScope()

    return (
      <StatelessInput
        value={value.getValue(scope)}
        onChange={(nextValue) => value.setValue(nextValue)}
      />
    )
  }

  const Input = Object.assign(StatefulInput, { stateless: StatelessInput })

  it("scopes the StatefulInput", () => {
    const text = Impulse("hello")
    render(<Input value={text} />)

    const first = screen.getByRole("textbox")
    expect(first).toHaveValue("hello")

    act(() => {
      text.setValue("world")
    })
    expect(first).toHaveValue("world")
  })
})

describe("in StrictMode, fails due to unexpected .setValue during watch call #336", () => {
  const Button: React.FC<{
    count: Impulse<number>
  }> = ({ count }) => {
    const scope = useScope()
    React.useState(0)

    return (
      <button type="button" onClick={() => count.setValue((x) => x + 1)}>
        {count.getValue(scope)}
      </button>
    )
  }

  it("does not fail in strict mode", () => {
    const impulse = Impulse(0)

    render(
      <React.StrictMode>
        <Button count={impulse} />
      </React.StrictMode>,
    )

    const btn = screen.getByRole("button")
    expect(btn).toHaveTextContent("0")

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("1")

    fireEvent.click(btn)
    expect(btn).toHaveTextContent("2")

    act(() => {
      impulse.setValue((x) => x + 1)
    })
    expect(btn).toHaveTextContent("3")
  })
})

describe("TransmittingImpulse.setValue does not enqueue a rerender when sets a not reactive value #627", () => {
  it("does not enqueue a rerender when sets a not reactive value", () => {
    const counter = { count: 0 }
    const impulse = Impulse(
      () => counter.count,
      (count) => {
        counter.count = count
      },
    )

    const { result } = renderHook(() => useScoped(impulse))

    expect(result.current).toBe(0)

    act(() => {
      impulse.setValue(1)
    })

    expect(result.current).toBe(0)
  })
})

describe("ImpulseForm.reset() does not run subscribers #969", () => {
  it("runs the subscribe listeners for every derived update", ({ scope }) => {
    const spy = vi.fn()
    const source1 = Impulse(1)
    const source2 = Impulse<string>()
    const derived = Impulse((scope) => source2.getValue(scope) ?? source1.getValue(scope) > 0)

    subscribe((scope) => {
      const output = derived.getValue(scope)

      spy(output)

      if (output === false) {
        source2.setValue("error")
      }
    })

    // initial run
    expect(spy).toHaveBeenCalledExactlyOnceWith(true)
    expect(derived.getValue(scope)).toBe(true)
    spy.mockClear()

    // cause the source_2 update
    source1.setValue(-1)
    expect(spy).toHaveBeenCalledTimes(2)
    // source_1 update causes the listener run
    expect(spy).toHaveBeenNthCalledWith(1, false)
    // the source_2 inside the listener causes the listener run again
    expect(spy).toHaveBeenNthCalledWith(2, "error")
    expect(derived.getValue(scope)).toBe("error")
    spy.mockClear()

    // source_1 is not relevant to the current derived value, so it does not cause the listener run
    source1.setValue(1)
    expect(spy).not.toHaveBeenCalled()
    expect(derived.getValue(scope)).toBe("error")

    // enable the source_1 to derive the derived value again
    source2.setValue(undefined)
    expect(spy).toHaveBeenCalledExactlyOnceWith(true)
    expect(derived.getValue(scope)).toBe(true)
  })
})
