import { Counter } from "~/tools/testing/counter"

import { Signal, batch, effect } from "../src"

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

  it("executes listener on write", () => {
    const spy = vi.fn()
    const signal = Signal(1)

    effect((monitor) => {
      spy(signal.read(monitor))
    })

    spy.mockReset()
    signal.write(2)
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

    signal.write(2)
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(1)
    vi.clearAllMocks()

    signal.write(5)
    expect(cleanup).not.toHaveBeenCalled()
    vi.clearAllMocks()

    signal.write(7)
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(5)
    vi.clearAllMocks()

    unsubscribe()
    expect(cleanup).toHaveBeenCalledExactlyOnceWith(7)
    vi.clearAllMocks()

    signal.write(9)
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
    signal.write(2)
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
    signal.write(2)
    expect(spy).not.toHaveBeenCalled()
    expect(signal).toHaveEmittersSize(0)
  })

  it("executes listener on every Signal write", () => {
    const spy = vi.fn()
    const signal = Signal(1)

    effect((monitor) => {
      spy(signal.read(monitor))
    })

    spy.mockReset()
    signal.write(2)
    signal.write(3)
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
      signal.write(2)
      signal.write(3)
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
    signal.write(1)
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
    signal.write({ count: 1 })
    expect(spy).not.toHaveBeenCalled()

    spy.mockReset()
    signal.write({ count: 2 })
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

  it("executes listener on write", () => {
    const spy = vi.fn()
    const signal1 = Signal(1)
    const signal2 = Signal(2)

    effect((monitor) => {
      spy(signal1.read(monitor) + signal2.read(monitor))
    })

    spy.mockReset()
    signal1.write(3)
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)

    spy.mockReset()
    signal2.write(4)
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
    signal1.write(4)
    signal2.write(5)
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
    signal2.write(3)
    expect(spy).not.toHaveBeenCalled()
    expect(signal1).toHaveEmittersSize(1)
    expect(signal2).toHaveEmittersSize(0)

    spy.mockReset()
    signal1.write(2)
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)
    expect(signal1).toHaveEmittersSize(1)
    expect(signal2).toHaveEmittersSize(1)

    spy.mockReset()
    signal2.write(4)
    expect(spy).toHaveBeenCalledExactlyOnceWith(6)
    expect(signal1).toHaveEmittersSize(1)
    expect(signal2).toHaveEmittersSize(1)

    spy.mockReset()
    signal1.write(1)
    expect(spy).not.toHaveBeenCalled()
    expect(signal1).toHaveEmittersSize(1)
    expect(signal2).toHaveEmittersSize(0)
  })
})

describe("batching against effect listener", () => {
  it("executes listener on every Signal write", () => {
    const spy = vi.fn()
    const signal1 = Signal(1)
    const signal2 = Signal(2)

    effect((monitor) => {
      spy(signal1.read(monitor) + signal2.read(monitor))
    })

    spy.mockReset()
    signal1.write(2)
    signal2.write(3)
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
      signal1.write(2)
      signal2.write(3)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)
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

  it("executes listener on write", () => {
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
    signal1.write(3)
    expect(spy).toHaveBeenCalledExactlyOnceWith(5)

    spy.mockReset()
    signal2.write(4)
    expect(spy).toHaveBeenCalledExactlyOnceWith(7)

    spy.mockReset()
    signal3.write({
      first: signal2,
      second: signal1,
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(7)
  })
})
