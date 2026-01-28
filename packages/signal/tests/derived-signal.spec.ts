import { Counter } from "~/tools/testing/counter"

import {
  type Monitor,
  type ReadableSignal,
  type ReadonlySignal,
  Signal,
  type SignalOptions,
  type WritableSignal,
  batch,
  effect,
  untracked,
} from "../src"

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
  it("creates a ReadonlySignal", () => {
    const signal = Signal(() => 0)

    // @ts-expect-error should be ReadonlySignal
    expectTypeOf(signal).toEqualTypeOf<Signal<number>>()
    expectTypeOf(signal).toEqualTypeOf<ReadonlySignal<number>>()
  })

  it("reads the value from the source", ({ monitor }) => {
    const initial = { count: 0 }
    const source = Signal(initial)
    const signal = Signal((monitor) => read(source, monitor))

    expect(read(signal, monitor)).toBe(initial)
    expect(read(signal, monitor)).toStrictEqual({ count: 0 })

    const next = { count: 1 }
    write(source, next)
    expect(read(signal, monitor)).toBe(next)
    expect(read(signal, monitor)).toStrictEqual({ count: 1 })
  })

  it("subscribes to Signal source", ({ monitor }) => {
    const source = Signal({ count: 0 }, { equals: Counter.equals })
    const derived = Signal((monitor) => read(source, monitor))
    const spy = vi.fn()

    expect(source).toHaveEmittersSize(0)

    const unsubscribe = effect((monitor) => {
      spy(read(derived, monitor))
    })

    expect(source).toHaveEmittersSize(1)
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    write(source, { count: 1 })
    expect(read(derived, monitor)).toStrictEqual({ count: 1 })
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 1 })
    vi.clearAllMocks()

    write(source, { count: 1 })
    expect(read(derived, monitor)).toStrictEqual({ count: 1 })
    expect(spy).not.toHaveBeenCalled()

    expect(source).toHaveEmittersSize(1)
    unsubscribe()

    expect(source).toHaveEmittersSize(1)
  })

  it("cannot subscribe to none-Signal source", () => {
    let variable = 0
    const signal = Signal(() => variable)
    const spy = vi.fn()

    effect((monitor) => {
      spy(read(signal, monitor))
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(0)
    vi.clearAllMocks()

    variable = 1
    expect(spy).not.toHaveBeenCalled()
  })

  it("does not emit change when derived value does not change", () => {
    const source = Signal(0)
    const derived = Signal((monitor) => read(source, monitor) > 0)
    const spy = vi.fn()

    const unsubscribe = effect((monitor) => {
      spy(read(derived, monitor))
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(false)
    vi.clearAllMocks()

    write(source, 1)
    expect(spy).toHaveBeenCalledExactlyOnceWith(true)
    vi.clearAllMocks()

    write(source, 2)
    expect(spy).not.toHaveBeenCalled()

    unsubscribe()
    expect(spy).not.toHaveBeenCalled()
  })

  it("observes Signal source only after the first read", ({ monitor }) => {
    const source = Signal({ count: 0 }, { equals: Counter.equals })
    const derived = Signal((monitor) => read(source, monitor))

    expect(source).toHaveEmittersSize(0)

    write(source, { count: 1 })
    expect(source).toHaveEmittersSize(0)
    expect(read(derived, monitor)).toStrictEqual({ count: 1 })
    expect(source).toHaveEmittersSize(1)

    write(source, { count: 2 })
    expect(source).toHaveEmittersSize(0)
    expect(read(derived, monitor)).toStrictEqual({ count: 2 })
    expect(source).toHaveEmittersSize(1)

    write(source, { count: 2 })
    expect(source).toHaveEmittersSize(1)
  })

  it("derives the value after subsequent source.write(different) calls", ({ monitor }) => {
    const source = Signal(0)
    const derived = Signal((monitor) => ({ count: read(source, monitor) }))

    const value0 = read(derived, monitor)
    expect(value0).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)

    write(source, 1)
    expect(source).toHaveEmittersSize(0)
    write(source, 2)
    expect(source).toHaveEmittersSize(0)

    const value1 = read(derived, monitor)
    expect(value1).not.toBe(value0)
    expect(value1).toStrictEqual({ count: 2 })
    expect(source).toHaveEmittersSize(1)
  })

  it("derives the value after subsequent source.write(same) source.write(different) calls", ({
    monitor,
  }) => {
    const source = Signal(0)
    const derived = Signal((monitor) => ({ count: read(source, monitor) }))

    const value0 = read(derived, monitor)
    expect(value0).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)

    write(source, 0)
    expect(source).toHaveEmittersSize(1)
    write(source, 1)
    expect(source).toHaveEmittersSize(0)

    const value1 = read(derived, monitor)
    expect(value1).not.toBe(value0)
    expect(value1).toStrictEqual({ count: 1 })
    expect(source).toHaveEmittersSize(1)
  })

  it("does not recalculate the value on subsequent calls", () => {
    const source = Signal(0)
    const derived = Signal((monitor) => ({ count: read(source, monitor) }))

    let first: unknown = null
    let second: unknown = null

    effect((monitor) => {
      first = read(derived, monitor)
    })
    effect((monitor) => {
      second = read(derived, monitor)
    })

    expect(source).toHaveEmittersSize(1)

    const initial = first
    expect(first).toBe(second)
    expect(initial).toStrictEqual({ count: 0 })
  })

  it("does not recalculate for subsequent calls with static monitor", ({ monitor }) => {
    const source = Signal(0)
    const derived = Signal((monitor) => ({ count: read(source, monitor) }))

    expect(read(derived, monitor)).toStrictEqual({ count: 0 })
    expect(read(derived, monitor)).toBe(read(derived, monitor))
    expect(source).toHaveEmittersSize(1)

    write(source, 1)

    expect(read(derived, monitor)).toStrictEqual({ count: 1 })
    expect(source).toHaveEmittersSize(1)
  })

  it("does not recalculate the value when dependency sets the same value", () => {
    const source = Signal(0)
    const derived = Signal((monitor) => ({ count: read(source, monitor) }))

    let first: unknown = null
    let second: unknown = null

    effect((monitor) => {
      first = read(derived, monitor)
    })
    effect((monitor) => {
      second = read(derived, monitor)
    })

    const initial = first

    write(source, 0)

    expect(initial).toBe(first)
    expect(initial).toBe(second)
    expect(first).toBe(second)
    expect(first).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)
  })

  it("recalculates the value on dependency change", () => {
    const source = Signal(0)
    const derived = Signal((monitor) => ({ count: read(source, monitor) }))

    let first: unknown = null
    let second: unknown = null

    effect((monitor) => {
      first = read(derived, monitor)
    })
    effect((monitor) => {
      second = read(derived, monitor)
    })

    const initial = first

    write(source, 1)
    write(source, 2)

    expect(initial).not.toBe(first)
    expect(initial).not.toBe(second)
    expect(first).toBe(second)
    expect(first).toStrictEqual({ count: 2 })
    expect(source).toHaveEmittersSize(1)
  })

  it("keeps source observed after changing to the same derived value", ({ monitor }) => {
    const source = Signal({ count: 0 })
    const derived = Signal((monitor) => read(source, monitor), {
      equals: Counter.equals,
    })

    const value0 = read(derived, monitor)
    expect(value0).toStrictEqual({ count: 0 })

    write(source, { count: 1 })
    const value1 = read(derived, monitor)
    expect(value1).toStrictEqual({ count: 1 })
    expect(value1).not.toBe(value0)

    write(source, { count: 1 })
    const value2 = read(derived, monitor)
    expect(value2).toStrictEqual({ count: 1 })
    expect(value2).toBe(value1)
  })

  it("keeps observing while derived value does not change", () => {
    const source = Signal(0)
    const derived = Signal((monitor) => read(source, monitor) > 0)

    expect(source).toHaveEmittersSize(0)
    expect(derived).toHaveEmittersSize(0)

    let result: unknown = null
    effect((monitor) => {
      result = read(derived, monitor)
    })

    expect(source).toHaveEmittersSize(1)
    expect(derived).toHaveEmittersSize(1)
    expect(result).toBe(false)

    write(source, 1)
    expect(source).toHaveEmittersSize(1)
    expect(derived).toHaveEmittersSize(1)
    expect(result).toBe(true)

    write(source, 2)
    expect(source).toHaveEmittersSize(1)
    expect(derived).toHaveEmittersSize(1)
    expect(result).toBe(true)

    write(source, 0)
    expect(source).toHaveEmittersSize(1)
    expect(derived).toHaveEmittersSize(1)
    expect(result).toBe(false)
  })

  it("recalculates the value for nested derived Signals", () => {
    const email = Signal("")
    const password = Signal("")
    const isEmailEmpty = Signal((monitor) => read(email, monitor) === "")
    const isPasswordEmpty = Signal((monitor) => read(password, monitor) === "")
    const isFormEmpty = Signal((monitor) => ({
      email: read(isEmailEmpty, monitor),
      password: read(isPasswordEmpty, monitor),
    }))

    let result: unknown = null
    effect((monitor) => {
      result = read(isFormEmpty, monitor)
    })

    const value0 = result
    expect(value0).toStrictEqual({
      email: true,
      password: true,
    })

    write(email, "t")
    const value1 = result
    expect(value1).toStrictEqual({
      email: false,
      password: true,
    })
    expect(value1).not.toBe(value0)

    write(email, "te")
    const value2 = result
    expect(value2).toBe(value1)

    write(password, "q")
    const value3 = result
    expect(value3).toStrictEqual({
      email: false,
      password: false,
    })
    expect(value3).not.toBe(value2)

    write(email, "test")
    write(password, "qwerty")
    const value4 = result
    expect(value4).toBe(value3)

    write(email, "")
    write(password, "")

    const value5 = result
    expect(value5).toStrictEqual({
      email: true,
      password: true,
    })
    expect(value5).not.toBe(value4)
  })

  it("do not re-subscribe to dependencies when they are not in use", () => {
    const source = Signal(1)
    const condition = Signal(false)
    const derived = Signal((monitor) => ({
      count: read(condition, monitor) ? read(source, monitor) : 0,
    }))

    let result: unknown = null
    effect((monitor) => {
      result = read(derived, monitor)
    })

    const initial = result
    expect(initial).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(0)
    expect(condition).toHaveEmittersSize(1)

    write(source, 0)
    expect(result).toBe(initial)
    expect(source).toHaveEmittersSize(0)
    expect(condition).toHaveEmittersSize(1)

    write(condition, true)
    expect(result).not.toBe(initial)
    expect(result).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)
    expect(condition).toHaveEmittersSize(1)

    write(source, 1)
    expect(result).toStrictEqual({ count: 1 })
    expect(source).toHaveEmittersSize(1)
    expect(condition).toHaveEmittersSize(1)

    write(condition, false)
    expect(result).not.toBe(initial)
    expect(result).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(0)
    expect(condition).toHaveEmittersSize(1)
  })

  it("does not call equals on init", () => {
    const source = Signal({ count: 0 })

    Signal((monitor) => read(source, monitor), {
      equals: Counter.equals,
    })

    expect(Counter.equals).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(0)
  })

  it("does not call equals on first read", ({ monitor }) => {
    const source = Signal({ count: 0 })
    const derived = Signal((monitor) => read(source, monitor), {
      equals: Counter.equals,
    })

    expect(read(derived, monitor)).toStrictEqual({ count: 0 })
    expect(Counter.equals).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(1)
  })

  it("does not calls equals on subsequent calls when the source does not change", ({ monitor }) => {
    const source = Signal({ count: 0 })
    const derived = Signal((monitor) => read(source, monitor), {
      equals: Counter.equals,
    })

    const counter = read(derived, monitor)
    expect(counter).toStrictEqual({ count: 0 })
    expect(read(derived, monitor)).toBe(counter)
    expect(read(derived, monitor)).toBe(counter)
    expect(read(derived, monitor)).toBe(counter)
    expect(read(derived, monitor)).toBe(counter)

    expect(Counter.equals).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(1)
  })

  it("does not call equals function when an unobserved source changes", ({ monitor }) => {
    const source = Signal({ count: 0 })
    const derived = Signal((monitor) => read(source, monitor), {
      equals: Counter.equals,
    })

    write(source, { count: 1 })

    expect(Counter.equals).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(0)

    expect(read(derived, monitor)).toStrictEqual({ count: 1 })
    expect(Counter.equals).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(1)
  })

  it("calls equals function only when an observed source setter is called", ({ monitor }) => {
    const source = Signal({ count: 0 })
    const derived = Signal((monitor) => read(source, monitor), {
      equals: Counter.equals,
    })

    expect(read(derived, monitor)).toStrictEqual({ count: 0 })
    expect(Counter.equals).not.toHaveBeenCalled()

    write(source, { count: 1 })
    expect(Counter.equals).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    expect(source).toHaveEmittersSize(0)
    expect(read(derived, monitor)).toStrictEqual({ count: 1 })
    expect(Counter.equals).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(1)
  })

  describe.each([
    ["default", undefined],
    ["null", null],
  ])("when equals is %s", (_, equals) => {
    it("uses Object.is as equals", ({ monitor }) => {
      const source = Signal({ count: 0 }, { equals: Counter.equals })
      const derived = Signal(
        (monitor) => ({
          isMoreThanZero: read(source, monitor).count > 0,
        }),
        { equals },
      )
      const value0 = read(derived, monitor)

      expect(Object.is).not.toHaveBeenCalled()
      expect(value0).toStrictEqual({ isMoreThanZero: false })
      vi.clearAllMocks()

      write(source, { count: 1 })
      expect(Object.is).toHaveBeenCalledExactlyOnceWith(value0, {
        isMoreThanZero: true,
      })
      vi.clearAllMocks()

      const value1 = read(derived, monitor)
      expect(Object.is).not.toHaveBeenCalled()
      expect(value1).not.toBe(value0)
      expect(value1).toStrictEqual({ isMoreThanZero: true })
      vi.clearAllMocks()

      write(source, { count: 2 })
      expect(Object.is).toHaveBeenCalledExactlyOnceWith(value1, {
        isMoreThanZero: true,
      })
      vi.clearAllMocks()

      const value2 = read(derived, monitor)
      expect(Object.is).not.toHaveBeenCalled()
      expect(value2).not.toBe(value1)
      expect(value2).toStrictEqual({ isMoreThanZero: true })
    })
  })

  it("assigns custom function as equals", ({ monitor }) => {
    const source = Signal({ count: 0 })
    const derived = Signal((monitor) => read(source, monitor), {
      equals: Counter.equals,
    })

    const value0 = read(derived, monitor)

    write(source, { count: 0 })
    expect(Counter.equals).toHaveBeenCalledExactlyOnceWith(value0, { count: 0 })
    vi.clearAllMocks()

    const value1 = read(derived, monitor)
    expect(Counter.equals).not.toHaveBeenCalled()
    expect(value0).toBe(value1)
    expect(value0).toStrictEqual({ count: 0 })

    write(source, { count: 1 })
    expect(Counter.equals).toHaveBeenCalledExactlyOnceWith(value1, { count: 1 })
    vi.clearAllMocks()

    const value2 = read(derived, monitor)
    expect(Counter.equals).not.toHaveBeenCalled()
    expect(value2).not.toBe(value1)
    expect(value2).toStrictEqual({ count: 1 })
  })
})

