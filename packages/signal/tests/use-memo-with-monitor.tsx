import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { Impulse, useMonitor } from "../src"

describe("single impulse", () => {
  const Component: React.FC<{
    onMemo?: React.Dispatch<number>
    value: Impulse<number>
  }> = ({ onMemo, value }) => {
    const monitor = useMonitor()
    const [multiplier, setMultiplier] = React.useState(2)
    const result = React.useMemo(() => {
      const x = value.read(monitor) * multiplier

      onMemo?.(x)

      return x
    }, [monitor, value, multiplier, onMemo])

    return (
      <>
        <span data-testid="value">{result}</span>
        <button type="button" data-testid="increment" onClick={() => setMultiplier((x) => x + 1)} />
      </>
    )
  }

  it("can watch inside React.useMemo", () => {
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
      value.update(2)
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
      value.update(3)
    })

    expect(onMemo).toHaveBeenCalledExactlyOnceWith(6)
    expect(value).toHaveEmittersSize(1)
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("should call useMemo factory when dep Impulse changes", () => {
    const value1 = Impulse(1)
    const value2 = Impulse(3)
    const onMemo = vi.fn()
    const onRender = vi.fn()

    const { rerender } = render(
      <React.Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value1} />
      </React.Profiler>,
    )
    vi.clearAllMocks()

    rerender(
      <React.Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value2} />
      </React.Profiler>,
    )

    expect(onMemo).toHaveBeenCalledExactlyOnceWith(6)
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("should unsubscribe Impulse from useMemo when swapped", () => {
    const value1 = Impulse(1)
    const value2 = Impulse(3)
    const onMemo = vi.fn()
    const onRender = vi.fn()

    const { rerender } = render(
      <React.Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value1} />
      </React.Profiler>,
    )

    expect(value1).toHaveEmittersSize(1)
    expect(value2).toHaveEmittersSize(0)

    rerender(
      <React.Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value2} />
      </React.Profiler>,
    )

    /**
     * Not 0 because a monitor cannot cleanup on every rerender,
     * otherwise memo/effect hooks with the monitor dependency will lose subscriptions too eagerly.
     */
    expect(value1).toHaveEmittersSize(1)
    expect(value2).toHaveEmittersSize(1)

    vi.clearAllMocks()

    act(() => {
      value1.update(10)
    })

    expect(onMemo).toHaveBeenCalledOnce()
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      value2.update(5)
    })
    expect(onMemo).toHaveBeenCalledExactlyOnceWith(10)
    expect(onRender).toHaveBeenCalledOnce()

    expect(value1).toHaveEmittersSize(0)
    expect(value2).toHaveEmittersSize(1)
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
      value.update(4)
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
    const monitor = useMonitor()
    const [multiplier, setMultiplier] = React.useState(2)
    const result = React.useMemo(
      () => (first.read(monitor) + second.read(monitor)) * multiplier,
      [monitor, first, second, multiplier],
    )

    return (
      <>
        <span data-testid="value">{result}</span>
        <button type="button" data-testid="increment" onClick={() => setMultiplier((x) => x + 1)} />
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
      first.update(4)
    })
    expect(node).toHaveTextContent("14")

    act(() => {
      second.update(5)
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
    const monitor = useMonitor()
    const [multiplier, setMultiplier] = React.useState(2)
    const result = React.useMemo(() => {
      const x =
        list
          .read(monitor)
          .map((item) => item.read(monitor))
          .reduce((acc, val) => acc + val, 0) * multiplier

      return x
    }, [monitor, list, multiplier])

    return (
      <>
        <span data-testid="value">{result}</span>
        <button type="button" data-testid="increment" onClick={() => setMultiplier((x) => x + 1)} />
      </>
    )
  }

  it("can watch after all impulses", () => {
    const count0 = Impulse(2)
    const count1 = Impulse(3)
    const count2 = Impulse(4)
    const list = Impulse([count0, count1])

    render(<Component list={list} />)

    expect(list).toHaveEmittersSize(1)
    expect(count0).toHaveEmittersSize(1)
    expect(count1).toHaveEmittersSize(1)
    expect(count2).toHaveEmittersSize(0)

    const node = screen.getByTestId("value")

    expect(node).toHaveTextContent("10")

    act(() => {
      count0.update(4)
    })
    expect(node).toHaveTextContent("14")

    act(() => {
      count1.update(5)
    })
    expect(node).toHaveTextContent("18")

    act(() => {
      list.update((items) => [...items, count2])
    })
    expect(node).toHaveTextContent("26")

    expect(count2).toHaveEmittersSize(1)

    act(() => {
      list.update((items) => items.slice(1))
    })
    expect(node).toHaveTextContent("18")

    expect(list).toHaveEmittersSize(1)
    expect(count0).toHaveEmittersSize(0)
    expect(count1).toHaveEmittersSize(1)
    expect(count2).toHaveEmittersSize(1)
  })
})
