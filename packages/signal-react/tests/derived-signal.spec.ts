import { type Monitor, type ReadonlySignal, Signal, batch } from "@owanturist/signal"
import { act, renderHook } from "@testing-library/react"
import { useState } from "react"

import { useComputed } from "../src"

describe.each<{
  name: string
  read: <T>(signal: ReadonlySignal<T>, monitor: Monitor) => T
  write: <T>(signal: Signal<T>, setter: T | ((currentValue: T, monitor: Monitor) => T)) => void
}>([
  {
    name: "1x read / 1x write",
    read: (signal, monitor) => signal.read(monitor),
    write: (signal, setter) => {
      signal.write(setter)
    },
  },

  {
    name: "1x read / 2x write",
    read: (signal, monitor) => signal.read(monitor),
    write: (signal, setter) => {
      signal.write(setter)
      signal.write(setter)
    },
  },
  {
    name: "1x read / 2x batched write",
    read: (signal, monitor) => signal.read(monitor),
    write: (signal, setter) => {
      batch(() => {
        signal.write(setter)
        signal.write(setter)
      })
    },
  },

  {
    name: "2x read / 1x write",
    read: (signal, monitor) => {
      signal.read(monitor)

      return signal.read(monitor)
    },
    write: (signal, setter) => {
      signal.write(setter)
    },
  },

  {
    name: "2x read / 2x write",
    read: (signal, monitor) => {
      signal.read(monitor)

      return signal.read(monitor)
    },
    write: (signal, setter) => {
      signal.write(setter)
      signal.write(setter)
    },
  },
  {
    name: "2x read / 2x batched write",
    read: (signal, monitor) => {
      signal.read(monitor)

      return signal.read(monitor)
    },
    write: (signal, setter) => {
      batch(() => {
        signal.write(setter)
        signal.write(setter)
      })
    },
  },
])("Signal(getter, options?) when $name", ({ read, write }) => {
  it("does not recalculate the value on subsequent re-renders", () => {
    const source = Signal(0)
    const derived = Signal((monitor) => ({ count: read(source, monitor) }))

    const { result: first, rerender: rerenderFirst } = renderHook(() =>
      useComputed((monitor) => read(derived, monitor)),
    )

    const { result: second, rerender: rerenderSecond } = renderHook(() =>
      useComputed((monitor) => read(derived, monitor)),
    )

    expect(source).toHaveEmittersSize(1)

    const initial = first.current

    rerenderFirst()
    rerenderSecond()

    expect(initial).toBe(first.current)
    expect(initial).toBe(second.current)

    expect(source).toHaveEmittersSize(1)
  })

  it("does not recalculate the value on subsequent inner state updates", () => {
    const source = Signal(0)
    const derived = Signal((monitor) => ({ count: read(source, monitor) }))

    const { result: first } = renderHook(() => {
      const [, force] = useState(0)

      return {
        force,
        counter: useComputed((monitor) => read(derived, monitor)),
      }
    })

    const { result: second } = renderHook(() => {
      const [, force] = useState(0)

      return {
        force,
        counter: useComputed((monitor) => read(derived, monitor)),
      }
    })

    expect(source).toHaveEmittersSize(1)

    const initial = first.current.counter

    act(() => {
      first.current.force((prev) => prev + 1)
    })

    act(() => {
      second.current.force((prev) => prev + 1)
    })

    expect(initial).toBe(first.current.counter)
    expect(initial).toBe(second.current.counter)

    expect(source).toHaveEmittersSize(1)
  })

  it("keeps source observed after useComputed dependency change", () => {
    const source = Signal(1)
    const derived = Signal((monitor) => 2 * read(source, monitor))

    const { result } = renderHook(() => {
      const [count, setCount] = useState(2)

      return {
        computed: useComputed((monitor) => read(derived, monitor) + count, [count]),
        setCount,
      }
    })

    expect(result.current.computed).toBe(4)

    act(() => {
      result.current.setCount(3)
    })
    expect(result.current.computed).toBe(5)

    act(() => {
      result.current.setCount(4)
    })
    expect(result.current.computed).toBe(6)

    act(() => {
      write(source, 2)
    })
    expect(result.current.computed).toBe(8)

    act(() => {
      write(source, 3)
    })
    expect(result.current.computed).toBe(10)
  })

  it("causes a single re-render caused by dependency write", () => {
    const source = Signal(0)
    const derived = Signal((monitor) => ({ count: read(source, monitor) }))

    const spy = vi.fn()

    renderHook(() => {
      const counter = useComputed((monitor) => read(derived, monitor))

      spy(counter)
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    act(() => {
      write(source, 0)
    })
    expect(spy).not.toHaveBeenCalled()

    act(() => {
      write(source, 1)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 1 })
  })
})

describe.concurrent("Signal(getter) garbage collection", () => {
  it("cleanups the WeakRef from a hook", async () => {
    const source = Signal(0)

    const { result, unmount } = renderHook(() => {
      const derived = Signal((monitor) => ({
        count: source.read(monitor),
      }))

      return useComputed(derived)
    })

    expect(result.current).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)

    unmount()
    expect(source).toHaveEmittersSize(1)

    await global.gc?.({ execution: "async" })
    expect(source).toHaveEmittersSize(0)
  })
})