describe.concurrent("Signal(getter) garbage collection", () => {
  it("cleanups immediately when source.write is called with the different value", ({ monitor }) => {
    const source = Signal(0)

    ;(() => {
      const derived = Signal((monitor) => ({
        count: source.read(monitor),
      }))

      expect(source).toHaveEmittersSize(0)

      expect(derived.read(monitor)).toStrictEqual({ count: 0 })
      expect(source).toHaveEmittersSize(1)
      expect(derived).toHaveEmittersSize(0)
    })()

    expect(source).toHaveEmittersSize(1)

    source.write(1)
    expect(source).toHaveEmittersSize(0)
  })

  it("cleanups the WeakRef when source.write is called with the same value", async ({
    monitor,
  }) => {
    const source = Signal(0)

    ;(() => {
      const derived = Signal((monitor) => ({
        count: source.read(monitor),
      }))

      expect(source).toHaveEmittersSize(0)

      expect(derived.read(monitor)).toStrictEqual({ count: 0 })
      expect(source).toHaveEmittersSize(1)
      expect(derived).toHaveEmittersSize(0)
    })()

    expect(source).toHaveEmittersSize(1)

    source.write(0)
    expect(source).toHaveEmittersSize(1)

    await global.gc?.({ execution: "async" })
    expect(source).toHaveEmittersSize(0)
  })

  it("cleanups the WeakRef", async ({ monitor }) => {
    const source = Signal(0)
    let derived: null | ReadonlySignal<Counter> = Signal((monitor) => ({
      count: source.read(monitor),
    }))

    expect(derived.read(monitor)).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)
    expect(derived).toHaveEmittersSize(0)

    derived = null

    await global.gc?.({ execution: "async" })
    expect(source).toHaveEmittersSize(0)
  })

  it("cleanups the WeakRef from clojure", async ({ monitor }) => {
    const source = Signal(0)

    ;(() => {
      const derived = Signal((monitor) => ({
        count: source.read(monitor),
      }))

      expect(derived.read(monitor)).toStrictEqual({ count: 0 })
      expect(source).toHaveEmittersSize(1)
      expect(derived).toHaveEmittersSize(0)
    })()

    await global.gc?.({ execution: "async" })
    expect(source).toHaveEmittersSize(0)
  })

  it("cleanups the WeakRef from effect", async () => {
    const source = Signal(0)

    ;(() => {
      const derived = Signal((monitor) => ({
        count: source.read(monitor),
      }))

      const spy = vi.fn()

      const cleanup = effect((monitor) => {
        spy(derived.read(monitor))
      })

      expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 0 })

      expect(source).toHaveEmittersSize(1)
      expect(derived).toHaveEmittersSize(1)

      cleanup()
      expect(source).toHaveEmittersSize(1)
      expect(derived).toHaveEmittersSize(0)
    })()

    await global.gc?.({ execution: "async" })
    expect(source).toHaveEmittersSize(0)
  })

  it("cleanups the WeakRef from untracked", async () => {
    const source = Signal(0)

    ;(() => {
      const derived = Signal((monitor) => ({
        count: source.read(monitor),
      }))

      expect(untracked(derived)).toStrictEqual({ count: 0 })
      expect(source).toHaveEmittersSize(1)
      expect(derived).toHaveEmittersSize(0)
    })()

    await global.gc?.({ execution: "async" })
    expect(source).toHaveEmittersSize(0)
  })

  it("cleanups only unreachable dependencies", async ({ monitor }) => {
    const source = Signal(0)
    const derived1 = Signal((monitor) => ({
      count: source.read(monitor),
    }))

    expect(derived1.read(monitor)).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)
    ;(() => {
      const derived2 = Signal((monitor) => ({
        count: source.read(monitor),
      }))

      expect(derived2.read(monitor)).toStrictEqual({ count: 0 })
      expect(source).toHaveEmittersSize(2)
      expect(derived2).toHaveEmittersSize(0)
    })()
    ;(() => {
      const derived3 = Signal((monitor) => ({
        count: source.read(monitor),
      }))

      expect(derived3.read(monitor)).toStrictEqual({ count: 0 })
      expect(source).toHaveEmittersSize(3)
      expect(derived3).toHaveEmittersSize(0)
    })()

    await global.gc?.({ execution: "async" })
    expect(source).toHaveEmittersSize(1)
  })
})

