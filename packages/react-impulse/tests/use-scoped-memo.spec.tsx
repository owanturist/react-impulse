import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { Impulse, useScopedMemo } from "../src"

describe("single impulse", () => {
  const Component: React.FC<{
    onMemo?: React.Dispatch<number>
    value: Impulse<number>
  }> = ({ onMemo, value }) => {
    const [multiplier, setMultiplier] = React.useState(2)
    const result = useScopedMemo(
      (scope) => {
        const x = value.getValue(scope) * multiplier

        onMemo?.(x)

        return x
      },
      [value, multiplier, onMemo],
    )

    return (
      <>
        <span data-testid="value">{result}</span>
        <button
          type="button"
          data-testid="increment"
          onClick={() => setMultiplier((x) => x + 1)}
        />
      </>
    )
  }

  it("can watch inside useScopedMemo", () => {
    const value = Impulse(1)
    const onMemo = vi.fn()
    const onRender = vi.fn()

    render(
      <React.Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value} />
      </React.Profiler>,
    )

    const node = screen.getByTestId("value")

    expect(node).toHaveTextContent("2")
    expect(onMemo).toHaveBeenCalledOnce()
    expect(onRender).toHaveBeenCalledOnce()
    expect(value).toHaveEmittersSize(1)
    vi.clearAllMocks()

    act(() => {
      value.setValue(2)
    })

    expect(node).toHaveTextContent("4")
    expect(onMemo).toHaveBeenCalledOnce()
    expect(onRender).toHaveBeenCalledOnce()
    expect(value).toHaveEmittersSize(1)
  })

  it("does not call useMemo factory when deps not changed", () => {
    const value = Impulse(1)
    const onMemo = vi.fn()
    const onRender = vi.fn()

    const { rerender } = render(
      <React.Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value} />
      </React.Profiler>,
    )

    expect(onMemo).toHaveBeenCalledExactlyOnceWith(2)
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    rerender(
      <React.Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value} />
      </React.Profiler>,
    )

    expect(onMemo).not.toHaveBeenCalled()
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      value.setValue(3)
    })

    expect(onMemo).toHaveBeenCalledExactlyOnceWith(6)
    expect(value).toHaveEmittersSize(1)
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("should call useMemo factory when dep Impulse changes", () => {
    const value_1 = Impulse(1)
    const value_2 = Impulse(3)
    const onMemo = vi.fn()
    const onRender = vi.fn()

    const { rerender } = render(
      <React.Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value_1} />
      </React.Profiler>,
    )
    vi.clearAllMocks()

    rerender(
      <React.Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value_2} />
      </React.Profiler>,
    )

    expect(onMemo).toHaveBeenCalledExactlyOnceWith(6)
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("should unsubscribe Impulse from useMemo when swapped", () => {
    const value_1 = Impulse(1)
    const value_2 = Impulse(3)
    const onMemo = vi.fn()
    const onRender = vi.fn()

    const { rerender } = render(
      <React.Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value_1} />
      </React.Profiler>,
    )

    expect(value_1).toHaveEmittersSize(1)
    expect(value_2).toHaveEmittersSize(0)

    rerender(
      <React.Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value_2} />
      </React.Profiler>,
    )
    expect(value_1).toHaveEmittersSize(0)
    expect(value_2).toHaveEmittersSize(1)

    vi.clearAllMocks()

    act(() => {
      value_1.setValue(10)
    })

    expect(onMemo).not.toHaveBeenCalled()
    expect(onRender).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      value_2.setValue(5)
    })
    expect(onMemo).toHaveBeenCalledExactlyOnceWith(10)
    expect(onRender).toHaveBeenCalledOnce()

    expect(value_1).toHaveEmittersSize(0)
    expect(value_2).toHaveEmittersSize(1)
  })

  it("should call useMemo factory when none-Impulse dep changes", () => {
    const value = Impulse(3)
    const onMemo = vi.fn()
    const onRender = vi.fn()

    render(
      <React.Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value} />
      </React.Profiler>,
    )
    vi.clearAllMocks()

    fireEvent.click(screen.getByTestId("increment"))

    expect(onMemo).toHaveBeenCalledExactlyOnceWith(9)
    expect(onRender).toHaveBeenCalledOnce()
    expect(value).toHaveEmittersSize(1)
    vi.clearAllMocks()

    act(() => {
      value.setValue(4)
    })
    expect(onMemo).toHaveBeenCalledExactlyOnceWith(12)
    expect(onRender).toHaveBeenCalledOnce()
    expect(value).toHaveEmittersSize(1)
  })
})

describe("multiple impulses", () => {
  const Component: React.FC<{
    first: Impulse<number>
    second: Impulse<number>
  }> = ({ first, second }) => {
    const [multiplier, setMultiplier] = React.useState(2)
    const result = useScopedMemo(
      (scope) => {
        return (first.getValue(scope) + second.getValue(scope)) * multiplier
      },
      [first, second, multiplier],
    )

    return (
      <>
        <span data-testid="value">{result}</span>
        <button
          type="button"
          data-testid="increment"
          onClick={() => setMultiplier((x) => x + 1)}
        />
      </>
    )
  }

  it("can watch after both impulses", () => {
    const first = Impulse(2)
    const second = Impulse(3)

    render(<Component first={first} second={second} />)

    const node = screen.getByTestId("value")

    expect(first).toHaveEmittersSize(1)
    expect(second).toHaveEmittersSize(1)
    expect(node).toHaveTextContent("10")

    act(() => {
      first.setValue(4)
    })
    expect(node).toHaveTextContent("14")

    act(() => {
      second.setValue(5)
    })
    expect(node).toHaveTextContent("18")

    expect(first).toHaveEmittersSize(1)
    expect(second).toHaveEmittersSize(1)
  })
})

describe("nested impulses", () => {
  const Component: React.FC<{
    list: Impulse<Array<Impulse<number>>>
  }> = ({ list }) => {
    const [multiplier, setMultiplier] = React.useState(2)
    const result = useScopedMemo(
      (scope) => {
        const x =
          list
            .getValue(scope)
            .map((item) => item.getValue(scope))
            .reduce((acc, val) => acc + val, 0) * multiplier

        return x
      },
      [list, multiplier],
    )

    return (
      <>
        <span data-testid="value">{result}</span>
        <button
          type="button"
          data-testid="increment"
          onClick={() => setMultiplier((x) => x + 1)}
        />
      </>
    )
  }

  it("can watch after all impulses", () => {
    const _0 = Impulse(2)
    const _1 = Impulse(3)
    const _2 = Impulse(4)
    const list = Impulse([_0, _1])

    render(<Component list={list} />)

    expect(list).toHaveEmittersSize(1)
    expect(_0).toHaveEmittersSize(1)
    expect(_1).toHaveEmittersSize(1)
    expect(_2).toHaveEmittersSize(0)

    const node = screen.getByTestId("value")

    expect(node).toHaveTextContent("10")

    act(() => {
      _0.setValue(4)
    })
    expect(node).toHaveTextContent("14")

    act(() => {
      _1.setValue(5)
    })
    expect(node).toHaveTextContent("18")

    act(() => {
      list.setValue((items) => [...items, _2])
    })
    expect(node).toHaveTextContent("26")

    expect(_2).toHaveEmittersSize(1)

    act(() => {
      list.setValue((items) => items.slice(1))
    })
    expect(node).toHaveTextContent("18")

    expect(list).toHaveEmittersSize(1)
    expect(_0).toHaveEmittersSize(0)
    expect(_1).toHaveEmittersSize(1)
    expect(_2).toHaveEmittersSize(1)
  })
})
