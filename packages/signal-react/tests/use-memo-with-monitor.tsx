import { Signal } from "@owanturist/signal"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { type Dispatch, type FC, Profiler, useMemo, useState } from "react"

import { useMonitor } from "../src"

describe("single Signal", () => {
  const Component: FC<{
    onMemo?: Dispatch<number>
    value: Signal<number>
  }> = ({ onMemo, value }) => {
    const monitor = useMonitor()
    const [multiplier, setMultiplier] = useState(2)
    const result = useMemo(() => {
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

  it("can watch inside useMemo", () => {
    const value = Signal(1)
    const onMemo = vi.fn()
    const onRender = vi.fn()

    render(
      <Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value} />
      </Profiler>,
    )

    const node = screen.getByTestId("value")

    expect(node).toHaveTextContent("2")
    expect(onMemo).toHaveBeenCalledOnce()
    expect(onRender).toHaveBeenCalledOnce()
    expect(value).toHaveEmittersSize(1)
    vi.clearAllMocks()

    act(() => {
      value.write(2)
    })

    expect(node).toHaveTextContent("4")
    expect(onMemo).toHaveBeenCalledOnce()
    expect(onRender).toHaveBeenCalledOnce()
    expect(value).toHaveEmittersSize(1)
  })

  it("does not call useMemo factory when deps not changed", () => {
    const value = Signal(1)
    const onMemo = vi.fn()
    const onRender = vi.fn()

    const { rerender } = render(
      <Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value} />
      </Profiler>,
    )

    expect(onMemo).toHaveBeenCalledExactlyOnceWith(2)
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    rerender(
      <Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value} />
      </Profiler>,
    )

    expect(onMemo).not.toHaveBeenCalled()
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      value.write(3)
    })

    expect(onMemo).toHaveBeenCalledExactlyOnceWith(6)
    expect(value).toHaveEmittersSize(1)
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("should call useMemo factory when dep Signal changes", () => {
    const value1 = Signal(1)
    const value2 = Signal(3)
    const onMemo = vi.fn()
    const onRender = vi.fn()

    const { rerender } = render(
      <Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value1} />
      </Profiler>,
    )
    vi.clearAllMocks()

    rerender(
      <Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value2} />
      </Profiler>,
    )

    expect(onMemo).toHaveBeenCalledExactlyOnceWith(6)
    expect(onRender).toHaveBeenCalledOnce()
  })

  it("should unsubscribe Signal from useMemo when swapped", () => {
    const value1 = Signal(1)
    const value2 = Signal(3)
    const onMemo = vi.fn()
    const onRender = vi.fn()

    const { rerender } = render(
      <Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value1} />
      </Profiler>,
    )

    expect(value1).toHaveEmittersSize(1)
    expect(value2).toHaveEmittersSize(0)

    rerender(
      <Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value2} />
      </Profiler>,
    )

    /**
     * Not 0 because a monitor cannot cleanup on every rerender,
     * otherwise memo/effect hooks with the monitor dependency will lose subscriptions too eagerly.
     */
    expect(value1).toHaveEmittersSize(1)
    expect(value2).toHaveEmittersSize(1)

    vi.clearAllMocks()

    act(() => {
      value1.write(10)
    })

    expect(onMemo).toHaveBeenCalledOnce()
    expect(onRender).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      value2.write(5)
    })
    expect(onMemo).toHaveBeenCalledExactlyOnceWith(10)
    expect(onRender).toHaveBeenCalledOnce()

    expect(value1).toHaveEmittersSize(0)
    expect(value2).toHaveEmittersSize(1)
  })

  it("should call useMemo factory when none-Signal dep changes", () => {
    const value = Signal(3)
    const onMemo = vi.fn()
    const onRender = vi.fn()

    render(
      <Profiler id="test" onRender={onRender}>
        <Component onMemo={onMemo} value={value} />
      </Profiler>,
    )
    vi.clearAllMocks()

    fireEvent.click(screen.getByTestId("increment"))

    expect(onMemo).toHaveBeenCalledExactlyOnceWith(9)
    expect(onRender).toHaveBeenCalledOnce()
    expect(value).toHaveEmittersSize(1)
    vi.clearAllMocks()

    act(() => {
      value.write(4)
    })
    expect(onMemo).toHaveBeenCalledExactlyOnceWith(12)
    expect(onRender).toHaveBeenCalledOnce()
    expect(value).toHaveEmittersSize(1)
  })
})

describe("multiple signals", () => {
  const Component: FC<{
    first: Signal<number>
    second: Signal<number>
  }> = ({ first, second }) => {
    const monitor = useMonitor()
    const [multiplier, setMultiplier] = useState(2)
    const result = useMemo(
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

  it("can watch after both signals", () => {
    const first = Signal(2)
    const second = Signal(3)

    render(<Component first={first} second={second} />)

    const node = screen.getByTestId("value")

    expect(first).toHaveEmittersSize(1)
    expect(second).toHaveEmittersSize(1)
    expect(node).toHaveTextContent("10")

    act(() => {
      first.write(4)
    })
    expect(node).toHaveTextContent("14")

    act(() => {
      second.write(5)
    })
    expect(node).toHaveTextContent("18")

    expect(first).toHaveEmittersSize(1)
    expect(second).toHaveEmittersSize(1)
  })
})

describe("nested signals", () => {
  const Component: FC<{
    list: Signal<Array<Signal<number>>>
  }> = ({ list }) => {
    const monitor = useMonitor()
    const [multiplier, setMultiplier] = useState(2)
    const result = useMemo(() => {
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

  it("can watch after all signals", () => {
    const count0 = Signal(2)
    const count1 = Signal(3)
    const count2 = Signal(4)
    const list = Signal([count0, count1])

    render(<Component list={list} />)

    expect(list).toHaveEmittersSize(1)
    expect(count0).toHaveEmittersSize(1)
    expect(count1).toHaveEmittersSize(1)
    expect(count2).toHaveEmittersSize(0)

    const node = screen.getByTestId("value")

    expect(node).toHaveTextContent("10")

    act(() => {
      count0.write(4)
    })
    expect(node).toHaveTextContent("14")

    act(() => {
      count1.write(5)
    })
    expect(node).toHaveTextContent("18")

    act(() => {
      list.write((items) => [...items, count2])
    })
    expect(node).toHaveTextContent("26")

    expect(count2).toHaveEmittersSize(1)

    act(() => {
      list.write((items) => items.slice(1))
    })
    expect(node).toHaveTextContent("18")

    expect(list).toHaveEmittersSize(1)
    expect(count0).toHaveEmittersSize(0)
    expect(count1).toHaveEmittersSize(1)
    expect(count2).toHaveEmittersSize(1)
  })
})