describe("Signal(source)", () => {
  it("creates an Signal from a source", () => {
    const source = Signal(0)
    const signal = Signal(source)

    expectTypeOf(signal).toEqualTypeOf<ReadonlySignal<number>>()
  })

  it("allows source as a ReadonlySignal", () => {
    const source = Signal(() => 0)
    const signal = Signal(source)

    expectTypeOf(signal).toEqualTypeOf<ReadonlySignal<number>>()
  })

  it("allows source as a ReadableSignal", ({ monitor }) => {
    class Custom implements ReadableSignal<number> {
      public readonly counter = Signal(0)

      public read(monitor: Monitor): number {
        return this.counter.read(monitor)
      }
    }

    const source = new Custom()
    const derived = Signal(source)

    expect(derived.read(monitor)).toBe(0)

    source.counter.write(1)

    expect(derived.read(monitor)).toBe(1)
  })
})

describe("Signal(source, options)", () => {
  it("creates an Signal from a source", () => {
    const source = Signal<Counter>({ count: 0 })
    const signal = Signal(source, { equals: Counter.equals })

    expectTypeOf(signal).toEqualTypeOf<ReadonlySignal<Counter>>()
  })

  it("allows source as a ReadonlySignal", () => {
    const source = Signal<Counter>(() => ({ count: 0 }))
    const signal = Signal(source, { equals: Counter.equals })

    expectTypeOf(signal).toEqualTypeOf<ReadonlySignal<Counter>>()
  })

  it("allows source as a ReadableSignal", ({ monitor }) => {
    class Custom implements ReadableSignal<Counter> {
      public readonly counter = Signal({ count: 0 })

      public read(monitor: Monitor): Counter {
        return this.counter.read(monitor)
      }
    }

    const source = new Custom()
    const derived = Signal(source, { equals: Counter.equals })

    expect(derived.read(monitor)).toStrictEqual({ count: 0 })
    expect(Counter.equals).not.toHaveBeenCalled()

    source.counter.write(Counter.inc)

    expect(derived.read(monitor)).toStrictEqual({ count: 1 })
    expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
  })
})

