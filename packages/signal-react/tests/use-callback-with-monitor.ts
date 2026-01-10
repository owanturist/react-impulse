import { Signal } from "@owanturist/signal"
import { act, renderHook } from "@testing-library/react"
import { useCallback } from "react"

import { useComputed, useMonitor } from "../src"

const onCallback = vi.fn<(x: number) => number>().mockImplementation((x) => x)

beforeEach(() => {
  onCallback.mockClear()
})

describe("single Signal", () => {
  const setup = (signal: Signal<number>) =>
    renderHook(
      (count: Signal<number>) => {
        const monitor = useMonitor()

        return useCallback(() => onCallback(count.read(monitor) * 2), [monitor, count])
      },
      {
        initialProps: signal,
      },
    )

  it("does not run a callback on init", () => {
    const count = Signal(1)
    setup(count)

    expect(onCallback).not.toHaveBeenCalled()
  })

  it("does not attach Signal to a monitor on init", () => {
    const count = Signal(1)
    setup(count)

    expect(count).toHaveEmittersSize(0)
  })

  it("does not change resulting function when not attached Signal's value changes", () => {
    const count = Signal(1)
    const { result } = setup(count)
    const initial = result.current

    act(() => {
      count.write(2)
    })

    expect(result.current).toBe(initial)
  })

  it("the resulting function returns a value", () => {
    const count = Signal(1)
    const { result } = setup(count)

    expect(result.current()).toBe(2)

    act(() => {
      count.write(2)
    })

    expect(result.current()).toBe(4)
  })

  it("changes resulting function when attached Signal's value changes", () => {
    const count = Signal(1)
    const { result } = setup(count)
    const initial = result.current

    initial()

    act(() => {
      count.write(2)
    })

    expect(result.current).not.toBe(initial)
  })

  it("de-attaches an attached Signal when its value changes", () => {
    const count = Signal(1)
    const { result } = setup(count)

    result.current()

    act(() => {
      count.write(2)
    })

    expect(count).toHaveEmittersSize(0)
  })

  it("attach an Signal when the resulting function calls", () => {
    const count = Signal(1)
    const { result } = setup(count)

    result.current()

    expect(count).toHaveEmittersSize(1)
  })

  it("attaches an Signal only once on the subsequent resulting function calls", () => {
    const count = Signal(1)
    const { result } = setup(count)

    result.current()
    result.current()

    expect(count).toHaveEmittersSize(1)
  })

  it("does not change resulting function with same Signal when re-renders", () => {
    const count = Signal(1)
    const { result, rerender } = setup(count)
    const initial = result.current

    rerender(count)

    expect(result.current).toBe(initial)
  })

  it("changes resulting function by a new Signal when re-renders", () => {
    const count1 = Signal(1)
    const { result, rerender } = setup(count1)
    const initial = result.current

    const count2 = Signal(2)
    rerender(count2)

    expect(result.current).not.toBe(initial)
    expect(count1).toHaveEmittersSize(0)
    expect(count2).toHaveEmittersSize(0)
  })

  it("keeps attached Signal when re-renders", () => {
    const count = Signal(1)
    const { result, rerender } = setup(count)

    result.current()

    rerender(count)

    expect(count).toHaveEmittersSize(1)
  })
})

describe("conditional Signal", () => {
  const setup = (signal: Signal<number>) =>
    renderHook(
      (count: Signal<number>) => {
        const monitor = useMonitor()

        return useCallback(
          (isActive: boolean) => {
            if (isActive) {
              return count.read(monitor) * 2
            }

            return -1
          },
          [monitor, count],
        )
      },
      {
        initialProps: signal,
      },
    )

  it("the resulting function returns a fallback when not active", () => {
    const count = Signal(1)
    const { result } = setup(count)

    expect(result.current(false)).toBe(-1)

    act(() => {
      count.write(2)
    })

    expect(result.current(false)).toBe(-1)
  })

  it("the resulting function returns a value when active", () => {
    const count = Signal(1)
    const { result } = setup(count)

    expect(result.current(true)).toBe(2)

    act(() => {
      count.write(2)
    })

    expect(result.current(true)).toBe(4)
  })

  it("does not attach an Signal when not active", () => {
    const count = Signal(1)
    const { result } = setup(count)

    result.current(false)

    expect(count).toHaveEmittersSize(0)
  })

  it("attaches an Signal when active", () => {
    const count = Signal(1)
    const { result } = setup(count)

    result.current(true)

    expect(count).toHaveEmittersSize(1)
  })

  it("keeps an Signal attached ones it was active", () => {
    const count = Signal(1)
    const { result } = setup(count)

    result.current(true)
    result.current(false)

    expect(count).toHaveEmittersSize(1)
  })

  it("de-attaches an Signal when it was active", () => {
    const count = Signal(1)
    const { result } = setup(count)

    result.current(true)

    act(() => {
      count.write(2)
    })

    expect(count).toHaveEmittersSize(0)
  })
})

describe("argument Signal", () => {
  const setup = () =>
    renderHook(() => {
      const monitor = useMonitor()

      return useCallback((count: Signal<number>) => count.read(monitor) * 2, [monitor])
    })

  it("attaches an Signal when the resulting function calls", () => {
    const count = Signal(1)
    const { result } = setup()

    expect(result.current(count)).toBe(2)

    expect(count).toHaveEmittersSize(1)
  })

  it("does not attach the same Signal twice", () => {
    const count = Signal(1)
    const { result } = setup()

    expect(result.current(count)).toBe(2)
    expect(result.current(count)).toBe(2)

    expect(count).toHaveEmittersSize(1)
  })

  it("attaches multiple Signals", () => {
    const count1 = Signal(1)
    const count2 = Signal(2)
    const { result } = setup()

    expect(result.current(count1)).toBe(2)
    expect(result.current(count2)).toBe(4)

    expect(count1).toHaveEmittersSize(1)
    expect(count2).toHaveEmittersSize(1)
  })

  it("detaches all Signals when any of the attached Signal value changes", () => {
    const count1 = Signal(1)
    const count2 = Signal(2)
    const { result } = setup()

    result.current(count1)
    result.current(count2)

    act(() => {
      count1.write(3)
    })

    expect(count1).toHaveEmittersSize(0)
    expect(count2).toHaveEmittersSize(0)
  })
})

it("cannot batch the callback", () => {
  const signal1 = Signal(1)
  const signal2 = Signal(2)
  const signal3 = Signal(3)
  const { result: callback } = renderHook(() => {
    const monitor = useMonitor()

    return useCallback(
      (diff: number) => {
        signal1.write(signal1.read(monitor) + diff)
        signal2.write(signal2.read(monitor) + diff)
        signal3.write(signal3.read(monitor) + diff)
      },
      [monitor],
    )
  })
  const spy = vi.fn()

  const { result } = renderHook(() =>
    useComputed((monitor) => {
      spy()

      return signal1.read(monitor) + signal2.read(monitor) + signal3.read(monitor)
    }, []),
  )

  expect(result.current).toBe(6)
  expect(spy).toHaveBeenCalledOnce()
  vi.clearAllMocks()

  act(() => {
    callback.current(1)
  })

  expect(result.current).toBe(9)
  expect(spy).toHaveBeenCalledTimes(3)
  vi.clearAllMocks()

  act(() => {
    callback.current(0)
  })

  expect(result.current).toBe(9)
  expect(spy).not.toHaveBeenCalled()
})
