import { Signal, effect } from "@owanturist/signal"
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react"
import { type Dispatch, type FC, Profiler, useEffect, useLayoutEffect, useState } from "react"

import { useMonitor } from "../src"

describe.each([
  ["useEffect", useEffect],
  ["useLayoutEffect", useLayoutEffect],
])("running %s hook", (_, useEffect) => {
  describe("single Signal", () => {
    const Component: FC<{
      value: Signal<number>
      useEffect: typeof useEffect
      onEffect: Dispatch<number>
    }> = ({ onEffect, value, useEffect }) => {
      const [multiplier, setMultiplier] = useState(2)

      useEffect(
        () =>
          effect((monitor) => {
            const x = value.read(monitor) * multiplier

            onEffect(x)
          }),
        [value, multiplier, onEffect],
      )

      return (
        <button type="button" data-testid="increment" onClick={() => setMultiplier((x) => x + 1)} />
      )
    }

    it("runs an effect when Signal-dependency updates", () => {
      const value = Signal(3)
      const onEffect = vi.fn()

      render(<Component onEffect={onEffect} useEffect={useEffect} value={value} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      vi.clearAllMocks()

      act(() => {
        value.write(2)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(4)
    })

    it("does not call useEffect factory when deps not changed", () => {
      const value = Signal(1)
      const onEffect = vi.fn()
      const onRender = vi.fn()

      const { rerender } = render(
        <Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value} />
        </Profiler>,
      )

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(2)
      expect(onRender).toHaveBeenCalledOnce()
      vi.clearAllMocks()

      rerender(
        <Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value} />
        </Profiler>,
      )

      expect(onEffect).not.toHaveBeenCalled()
      expect(onRender).toHaveBeenCalledOnce()
      vi.clearAllMocks()

      act(() => {
        value.write(3)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      expect(value).toHaveEmittersSize(1)
      expect(onRender).not.toHaveBeenCalled()
    })

    it("should call useEffect factory when dep Signal changes", () => {
      const value1 = Signal(1)
      const value2 = Signal(3)
      const onEffect = vi.fn()
      const onRender = vi.fn()

      const { rerender } = render(
        <Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value1} />
        </Profiler>,
      )
      vi.clearAllMocks()

      rerender(
        <Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value2} />
        </Profiler>,
      )

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      expect(onRender).toHaveBeenCalledOnce()
    })

    it("should unsubscribe Signal from useEffect when swapped", () => {
      const value1 = Signal(1)
      const value2 = Signal(3)
      const onEffect = vi.fn()
      const onRender = vi.fn()

      const { rerender } = render(
        <Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value1} />
        </Profiler>,
      )
      expect(value1).toHaveEmittersSize(1)
      expect(value2).toHaveEmittersSize(0)

      vi.clearAllMocks()

      rerender(
        <Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value2} />
        </Profiler>,
      )
      expect(value1).toHaveEmittersSize(0)
      expect(value2).toHaveEmittersSize(1)

      expect(onEffect).toHaveBeenCalledOnce()
      expect(onRender).toHaveBeenCalledOnce()
      vi.clearAllMocks()

      act(() => {
        value1.write(10)
      })

      expect(onEffect).not.toHaveBeenCalled()
      expect(onRender).not.toHaveBeenCalled()
      vi.clearAllMocks()

      act(() => {
        value2.write(5)
      })
      expect(onEffect).toHaveBeenCalledExactlyOnceWith(10)
      expect(onRender).not.toHaveBeenCalled()
      expect(value1).toHaveEmittersSize(0)
      expect(value2).toHaveEmittersSize(1)
    })

    it("should call useEffect factory when non Signal dep changes", () => {
      const value = Signal(3)
      const onEffect = vi.fn()
      const onRender = vi.fn()

      render(
        <Profiler id="test" onRender={onRender}>
          <Component useEffect={useEffect} onEffect={onEffect} value={value} />
        </Profiler>,
      )
      vi.clearAllMocks()

      fireEvent.click(screen.getByTestId("increment"))

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(9)
      expect(onRender).toHaveBeenCalledOnce()
      expect(value).toHaveEmittersSize(1)
      vi.clearAllMocks()

      act(() => {
        value.write(4)
      })
      expect(onEffect).toHaveBeenCalledExactlyOnceWith(12)
      expect(onRender).not.toHaveBeenCalled()
      expect(value).toHaveEmittersSize(1)
    })
  })

  describe("multiple signals", () => {
    const Component: FC<{
      first: Signal<number>
      second: Signal<number>
      onEffect: Dispatch<number>
    }> = ({ first, second, onEffect }) => {
      const [multiplier, setMultiplier] = useState(2)

      useEffect(
        () =>
          effect((monitor) => {
            const x = (first.read(monitor) + second.read(monitor)) * multiplier

            onEffect(x)
          }),
        [first, second, multiplier, onEffect],
      )

      return (
        <button type="button" data-testid="increment" onClick={() => setMultiplier((x) => x + 1)} />
      )
    }

    it("can watch after both signals", () => {
      const first = Signal(2)
      const second = Signal(3)
      const onEffect = vi.fn()

      render(<Component first={first} second={second} onEffect={onEffect} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(10)
      expect(first).toHaveEmittersSize(1)
      expect(second).toHaveEmittersSize(1)
      vi.clearAllMocks()

      act(() => {
        first.write(4)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(14)
      vi.clearAllMocks()

      act(() => {
        second.write(5)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(18)
      expect(first).toHaveEmittersSize(1)
      expect(second).toHaveEmittersSize(1)
    })
  })

  describe("nested signals", () => {
    const Component: FC<{
      list: Signal<Array<Signal<number>>>
      onEffect: Dispatch<number>
    }> = ({ list, onEffect }) => {
      const [multiplier, setMultiplier] = useState(2)

      useEffect(
        () =>
          effect((monitor) => {
            const x =
              list
                .read(monitor)
                .map((item) => item.read(monitor))
                .reduce((acc, val) => acc + val, 0) * multiplier

            onEffect(x)
          }),
        [list, multiplier, onEffect],
      )

      return (
        <button type="button" data-testid="increment" onClick={() => setMultiplier((x) => x + 1)} />
      )
    }

    it("can watch after all signals", () => {
      const _0 = Signal(2)
      const _1 = Signal(3)
      const _2 = Signal(4)
      const list = Signal([_0, _1])
      const onEffect = vi.fn()

      render(<Component list={list} onEffect={onEffect} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(10)
      expect(list).toHaveEmittersSize(1)
      expect(_0).toHaveEmittersSize(1)
      expect(_1).toHaveEmittersSize(1)
      expect(_2).toHaveEmittersSize(0)
      vi.clearAllMocks()

      act(() => {
        _0.write(4)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(14)
      vi.clearAllMocks()

      act(() => {
        _1.write(5)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(18)
      vi.clearAllMocks()

      act(() => {
        list.write((items) => [...items, _2])
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(26)
      expect(_2).toHaveEmittersSize(1)
      vi.clearAllMocks()

      act(() => {
        list.write((items) => items.slice(1))
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(18)
      expect(list).toHaveEmittersSize(1)
      expect(_0).toHaveEmittersSize(0)
      expect(_1).toHaveEmittersSize(1)
      expect(_2).toHaveEmittersSize(1)
    })
  })

  describe("void dependency array", () => {
    const Component: FC<{
      value: Signal<number>
      onEffect: Dispatch<number>
    }> = ({ value, onEffect }) => {
      const [multiplier, setMultiplier] = useState(2)

      useEffect(() =>
        effect((monitor) => {
          const x = value.read(monitor) * multiplier

          onEffect(x)
        }),
      )

      return (
        <button type="button" data-testid="increment" onClick={() => setMultiplier((x) => x + 1)} />
      )
    }

    it("calls effect when rerenders", () => {
      const value = Signal(3)
      const onEffect = vi.fn()

      const { rerender } = render(<Component value={value} onEffect={onEffect} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      vi.clearAllMocks()

      rerender(<Component value={value} onEffect={onEffect} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      expect(value).toHaveEmittersSize(1)
    })

    it("calls effect when inner useState changes", () => {
      const value = Signal(3)
      const onEffect = vi.fn()

      render(<Component value={value} onEffect={onEffect} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      vi.clearAllMocks()

      fireEvent.click(screen.getByTestId("increment"))

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(9)
      expect(value).toHaveEmittersSize(1)
    })

    it("calls effect when Signal inside an effect changes", () => {
      const value = Signal(3)
      const onEffect = vi.fn()

      render(<Component value={value} onEffect={onEffect} />)

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(6)
      vi.clearAllMocks()

      act(() => {
        value.write(4)
      })

      expect(onEffect).toHaveBeenCalledExactlyOnceWith(8)
      expect(value).toHaveEmittersSize(1)
    })
  })

  it("should not trigger effect when unsubscribes", () => {
    const Counter: FC<{
      count: Signal<number>
    }> = ({ count }) => {
      const monitor = useMonitor()

      return (
        <button type="button" data-testid="count" onClick={() => count.write((x) => x + 1)}>
          {count.read(monitor)}
        </button>
      )
    }

    const Host: FC<{
      count: Signal<number>
      onEffect: Dispatch<number>
    }> = ({ count, onEffect }) => {
      const [isVisible, setIsVisible] = useState(true)

      useEffect(
        () =>
          effect((monitor) => {
            onEffect(count.read(monitor))
          }),
        [onEffect, count],
      )

      return (
        <>
          <button type="button" data-testid="visibility" onClick={() => setIsVisible((x) => !x)} />
          {isVisible && <Counter count={count} />}
        </>
      )
    }

    const value = Signal(3)
    const onEffect = vi.fn()

    render(<Host count={value} onEffect={onEffect} />)

    const count = screen.getByTestId("count")
    const visibility = screen.getByTestId("visibility")

    expect(count).toHaveTextContent("3")
    expect(onEffect).toHaveBeenCalledExactlyOnceWith(3)
    vi.clearAllMocks()

    fireEvent.click(count)
    expect(count).toHaveTextContent("4")
    expect(onEffect).toHaveBeenCalledExactlyOnceWith(4)
    vi.clearAllMocks()

    fireEvent.click(visibility)
    expect(count).not.toBeInTheDocument()
    expect(onEffect).not.toHaveBeenCalled()
    vi.clearAllMocks()

    fireEvent.click(visibility)
    expect(screen.getByTestId("count")).toHaveTextContent("4")
    expect(onEffect).not.toHaveBeenCalled()
  })

  it("triggers the effect when either regular or additional dependencies change", () => {
    const spy = vi.fn()
    const signal = Signal(2)
    const { rerender } = renderHook(
      ({ left, right }) => {
        useEffect(
          () =>
            effect((monitor) => {
              spy(left + right.read(monitor))
            }),
          [left, right],
        )
      },
      {
        initialProps: { left: 1, right: signal },
      },
    )

    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
    vi.clearAllMocks()

    rerender({ left: 2, right: signal })
    expect(spy).toHaveBeenCalledExactlyOnceWith(4)
    vi.clearAllMocks()

    rerender({ left: 2, right: signal })
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      signal.write(3)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)
    vi.clearAllMocks()

    act(() => {
      signal.write(3)
    })
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    rerender({ left: 2, right: Signal(4) })
    expect(spy).toHaveBeenCalledExactlyOnceWith(6)
    vi.clearAllMocks()
  })

  it("triggers the effect when Signals are not listened in dependencies", () => {
    const spy = vi.fn()
    const left = Signal(1)
    const right = Signal(2)
    const { rerender } = renderHook(
      ({ state }) => {
        useEffect(
          () =>
            effect((monitor) => {
              spy(state.left.read(monitor) + state.right.read(monitor))
            }),
          [state],
        )
      },
      {
        initialProps: { state: { left, right } },
      },
    )

    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
    vi.clearAllMocks()

    rerender({ state: { left, right } })
    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
    vi.clearAllMocks()

    act(() => {
      left.write(2)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(4)
    vi.clearAllMocks()

    act(() => {
      right.write(3)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)
    vi.clearAllMocks()
  })

  it("calls effect cleanup function", () => {
    const cleanup = vi.fn()
    const counter = Signal({ count: 2 })
    const { rerender, unmount } = renderHook(
      (props) => {
        useEffect(
          () =>
            effect((monitor) => {
              const { count } = props.counter.read(monitor)

              return () => {
                cleanup(count * props.multiplier)
              }
            }),
          [props.counter, props.multiplier],
        )
      },
      {
        initialProps: {
          counter,
          multiplier: 2,
        },
      },
    )

    expect(cleanup).not.toHaveBeenCalled()

    counter.write({ count: 3 })
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(4)
    vi.clearAllMocks()

    rerender({
      counter,
      multiplier: 3,
    })
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(6)
    vi.clearAllMocks()

    unmount()
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(9)
    vi.clearAllMocks()

    counter.write({ count: 4 })
    expect(cleanup).not.toHaveBeenCalled()
  })

  describe("when monitor coming as a dependency", () => {
    it("reruns effect only for effect's consumers", () => {
      const spyRender = vi.fn()
      const spyEffect = vi.fn()
      const signal1 = Signal(2)
      const signal2 = Signal(3)

      const { rerender } = renderHook(
        ({ left, right }) => {
          const monitor = useMonitor()
          const monitorForEffect = useMonitor()

          useEffect(() => {
            spyEffect(left * right.read(monitorForEffect))
          }, [monitorForEffect, left, right])

          spyRender(signal2.read(monitor))
        },
        {
          initialProps: { left: 1, right: signal1 },
        },
      )

      expect(spyRender).toHaveBeenCalledExactlyOnceWith(3)
      expect(spyEffect).toHaveBeenCalledExactlyOnceWith(2)
      vi.clearAllMocks()

      rerender({ left: 1, right: signal1 })
      expect(spyRender).toHaveBeenCalledExactlyOnceWith(3)
      expect(spyEffect).not.toHaveBeenCalled()
      vi.clearAllMocks()

      act(() => {
        signal1.write(4)
      })
      expect(spyRender).toHaveBeenCalledExactlyOnceWith(3)
      expect(spyEffect).toHaveBeenCalledExactlyOnceWith(4)
      vi.clearAllMocks()

      act(() => {
        signal2.write(5)
      })
      expect(spyRender).toHaveBeenCalledExactlyOnceWith(5)
      expect(spyEffect).not.toHaveBeenCalled()
      vi.clearAllMocks()

      rerender({ left: 2, right: signal1 })
      expect(spyRender).toHaveBeenCalledExactlyOnceWith(5)
      expect(spyEffect).toHaveBeenCalledExactlyOnceWith(8)
    })
  })
})