describe("Signal(getter, setter, options?)", () => {
  it("creates an Signal", () => {
    let variable = 0
    const signal = Signal(
      () => variable,
      (value) => {
        variable = value
      },
    )

    expectTypeOf(signal).toEqualTypeOf<Signal<number>>()
    expectTypeOf(signal).toMatchTypeOf<ReadonlySignal<number>>()
  })

  it("allows source as a Signal", ({ monitor }) => {
    const source = Signal(0)
    const signal = Signal(source, () => {
      // noop
    })

    expect(signal.read(monitor)).toBe(0)
  })

  it("allows source as a ReadonlySignal", ({ monitor }) => {
    const source = Signal(() => 0)
    const derived = Signal(source, () => {
      // noop
    })

    expect(derived.read(monitor)).toBe(0)
  })

  it("allows source as a ReadableSignal", ({ monitor }) => {
    class Custom implements ReadableSignal<number> {
      public readonly counter = Signal(0)

      public read(monitor: Monitor): number {
        return this.counter.read(monitor)
      }
    }

    const source = new Custom()
    const derived = Signal(source, () => {
      // noop
    })

    expect(derived.read(monitor)).toBe(0)

    source.counter.write(1)

    expect(derived.read(monitor)).toBe(1)
  })

  it("does not allow setter as a ReadonlySignal", ({ monitor }) => {
    const destination = Signal(() => 0)
    // @ts-expect-error should be Signal
    const signal = Signal(() => 2, [], destination)

    expect(signal.read(monitor)).toBe(2)
  })

  it("subscribes to Signal source and back", () => {
    const source = Signal({ count: 0 }, { equals: Counter.equals })
    const signal = Signal(
      (monitor) => source.read(monitor),
      (counter) => source.write(counter),
    )
    const spySignal = vi.fn()
    const spySource = vi.fn()

    effect((monitor) => {
      spySignal(signal.read(monitor))
    })
    effect((monitor) => {
      spySource(source.read(monitor))
    })

    expect(spySignal).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    source.write({ count: 1 })
    expect(spySignal).toHaveBeenCalledExactlyOnceWith({ count: 1 })
    vi.clearAllMocks()

    source.write({ count: 1 })
    expect(spySignal).not.toHaveBeenCalled()
    vi.clearAllMocks()

    signal.write({ count: 1 })
    expect(spySource).not.toHaveBeenCalled()
    vi.clearAllMocks()

    signal.write({ count: 2 })
    expect(spySource).toHaveBeenCalledExactlyOnceWith({ count: 2 })
  })

  it("subscribes to ReadableSignal/WritableSignal and back", () => {
    class Custom implements ReadableSignal<{ count: number }>, WritableSignal<{ count: number }> {
      private readonly counter = Signal(0)

      public read(monitor: Monitor): { count: number } {
        return { count: this.counter.read(monitor) }
      }

      public write(value: { count: number }): void {
        this.counter.write(value.count)
      }
    }

    const source = new Custom()
    const signal = Signal(
      (monitor) => source.read(monitor),
      (counter) => source.write(counter),
    )
    const spySignal = vi.fn()
    const spySource = vi.fn()

    effect((monitor) => {
      spySignal(signal.read(monitor))
    })
    effect((monitor) => {
      spySource(source.read(monitor))
    })

    expect(spySignal).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    source.write({ count: 1 })
    expect(spySignal).toHaveBeenCalledExactlyOnceWith({ count: 1 })
    vi.clearAllMocks()

    source.write({ count: 1 })
    expect(spySignal).not.toHaveBeenCalled()
    vi.clearAllMocks()

    signal.write({ count: 1 })
    expect(spySource).not.toHaveBeenCalled()
    vi.clearAllMocks()

    signal.write({ count: 2 })
    expect(spySource).toHaveBeenCalledExactlyOnceWith({ count: 2 })
  })

  it("assigns custom function as equals", ({ monitor }) => {
    const source = Signal({ count: 0 })
    const signal = Signal(
      (monitor) => source.read(monitor),
      (counter) => source.write(counter),
      {
        equals: Counter.equals,
      },
    )

    const value0 = signal.read(monitor)

    signal.write({ count: 0 })
    expect(Counter.equals).toHaveBeenCalledExactlyOnceWith(value0, { count: 0 })
    vi.clearAllMocks()

    const value1 = signal.read(monitor)
    expect(Counter.equals).not.toHaveBeenCalled()
    expect(value1).toBe(value0)

    signal.write({ count: 1 })
    expect(Counter.equals).toHaveBeenCalledExactlyOnceWith(value1, { count: 1 })
    vi.clearAllMocks()

    const value2 = signal.read(monitor)
    expect(Counter.equals).not.toHaveBeenCalled()
    expect(value2).not.toBe(value1)
    expect(value2).toStrictEqual({ count: 1 })
  })

  it("batches setter", () => {
    const signal1 = Signal(1)
    const signal2 = Signal(2)
    const signal3 = Signal(3)
    const derived = Signal(
      (monitor) => signal1.read(monitor) + signal2.read(monitor) + signal3.read(monitor),
      (x) => {
        signal1.write(x)
        signal2.write(x)
        signal3.write(x)
      },
    )
    const spy = vi.fn()

    effect((monitor) => {
      spy(derived.read(monitor))
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith(6)
    vi.clearAllMocks()

    derived.write(4)

    expect(spy).toHaveBeenCalledExactlyOnceWith(12)
    vi.clearAllMocks()

    derived.write(4)

    expect(spy).not.toHaveBeenCalled()
  })
})

function setupSignal<T>(initialValue: T, options?: SignalOptions<T>) {
  const signal = Signal(initialValue, options)

  return { signal }
}

function setupDerivedSignalFromSignal({
  getterShortcut,
  setterShortcut,
}: {
  getterShortcut: boolean
  setterShortcut: boolean
}) {
  return <T>(initialValue: T, options?: SignalOptions<T>) => {
    const source = Signal(initialValue)
    const signal = Signal(
      getterShortcut ? source : (monitor) => source.read(monitor),
      setterShortcut ? source : (value) => source.write(value),
      options,
    )

    return {
      signal,
      read: (monitor: Monitor) => source.read(monitor),
      write: (value: T) => {
        source.write(value)
      },
    }
  }
}

describe.each([
  ["DirectSignal", setupSignal],
  [
    "Derived Signal from an Signal",
    setupDerivedSignalFromSignal({
      getterShortcut: false,
      setterShortcut: false,
    }),
  ],
  [
    "Derived Signal from an Signal with getter shortcut",
    setupDerivedSignalFromSignal({
      getterShortcut: true,
      setterShortcut: false,
    }),
  ],
  [
    "Derived Signal from an Signal with setter shortcut",
    setupDerivedSignalFromSignal({
      getterShortcut: false,
      setterShortcut: true,
    }),
  ],
  [
    "Derived Signal from an Signal with both getter and setter shortcuts",
    setupDerivedSignalFromSignal({
      getterShortcut: true,
      setterShortcut: true,
    }),
  ],
])("Signal() from %s", (_, setup) => {
  describe("Signal#write(value)", () => {
    const { signal } = setup({ count: 0 })

    it("updates value", ({ monitor }) => {
      const next = { count: 1 }
      signal.write(next)
      expect(signal.read(monitor)).toBe(next)
    })

    it("updates with the same value", ({ monitor }) => {
      const next = { count: 1 }
      signal.write(next)
      expect(signal.read(monitor)).toBe(next)
    })

    it("updates with equal value", ({ monitor }) => {
      const prev = signal.read(monitor)
      signal.write(prev)
      expect(signal.read(monitor)).toBe(prev)
    })
  })

  describe("Signal#write(transform)", () => {
    it("updates value", ({ monitor }) => {
      const { signal } = setup({ count: 0 })

      signal.write(Counter.inc)
      expect(signal.read(monitor)).toStrictEqual({ count: 1 })
    })

    it("keeps the value", ({ monitor }) => {
      const initial = { count: 0 }
      const { signal } = setup(initial)

      signal.write((counter) => counter)
      expect(signal.read(monitor)).toBe(initial)
    })

    it("updates with the same value", ({ monitor }) => {
      const initial = { count: 0 }
      const { signal } = setup(initial)

      signal.write(Counter.clone)
      expect(signal.read(monitor)).not.toBe(initial)
      expect(signal.read(monitor)).toStrictEqual(initial)
    })

    it("keeps the value if it is equal", ({ monitor }) => {
      const initial = { count: 0 }
      const { signal } = setup(initial, { equals: Counter.equals })

      signal.write(Counter.clone)
      expect(signal.read(monitor)).toBe(initial)
      expect(signal.read(monitor)).toStrictEqual(initial)
    })

    it("updates with the equal value", ({ monitor }) => {
      const initial = { count: 0 }
      const { signal } = setup(initial)

      signal.write(() => initial)
      expect(signal.read(monitor)).toBe(initial)
    })
  })

  describe("Signal#clone()", () => {
    it("creates new Signal", ({ monitor }) => {
      const { signal: signal1 } = setup({ count: 0 })
      const signal2 = signal1.clone()

      expect(signal1).not.toBe(signal2)
      expect(signal1.read(monitor)).toBe(signal2.read(monitor))
    })

    it("does not write source value when clone updates", ({ monitor }) => {
      const { signal: signal1 } = setup({ count: 0 })
      const signal2 = signal1.clone()

      signal2.write({ count: 1 })

      expect(signal1.read(monitor)).toStrictEqual({ count: 0 })
      expect(signal2.read(monitor)).toStrictEqual({ count: 1 })
    })

    it("does not write clone value when source updates", ({ monitor }) => {
      const { signal: signal1 } = setup({ count: 0 })
      const signal2 = signal1.clone()

      signal1.write({ count: 1 })

      expect(signal1.read(monitor)).toStrictEqual({ count: 1 })
      expect(signal2.read(monitor)).toStrictEqual({ count: 0 })
    })

    it("transfers comparator from source Signal", () => {
      const { signal: signal1 } = setup({ count: 0 })
      const signal2 = signal1.clone()

      expect(Object.is).not.toHaveBeenCalled()
      signal2.write({ count: 1 })

      expect(Object.is).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })

    it("transfers custom comparator from source Signal", () => {
      const { signal: signal1 } = setup({ count: 0 }, { equals: Counter.equals })
      const signal2 = signal1.clone()

      expect(Counter.equals).not.toHaveBeenCalled()
      signal2.write({ count: 1 })

      expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })
  })

  describe("Signal#clone(options)", () => {
    it("inherits custom comparator by empty options", () => {
      const { signal: signal1 } = setup({ count: 0 }, { equals: Counter.equals })
      const signal2 = signal1.clone({})

      expect(Counter.equals).not.toHaveBeenCalled()
      signal2.write({ count: 1 })

      expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })

    it("inherits custom comparator by options.equals: undefined", () => {
      const { signal: signal1 } = setup({ count: 0 }, { equals: Counter.equals })
      const signal2 = signal1.clone({ equals: undefined })

      expect(Counter.equals).not.toHaveBeenCalled()
      signal2.write({ count: 1 })

      expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })

    it("overrides custom comparator as Object.is by options.equals: null", () => {
      const { signal: signal1 } = setup({ count: 0 }, { equals: Counter.equals })
      const signal2 = signal1.clone({ equals: null })

      expect(Object.is).not.toHaveBeenCalled()
      signal2.write({ count: 1 })

      expect(Object.is).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })

    it("overrides comparator by custom options.equals", () => {
      const { signal: signal1 } = setup({ count: 0 })
      const signal2 = signal1.clone({ equals: Counter.equals })

      expect(Counter.equals).not.toHaveBeenCalled()
      signal2.write({ count: 1 })

      expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })
  })

  describe("Signal#clone(transform)", () => {
    it("creates new Signal", ({ monitor }) => {
      const { signal: signal1 } = setup({ count: 0 })
      const signal2 = signal1.clone(Counter.clone)

      expect(signal1).not.toBe(signal2)
      expect(signal1.read(monitor)).not.toBe(signal2.read(monitor))
      expect(signal1.read(monitor)).toStrictEqual(signal2.read(monitor))
    })

    it("keeps comparator from source", () => {
      const { signal: signal1 } = setup({ count: 0 }, { equals: Counter.equals })
      const signal2 = signal1.clone(Counter.clone)

      expect(Counter.equals).not.toHaveBeenCalled()
      signal2.write({ count: 1 })

      expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })

    it("creates new nested Signal with clone(transform)", ({ monitor }) => {
      const { signal: signal1 } = setup({
        count: setup(0).signal,
        name: setup("John").signal,
      })
      const signal2 = signal1.clone(({ count, name }) => ({
        count: count.clone(),
        name: name.clone(),
      }))

      expect(signal1).not.toBe(signal2)
      expect(signal1.read(monitor)).not.toBe(signal2.read(monitor))
      expect(signal1.read(monitor).count).not.toBe(signal2.read(monitor).count)
      expect(signal1.read(monitor).name).not.toBe(signal2.read(monitor).name)
      expect({
        count: signal1.read(monitor).count.read(monitor),
        name: signal1.read(monitor).name.read(monitor),
      }).toStrictEqual({
        count: signal2.read(monitor).count.read(monitor),
        name: signal2.read(monitor).name.read(monitor),
      })

      // the nested signals are independent
      signal1.read(monitor).count.write(1)
      expect(signal1.read(monitor).count.read(monitor)).toBe(1)
      expect(signal2.read(monitor).count.read(monitor)).toBe(0)

      signal1.read(monitor).name.write("Doe")
      expect(signal1.read(monitor).name.read(monitor)).toBe("Doe")
      expect(signal2.read(monitor).name.read(monitor)).toBe("John")
    })

    it("creates shallow nested Signal with clone()", ({ monitor }) => {
      const { signal: signal1 } = setup({
        count: setup(0).signal,
        name: setup("John").signal,
      })
      const signal2 = signal1.clone()

      expect(signal1).not.toBe(signal2)
      expect(signal1.read(monitor)).toBe(signal2.read(monitor))
      expect(signal1.read(monitor).count).toBe(signal2.read(monitor).count)
      expect(signal1.read(monitor).name).toBe(signal2.read(monitor).name)
      expect({
        count: signal1.read(monitor).count.read(monitor),
        name: signal1.read(monitor).name.read(monitor),
      }).toStrictEqual({
        count: signal1.read(monitor).count.read(monitor),
        name: signal1.read(monitor).name.read(monitor),
      })

      // the nested signals are dependent
      signal1.read(monitor).count.write(1)
      expect(signal1.read(monitor).count.read(monitor)).toBe(1)
      expect(signal2.read(monitor).count.read(monitor)).toBe(1)

      signal1.read(monitor).name.write("Doe")
      expect(signal1.read(monitor).name.read(monitor)).toBe("Doe")
      expect(signal2.read(monitor).name.read(monitor)).toBe("Doe")
    })
  })

  describe("Signal#clone(transform, options)", () => {
    it("creates new Signal with custom equals", ({ monitor }) => {
      const { signal: signal1 } = setup({ count: 0 })
      const signal2 = signal1.clone(Counter.clone, {
        equals: Counter.equals,
      })

      expect(signal1).not.toBe(signal2)
      expect(signal1.read(monitor)).not.toBe(signal2.read(monitor))
      expect(signal1.read(monitor)).toStrictEqual(signal2.read(monitor))

      expect(Counter.equals).not.toHaveBeenCalled()
      signal2.write({ count: 1 })

      expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })
  })

  describe("Signal#toJSON()", () => {
    it("converts value to JSON", () => {
      const { signal } = setup({
        number: 0,
        string: "biba",
        boolean: false,
        undefined,
        null: null,
        array: [1, "boba", true, undefined, null],
        object: {
          number: 2,
          string: "baba",
          boolean: false,
          undefined,
          null: null,
        },
      })

      expect(JSON.stringify(signal)).toMatchInlineSnapshot(
        `"{"number":0,"string":"biba","boolean":false,"null":null,"array":[1,"boba",true,null,null],"object":{"number":2,"string":"baba","boolean":false,"null":null}}"`,
      )
    })

    it("applies replace fields", () => {
      const { signal } = setup({ first: 1, second: 2, third: 3 })

      expect(JSON.stringify(signal, ["first", "third"])).toMatchInlineSnapshot(
        `"{"first":1,"third":3}"`,
      )
    })

    it("applies replace function", () => {
      const { signal } = setup({ first: 1, second: 2, third: 3 })

      expect(
        JSON.stringify(signal, (_key, value: unknown) => {
          if (typeof value === "number") {
            return value * 2
          }

          return value
        }),
      ).toMatchInlineSnapshot(`"{"first":2,"second":4,"third":6}"`)
    })

    it("applies spaces", () => {
      const { signal } = setup({ first: 1, second: 2, third: 3 })

      expect(JSON.stringify(signal, null, 2)).toMatchInlineSnapshot(
        `
        "{
          "first": 1,
          "second": 2,
          "third": 3
        }"
      `,
      )
    })

    it("stringifies nested Signal", () => {
      const { signal } = setup({
        first: setup(1).signal,
        second: setup([setup("1").signal, setup(false).signal]).signal,
      })

      expect(JSON.stringify(signal, null, 2)).toMatchInlineSnapshot(`
        "{
          "first": 1,
          "second": [
            "1",
            false
          ]
        }"
      `)
    })
  })

  describe("Signal#toString", () => {
    it.each([
      ["number", 1, "1"],
      ["boolean", false, "false"],
      ["null", null, "null"],
      ["undefined", undefined, "undefined"],
      ["array", [1, 2, setup(3).signal], "1,2,3"],
      ["object", { first: 1 }, "[object Object]"],
    ])("converts %s value to string", (_, value, expected) => {
      const { signal } = setup(value)

      expect(String(signal)).toBe(expected)
    })
  })
})
