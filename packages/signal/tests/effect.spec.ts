import { act, renderHook } from "@testing-library/react"

import { Signal, batch, effect, useComputed } from "../src"

import { Counter } from "./common"

describe("single Signal", () => {
  it("executes listener on init", () => {
    const spy = vi.fn()
    const signal = Signal(1)

    effect((monitor) => {
      spy(signal.read(monitor))
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith(1)
    expect(signal).toHaveEmittersSize(1)
  })

  it("executes listener on update", () => {
    const spy = vi.fn()
    const signal = Signal(1)

    effect((monitor) => {
      spy(signal.read(monitor))
    })

    spy.mockReset()
    signal.update(2)
    expect(spy).toHaveBeenCalledExactlyOnceWith(2)
    expect(signal).toHaveEmittersSize(1)
  })

  it("executes listener cleanup", () => {
    const cleanup = vi.fn()
    const signal = Signal(1)

    const unsubscribe = effect((monitor) => {
      const count = signal.read(monitor)

      if (count === 2) {
        return
      }

      return () => {
        cleanup(count)
      }
    })

    expect(cleanup).not.toHaveBeenCalled()

    signal.update(2)
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(1)
    vi.clearAllMocks()

    signal.update(5)
    expect(cleanup).not.toHaveBeenCalled()
    vi.clearAllMocks()

    signal.update(7)
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(5)
    vi.clearAllMocks()

    unsubscribe()
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(7)
    vi.clearAllMocks()

    signal.update(9)
    expect(cleanup).not.toHaveBeenCalled()
  })

  it("doesn't execute listener after unsubscribe", () => {
    const spy = vi.fn()
    const signal = Signal(1)

    const unsubscribe = effect((monitor) => {
      spy(signal.read(monitor))
    })

    unsubscribe()

    spy.mockReset()
    signal.update(2)
    expect(spy).not.toHaveBeenCalled()
    expect(signal).toHaveEmittersSize(0)
  })

  it("ignores second unsubscribe", () => {
    const spy = vi.fn()
    const signal = Signal(1)

    const unsubscribe = effect((monitor) => {
      spy(signal.read(monitor))
    })

    unsubscribe()
    unsubscribe()

    spy.mockReset()
    signal.update(2)
    expect(spy).not.toHaveBeenCalled()
    expect(signal).toHaveEmittersSize(0)
  })

  it("executes listener on every Signal update", () => {
    const spy = vi.fn()
    const signal = Signal(1)

    effect((monitor) => {
      spy(signal.read(monitor))
    })

    spy.mockReset()
    signal.update(2)
    signal.update(3)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith(3)
    expect(signal).toHaveEmittersSize(1)
  })

  it("executes listener ones for batched Signal updates", () => {
    const spy = vi.fn()
    const signal = Signal(1)

    effect((monitor) => {
      spy(signal.read(monitor))
    })

    spy.mockReset()
    batch(() => {
      signal.update(2)
      signal.update(3)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
    expect(signal).toHaveEmittersSize(1)
  })

  it("doesn't execute listener when Signal value does not change", () => {
    const spy = vi.fn()
    const signal = Signal(1)

    effect((monitor) => {
      spy(signal.read(monitor))
    })

    spy.mockReset()
    signal.update(1)
    expect(spy).not.toHaveBeenCalled()
    expect(signal).toHaveEmittersSize(1)
  })

  it("doesn't execute listener when Signal value comparably the same", () => {
    const spy = vi.fn()
    const signal = Signal({ count: 1 }, { equals: Counter.equals })

    effect((monitor) => {
      spy(signal.read(monitor))
    })

    spy.mockReset()
    signal.update({ count: 1 })
    expect(spy).not.toHaveBeenCalled()

    spy.mockReset()
    signal.update({ count: 2 })
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 2 })
    expect(signal).toHaveEmittersSize(1)
  })
})

describe("multiple Signals", () => {
  it("executes listener on init", () => {
    const spy = vi.fn()
    const signal1 = Signal(1)
    const signal2 = Signal(2)

    effect((monitor) => {
      spy(signal1.read(monitor) + signal2.read(monitor))
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
    expect(signal1).toHaveEmittersSize(1)
    expect(signal2).toHaveEmittersSize(1)
  })

  it("executes listener on update", () => {
    const spy = vi.fn()
    const signal1 = Signal(1)
    const signal2 = Signal(2)

    effect((monitor) => {
      spy(signal1.read(monitor) + signal2.read(monitor))
    })

    spy.mockReset()
    signal1.update(3)
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)

    spy.mockReset()
    signal2.update(4)
    expect(spy).toHaveBeenCalledExactlyOnceWith(7)
    expect(signal1).toHaveEmittersSize(1)
    expect(signal2).toHaveEmittersSize(1)
  })

  it("doesn't execute listener after unsubscribe", () => {
    const spy = vi.fn()
    const signal1 = Signal(1)
    const signal2 = Signal(2)

    const unsubscribe = effect((monitor) => {
      spy(signal1.read(monitor) + signal2.read(monitor))
    })

    unsubscribe()
    expect(signal1).toHaveEmittersSize(0)
    expect(signal2).toHaveEmittersSize(0)

    spy.mockReset()
    signal1.update(4)
    signal2.update(5)
    expect(spy).not.toHaveBeenCalled()
  })

  it("doesn't execute conditional listener when conditional Signal changes", () => {
    const spy = vi.fn()
    const signal1 = Signal(1)
    const signal2 = Signal(2)

    effect((monitor) => {
      if (signal1.read(monitor) > 1) {
        spy(signal1.read(monitor) + signal2.read(monitor))
      }
    })
    expect(signal1).toHaveEmittersSize(1)
    expect(signal2).toHaveEmittersSize(0)

    spy.mockReset()
    signal2.update(3)
    expect(spy).not.toHaveBeenCalled()
    expect(signal1).toHaveEmittersSize(1)
    expect(signal2).toHaveEmittersSize(0)

    spy.mockReset()
    signal1.update(2)
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)
    expect(signal1).toHaveEmittersSize(1)
    expect(signal2).toHaveEmittersSize(1)

    spy.mockReset()
    signal2.update(4)
    expect(spy).toHaveBeenCalledExactlyOnceWith(6)
    expect(signal1).toHaveEmittersSize(1)
    expect(signal2).toHaveEmittersSize(1)

    spy.mockReset()
    signal1.update(1)
    expect(spy).not.toHaveBeenCalled()
    expect(signal1).toHaveEmittersSize(1)
    expect(signal2).toHaveEmittersSize(0)
  })
})

describe("batching against effect listener", () => {
  it("executes listener on every Signal update", () => {
    const spy = vi.fn()
    const signal1 = Signal(1)
    const signal2 = Signal(2)

    effect((monitor) => {
      spy(signal1.read(monitor) + signal2.read(monitor))
    })

    spy.mockReset()
    signal1.update(2)
    signal2.update(3)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenNthCalledWith(1, 4)
    expect(spy).toHaveBeenNthCalledWith(2, 5)
  })

  it("executes listener ones for batched Signal updates", () => {
    const spy = vi.fn()
    const signal1 = Signal(1)
    const signal2 = Signal(2)

    effect((monitor) => {
      spy(signal1.read(monitor) + signal2.read(monitor))
    })

    spy.mockReset()
    batch(() => {
      signal1.update(2)
      signal2.update(3)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)
  })
})

describe("batching against a hook", () => {
  it("enqueues single re-render to a hook which signals update inside effect's listener", () => {
    const signal1 = Signal(1)
    const signal2 = Signal(2)
    const signal3 = Signal(3)
    const signal4 = Signal(0)
    const spy = vi.fn()

    const { result } = renderHook(() =>
      useComputed((monitor) => {
        spy()

        return signal1.read(monitor) + signal2.read(monitor) + signal3.read(monitor)
      }, []),
    )

    const unsubscribe = effect((monitor) => {
      if (signal4.read(monitor) > 1 && signal4.read(monitor) < 5) {
        signal1.update((x) => x + 1)
        signal2.update((x) => x + 1)
        signal3.update((x) => x + 1)
      }
    })

    expect(result.current).toBe(6)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      signal4.update(1)
    })
    expect(result.current).toBe(6)
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      signal4.update(2)
    })
    expect(result.current).toBe(9)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      signal1.update((x) => x + 1)
      signal2.update((x) => x + 1)
      signal3.update((x) => x + 1)
    })
    expect(result.current).toBe(12)
    expect(spy).toHaveBeenCalledTimes(3)
    vi.clearAllMocks()

    unsubscribe()
    act(() => {
      signal4.update(3)
    })
    expect(result.current).toBe(12)
    expect(spy).not.toHaveBeenCalled()
  })

  it("enqueues single re-render to a hook which signals update inside effect's cleanup", () => {
    const signal1 = Signal(1)
    const signal2 = Signal(2)
    const signal3 = Signal(3)
    const signal4 = Signal(0)
    const spy = vi.fn()

    const { result } = renderHook(() =>
      useComputed((monitor) => {
        spy()

        return signal1.read(monitor) + signal2.read(monitor) + signal3.read(monitor)
      }, []),
    )

    const unsubscribe = effect((monitor) => {
      if (signal4.read(monitor) > 1 && signal4.read(monitor) < 5) {
        return () => {
          signal1.update((x) => x + 1)
          signal2.update((x) => x + 1)
          signal3.update((x) => x + 1)
        }
      }

      return undefined
    })

    expect(result.current).toBe(6)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      signal4.update(1)
    })
    expect(result.current).toBe(6)
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      signal4.update(2)
    })
    expect(result.current).toBe(6)
    expect(spy).not.toHaveBeenCalled()
    vi.clearAllMocks()

    act(() => {
      signal4.update(3)
    })
    expect(result.current).toBe(9)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      signal1.update((x) => x + 1)
      signal2.update((x) => x + 1)
      signal3.update((x) => x + 1)
    })
    expect(result.current).toBe(12)
    expect(spy).toHaveBeenCalledTimes(3)
    vi.clearAllMocks()

    act(() => {
      unsubscribe()
    })
    expect(result.current).toBe(15)
    expect(spy).toHaveBeenCalledOnce()
  })
})

describe("nested Signals", () => {
  it("executes listener on init", () => {
    const spy = vi.fn()
    const signal1 = Signal(1)
    const signal2 = Signal(2)
    const signal3 = Signal({
      first: signal1,
      second: signal2,
    })

    effect((monitor) => {
      const { first, second } = signal3.read(monitor)

      spy(first.read(monitor) + second.read(monitor))
    })

    expect(signal1).toHaveEmittersSize(1)
    expect(signal2).toHaveEmittersSize(1)
    expect(signal3).toHaveEmittersSize(1)

    expect(spy).toHaveBeenCalledExactlyOnceWith(3)
  })

  it("executes listener on update", () => {
    const spy = vi.fn()
    const signal1 = Signal(1)
    const signal2 = Signal(2)
    const signal3 = Signal({
      first: signal1,
      second: signal2,
    })

    effect((monitor) => {
      const { first, second } = signal3.read(monitor)

      spy(first.read(monitor) + second.read(monitor))
    })

    spy.mockReset()
    signal1.update(3)
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)

    spy.mockReset()
    signal2.update(4)
    expect(spy).toHaveBeenCalledExactlyOnceWith(7)

    spy.mockReset()
    signal3.update({
      first: signal2,
      second: signal1,
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(7)
  })
})
