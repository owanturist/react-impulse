import { act, renderHook } from "@testing-library/react"
import { useState } from "react"

import {
  Impulse,
  type ImpulseOptions,
  type Monitor,
  type ReadableImpulse,
  type ReadonlyImpulse,
  type WritableImpulse,
  batch,
  effect,
  untracked,
  useComputed,
} from "../src"

import { Counter } from "./common"

describe.each<{
  name: string
  read: <T>(impulse: ReadonlyImpulse<T>, monitor: Monitor) => T
  update: <T>(impulse: Impulse<T>, setter: T | ((currentValue: T, monitor: Monitor) => T)) => void
}>([
  {
    name: "1x read / 1x update",
    read: (impulse, monitor) => impulse.read(monitor),
    update: (impulse, setter) => {
      impulse.update(setter)
    },
  },

  {
    name: "1x read / 2x update",
    read: (impulse, monitor) => impulse.read(monitor),
    update: (impulse, setter) => {
      impulse.update(setter)
      impulse.update(setter)
    },
  },
  {
    name: "1x read / 2x batched update",
    read: (impulse, monitor) => impulse.read(monitor),
    update: (impulse, setter) => {
      batch(() => {
        impulse.update(setter)
        impulse.update(setter)
      })
    },
  },

  {
    name: "2x read / 1x update",
    read: (impulse, monitor) => {
      impulse.read(monitor)

      return impulse.read(monitor)
    },
    update: (impulse, setter) => {
      impulse.update(setter)
    },
  },

  {
    name: "2x read / 2x update",
    read: (impulse, monitor) => {
      impulse.read(monitor)

      return impulse.read(monitor)
    },
    update: (impulse, setter) => {
      impulse.update(setter)
      impulse.update(setter)
    },
  },
  {
    name: "2x read / 2x batched update",
    read: (impulse, monitor) => {
      impulse.read(monitor)

      return impulse.read(monitor)
    },
    update: (impulse, setter) => {
      batch(() => {
        impulse.update(setter)
        impulse.update(setter)
      })
    },
  },
])("Impulse(getter, options?) when $name", ({ read, update }) => {
  it("creates a ReadonlyImpulse", () => {
    const impulse = Impulse(() => 0)

    // @ts-expect-error should be ReadonlyImpulse
    expectTypeOf(impulse).toEqualTypeOf<Impulse<number>>()
    expectTypeOf(impulse).toEqualTypeOf<ReadonlyImpulse<number>>()
  })

  it("reads the value from the source", ({ monitor }) => {
    const initial = { count: 0 }
    const source = Impulse(initial)
    const impulse = Impulse((monitor) => read(source, monitor))

    expect(read(impulse, monitor)).toBe(initial)
    expect(read(impulse, monitor)).toStrictEqual({ count: 0 })

    const next = { count: 1 }
    update(source, next)
    expect(read(impulse, monitor)).toBe(next)
    expect(read(impulse, monitor)).toStrictEqual({ count: 1 })
  })

  it("subscribes to Impulse source", ({ monitor }) => {
    const source = Impulse({ count: 0 }, { equals: Counter.equals })
    const derived = Impulse((monitor) => read(source, monitor))
    const spy = vi.fn()

    expect(source).toHaveEmittersSize(0)

    const unsubscribe = effect((monitor) => {
      spy(read(derived, monitor))
    })

    expect(source).toHaveEmittersSize(1)
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    update(source, { count: 1 })
    expect(read(derived, monitor)).toStrictEqual({ count: 1 })
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 1 })
    vi.clearAllMocks()

    update(source, { count: 1 })
    expect(read(derived, monitor)).toStrictEqual({ count: 1 })
    expect(spy).not.toHaveBeenCalled()

    expect(source).toHaveEmittersSize(1)
    unsubscribe()

    expect(source).toHaveEmittersSize(1)
  })

  it("cannot subscribe to none-Impulse source", () => {
    let variable = 0
    const impulse = Impulse(() => variable)
    const spy = vi.fn()

    effect((monitor) => {
      spy(read(impulse, monitor))
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(0)
    vi.clearAllMocks()

    variable = 1
    expect(spy).not.toHaveBeenCalled()
  })

  it("does not emit change when derived value does not change", () => {
    const source = Impulse(0)
    const derived = Impulse((monitor) => read(source, monitor) > 0)
    const spy = vi.fn()

    const unsubscribe = effect((monitor) => {
      spy(read(derived, monitor))
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(false)
    vi.clearAllMocks()

    update(source, 1)
    expect(spy).toHaveBeenCalledExactlyOnceWith(true)
    vi.clearAllMocks()

    update(source, 2)
    expect(spy).not.toHaveBeenCalled()

    unsubscribe()
    expect(spy).not.toHaveBeenCalled()
  })

  it("observes Impulse source only after the first read", ({ monitor }) => {
    const source = Impulse({ count: 0 }, { equals: Counter.equals })
    const derived = Impulse((monitor) => read(source, monitor))

    expect(source).toHaveEmittersSize(0)

    update(source, { count: 1 })
    expect(source).toHaveEmittersSize(0)
    expect(read(derived, monitor)).toStrictEqual({ count: 1 })
    expect(source).toHaveEmittersSize(1)

    update(source, { count: 2 })
    expect(source).toHaveEmittersSize(0)
    expect(read(derived, monitor)).toStrictEqual({ count: 2 })
    expect(source).toHaveEmittersSize(1)

    update(source, { count: 2 })
    expect(source).toHaveEmittersSize(1)
  })

  it("derives the value after subsequent source.update(different) calls", ({ monitor }) => {
    const source = Impulse(0)
    const derived = Impulse((monitor) => ({ count: read(source, monitor) }))

    const value0 = read(derived, monitor)
    expect(value0).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)

    update(source, 1)
    expect(source).toHaveEmittersSize(0)
    update(source, 2)
    expect(source).toHaveEmittersSize(0)

    const value1 = read(derived, monitor)
    expect(value1).not.toBe(value0)
    expect(value1).toStrictEqual({ count: 2 })
    expect(source).toHaveEmittersSize(1)
  })

  it("derives the value after subsequent source.update(same) source.update(different) calls", ({
    monitor,
  }) => {
    const source = Impulse(0)
    const derived = Impulse((monitor) => ({ count: read(source, monitor) }))

    const value0 = read(derived, monitor)
    expect(value0).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)

    update(source, 0)
    expect(source).toHaveEmittersSize(1)
    update(source, 1)
    expect(source).toHaveEmittersSize(0)

    const value1 = read(derived, monitor)
    expect(value1).not.toBe(value0)
    expect(value1).toStrictEqual({ count: 1 })
    expect(source).toHaveEmittersSize(1)
  })

  it("does not recalculate the value on subsequent calls", () => {
    const source = Impulse(0)
    const derived = Impulse((monitor) => ({ count: read(source, monitor) }))

    const { result: first } = renderHook(() => useComputed((monitor) => read(derived, monitor)))

    const { result: second } = renderHook(() => useComputed((monitor) => read(derived, monitor)))

    expect(source).toHaveEmittersSize(1)

    const initial = first.current
    expect(first.current).toBe(second.current)
    expect(initial).toStrictEqual({ count: 0 })
  })

  it("does not recalculate the value on subsequent re-renders", () => {
    const source = Impulse(0)
    const derived = Impulse((monitor) => ({ count: read(source, monitor) }))

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
    const source = Impulse(0)
    const derived = Impulse((monitor) => ({ count: read(source, monitor) }))

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

  it("does not recalculate for subsequent calls with static monitor", ({ monitor }) => {
    const source = Impulse(0)
    const derived = Impulse((monitor) => ({ count: read(source, monitor) }))

    expect(read(derived, monitor)).toStrictEqual({ count: 0 })
    expect(read(derived, monitor)).toBe(read(derived, monitor))
    expect(source).toHaveEmittersSize(1)

    act(() => {
      update(source, 1)
    })

    expect(read(derived, monitor)).toStrictEqual({ count: 1 })
    expect(source).toHaveEmittersSize(1)
  })

  it("does not recalculate the value when dependency sets the same value", () => {
    const source = Impulse(0)
    const derived = Impulse((monitor) => ({ count: read(source, monitor) }))

    const { result: first } = renderHook(() => useComputed((monitor) => read(derived, monitor)))

    const { result: second } = renderHook(() => useComputed((monitor) => read(derived, monitor)))

    const initial = first.current

    act(() => {
      update(source, 0)
    })

    expect(initial).toBe(first.current)
    expect(initial).toBe(second.current)
    expect(first.current).toBe(second.current)
    expect(first.current).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)
  })

  it("recalculates the value on dependency change", () => {
    const source = Impulse(0)
    const derived = Impulse((monitor) => ({ count: read(source, monitor) }))

    const { result: first } = renderHook(() => useComputed((monitor) => read(derived, monitor)))

    const { result: second } = renderHook(() => useComputed((monitor) => read(derived, monitor)))

    const initial = first.current

    act(() => {
      update(source, 1)
      update(source, 2)
    })

    expect(initial).not.toBe(first.current)
    expect(initial).not.toBe(second.current)
    expect(first.current).toBe(second.current)
    expect(first.current).toStrictEqual({ count: 2 })
    expect(source).toHaveEmittersSize(1)
  })

  it("keeps source observed after changing to the same derived value", ({ monitor }) => {
    const source = Impulse({ count: 0 })
    const derived = Impulse((monitor) => read(source, monitor), {
      equals: Counter.equals,
    })

    const value0 = read(derived, monitor)
    expect(value0).toStrictEqual({ count: 0 })

    update(source, { count: 1 })
    const value1 = read(derived, monitor)
    expect(value1).toStrictEqual({ count: 1 })
    expect(value1).not.toBe(value0)

    update(source, { count: 1 })
    const value2 = read(derived, monitor)
    expect(value2).toStrictEqual({ count: 1 })
    expect(value2).toBe(value1)
  })

  it("keeps source observed after useComputed dependency change", () => {
    const source = Impulse(1)
    const derived = Impulse((monitor) => 2 * read(source, monitor))

    const { result } = renderHook(() => {
      const [count, setCount] = useState(2)

      return {
        computed: useComputed((monitor) => read(derived, monitor) + count, [count, read]),
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
      update(source, 2)
    })
    expect(result.current.computed).toBe(8)

    act(() => {
      update(source, 3)
    })
    expect(result.current.computed).toBe(10)
  })

  it("keeps observing while derived value does not change", () => {
    const source = Impulse(0)
    const derived = Impulse((monitor) => read(source, monitor) > 0)

    expect(source).toHaveEmittersSize(0)
    expect(derived).toHaveEmittersSize(0)

    const { result } = renderHook(() => useComputed((monitor) => read(derived, monitor)))
    expect(source).toHaveEmittersSize(1)
    expect(derived).toHaveEmittersSize(1)
    expect(result.current).toBe(false)

    act(() => {
      update(source, 1)
    })
    expect(source).toHaveEmittersSize(1)
    expect(derived).toHaveEmittersSize(1)
    expect(result.current).toBe(true)

    act(() => {
      update(source, 2)
    })
    expect(source).toHaveEmittersSize(1)
    expect(derived).toHaveEmittersSize(1)
    expect(result.current).toBe(true)

    act(() => {
      update(source, 0)
    })
    expect(source).toHaveEmittersSize(1)
    expect(derived).toHaveEmittersSize(1)
    expect(result.current).toBe(false)
  })

  it("recalculates the value for nested derived impulses", () => {
    const email = Impulse("")
    const password = Impulse("")
    const isEmailEmpty = Impulse((monitor) => read(email, monitor) === "")
    const isPasswordEmpty = Impulse((monitor) => read(password, monitor) === "")
    const isFormEmpty = Impulse((monitor) => ({
      email: read(isEmailEmpty, monitor),
      password: read(isPasswordEmpty, monitor),
    }))

    const { result } = renderHook(() => useComputed((monitor) => read(isFormEmpty, monitor)))

    const value0 = result.current
    expect(value0).toStrictEqual({
      email: true,
      password: true,
    })

    act(() => {
      update(email, "t")
    })
    const value1 = result.current
    expect(value1).toStrictEqual({
      email: false,
      password: true,
    })
    expect(value1).not.toBe(value0)

    act(() => {
      update(email, "te")
    })
    const value2 = result.current
    expect(value2).toBe(value1)

    act(() => {
      update(password, "q")
    })
    const value3 = result.current
    expect(value3).toStrictEqual({
      email: false,
      password: false,
    })
    expect(value3).not.toBe(value2)

    act(() => {
      update(email, "test")
      update(password, "qwerty")
    })
    const value4 = result.current
    expect(value4).toBe(value3)

    act(() => {
      update(email, "")
      update(password, "")
    })

    const value5 = result.current
    expect(value5).toStrictEqual({
      email: true,
      password: true,
    })
    expect(value5).not.toBe(value4)
  })

  it("causes a single re-render caused by dependency update", () => {
    const source = Impulse(0)
    const derived = Impulse((monitor) => ({ count: read(source, monitor) }))

    const spy = vi.fn()

    renderHook(() => {
      const counter = useComputed((monitor) => read(derived, monitor))

      spy(counter)
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    act(() => {
      update(source, 0)
    })
    expect(spy).not.toHaveBeenCalled()

    act(() => {
      update(source, 1)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 1 })
  })

  it("do not re-subscribe to dependencies when they are not in use", () => {
    const source = Impulse(1)
    const condition = Impulse(false)
    const derived = Impulse((monitor) => ({
      count: read(condition, monitor) ? read(source, monitor) : 0,
    }))

    const { result } = renderHook(() => useComputed((monitor) => read(derived, monitor)))

    const initial = result.current
    expect(initial).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(0)
    expect(condition).toHaveEmittersSize(1)

    act(() => {
      update(source, 0)
    })
    expect(result.current).toBe(initial)
    expect(source).toHaveEmittersSize(0)
    expect(condition).toHaveEmittersSize(1)

    act(() => {
      update(condition, true)
    })
    expect(result.current).not.toBe(initial)
    expect(result.current).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)
    expect(condition).toHaveEmittersSize(1)

    act(() => {
      update(source, 1)
    })
    expect(result.current).toStrictEqual({ count: 1 })
    expect(source).toHaveEmittersSize(1)
    expect(condition).toHaveEmittersSize(1)

    act(() => {
      update(condition, false)
    })
    expect(result.current).not.toBe(initial)
    expect(result.current).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(0)
    expect(condition).toHaveEmittersSize(1)
  })

  it("does not call equals on init", () => {
    const source = Impulse({ count: 0 })

    Impulse((monitor) => read(source, monitor), {
      equals: Counter.equals,
    })

    expect(Counter.equals).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(0)
  })

  it("does not call equals on first read", ({ monitor }) => {
    const source = Impulse({ count: 0 })
    const derived = Impulse((monitor) => read(source, monitor), {
      equals: Counter.equals,
    })

    expect(read(derived, monitor)).toStrictEqual({ count: 0 })
    expect(Counter.equals).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(1)
  })

  it("does not calls equals on subsequent calls when the source does not change", ({ monitor }) => {
    const source = Impulse({ count: 0 })
    const derived = Impulse((monitor) => read(source, monitor), {
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
    const source = Impulse({ count: 0 })
    const derived = Impulse((monitor) => read(source, monitor), {
      equals: Counter.equals,
    })

    act(() => {
      update(source, { count: 1 })
    })

    expect(Counter.equals).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(0)

    expect(read(derived, monitor)).toStrictEqual({ count: 1 })
    expect(Counter.equals).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(1)
  })

  it("calls equals function only when an observed source setter is called", ({ monitor }) => {
    const source = Impulse({ count: 0 })
    const derived = Impulse((monitor) => read(source, monitor), {
      equals: Counter.equals,
    })

    expect(read(derived, monitor)).toStrictEqual({ count: 0 })
    expect(Counter.equals).not.toHaveBeenCalled()

    act(() => {
      update(source, { count: 1 })
    })
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
      const source = Impulse({ count: 0 }, { equals: Counter.equals })
      const derived = Impulse(
        (monitor) => ({
          isMoreThanZero: read(source, monitor).count > 0,
        }),
        { equals },
      )
      const value0 = read(derived, monitor)

      expect(Object.is).not.toHaveBeenCalled()
      expect(value0).toStrictEqual({ isMoreThanZero: false })
      vi.clearAllMocks()

      act(() => {
        update(source, { count: 1 })
      })
      expect(Object.is).toHaveBeenCalledExactlyOnceWith(value0, {
        isMoreThanZero: true,
      })
      vi.clearAllMocks()

      const value1 = read(derived, monitor)
      expect(Object.is).not.toHaveBeenCalled()
      expect(value1).not.toBe(value0)
      expect(value1).toStrictEqual({ isMoreThanZero: true })
      vi.clearAllMocks()

      act(() => {
        update(source, { count: 2 })
      })
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
    const source = Impulse({ count: 0 })
    const derived = Impulse((monitor) => read(source, monitor), {
      equals: Counter.equals,
    })

    const value0 = read(derived, monitor)

    act(() => {
      update(source, { count: 0 })
    })
    expect(Counter.equals).toHaveBeenCalledExactlyOnceWith(value0, { count: 0 })
    vi.clearAllMocks()

    const value1 = read(derived, monitor)
    expect(Counter.equals).not.toHaveBeenCalled()
    expect(value0).toBe(value1)
    expect(value0).toStrictEqual({ count: 0 })

    act(() => {
      update(source, { count: 1 })
    })
    expect(Counter.equals).toHaveBeenCalledExactlyOnceWith(value1, { count: 1 })
    vi.clearAllMocks()

    const value2 = read(derived, monitor)
    expect(Counter.equals).not.toHaveBeenCalled()
    expect(value2).not.toBe(value1)
    expect(value2).toStrictEqual({ count: 1 })
  })
})

describe.concurrent("Impulse(getter) garbage collection", () => {
  it("cleanups immediately when source.update is called with the different value", ({
    monitor,
  }) => {
    const source = Impulse(0)

    ;(() => {
      const derived = Impulse((monitor) => ({
        count: source.read(monitor),
      }))

      expect(source).toHaveEmittersSize(0)

      expect(derived.read(monitor)).toStrictEqual({ count: 0 })
      expect(source).toHaveEmittersSize(1)
      expect(derived).toHaveEmittersSize(0)
    })()

    expect(source).toHaveEmittersSize(1)

    source.update(1)
    expect(source).toHaveEmittersSize(0)
  })

  it("cleanups the WeakRef when source.update is called with the same value", async ({
    monitor,
  }) => {
    const source = Impulse(0)

    ;(() => {
      const derived = Impulse((monitor) => ({
        count: source.read(monitor),
      }))

      expect(source).toHaveEmittersSize(0)

      expect(derived.read(monitor)).toStrictEqual({ count: 0 })
      expect(source).toHaveEmittersSize(1)
      expect(derived).toHaveEmittersSize(0)
    })()

    expect(source).toHaveEmittersSize(1)

    source.update(0)
    expect(source).toHaveEmittersSize(1)

    await global.gc?.({ execution: "async" })
    expect(source).toHaveEmittersSize(0)
  })

  it("cleanups the WeakRef", async ({ monitor }) => {
    const source = Impulse(0)
    let derived: null | ReadonlyImpulse<Counter> = Impulse((monitor) => ({
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
    const source = Impulse(0)

    ;(() => {
      const derived = Impulse((monitor) => ({
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
    const source = Impulse(0)

    ;(() => {
      const derived = Impulse((monitor) => ({
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
    const source = Impulse(0)

    ;(() => {
      const derived = Impulse((monitor) => ({
        count: source.read(monitor),
      }))

      expect(untracked(derived)).toStrictEqual({ count: 0 })
      expect(source).toHaveEmittersSize(1)
      expect(derived).toHaveEmittersSize(0)
    })()

    await global.gc?.({ execution: "async" })
    expect(source).toHaveEmittersSize(0)
  })

  it("cleanups the WeakRef from a hook", async () => {
    const source = Impulse(0)

    const { result, unmount } = renderHook(() => {
      const derived = Impulse((monitor) => ({
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

  it("cleanups only unreachable dependencies", async ({ monitor }) => {
    const source = Impulse(0)
    const derived1 = Impulse((monitor) => ({
      count: source.read(monitor),
    }))

    expect(derived1.read(monitor)).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)
    ;(() => {
      const derived2 = Impulse((monitor) => ({
        count: source.read(monitor),
      }))

      expect(derived2.read(monitor)).toStrictEqual({ count: 0 })
      expect(source).toHaveEmittersSize(2)
      expect(derived2).toHaveEmittersSize(0)
    })()
    ;(() => {
      const derived3 = Impulse((monitor) => ({
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

describe("Impulse(source)", () => {
  it("creates an Impulse from a source", () => {
    const source = Impulse(0)
    const impulse = Impulse(source)

    expectTypeOf(impulse).toEqualTypeOf<ReadonlyImpulse<number>>()
  })

  it("allows source as a ReadonlyImpulse", () => {
    const source = Impulse(() => 0)
    const impulse = Impulse(source)

    expectTypeOf(impulse).toEqualTypeOf<ReadonlyImpulse<number>>()
  })

  it("allows source as a ReadableImpulse", ({ monitor }) => {
    class Custom implements ReadableImpulse<number> {
      public readonly counter = Impulse(0)

      public read(monitor: Monitor): number {
        return this.counter.read(monitor)
      }
    }

    const source = new Custom()
    const derived = Impulse(source)

    expect(derived.read(monitor)).toBe(0)

    act(() => {
      source.counter.update(1)
    })

    expect(derived.read(monitor)).toBe(1)
  })
})

describe("Impulse(source, options)", () => {
  it("creates an Impulse from a source", () => {
    const source = Impulse<Counter>({ count: 0 })
    const impulse = Impulse(source, { equals: Counter.equals })

    expectTypeOf(impulse).toEqualTypeOf<ReadonlyImpulse<Counter>>()
  })

  it("allows source as a ReadonlyImpulse", () => {
    const source = Impulse<Counter>(() => ({ count: 0 }))
    const impulse = Impulse(source, { equals: Counter.equals })

    expectTypeOf(impulse).toEqualTypeOf<ReadonlyImpulse<Counter>>()
  })

  it("allows source as a ReadableImpulse", ({ monitor }) => {
    class Custom implements ReadableImpulse<Counter> {
      public readonly counter = Impulse({ count: 0 })

      public read(monitor: Monitor): Counter {
        return this.counter.read(monitor)
      }
    }

    const source = new Custom()
    const derived = Impulse(source, { equals: Counter.equals })

    expect(derived.read(monitor)).toStrictEqual({ count: 0 })
    expect(Counter.equals).not.toHaveBeenCalled()

    act(() => {
      source.counter.update(Counter.inc)
    })

    expect(derived.read(monitor)).toStrictEqual({ count: 1 })
    expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
  })
})

describe("Impulse(getter, setter, options?)", () => {
  it("creates an Impulse", () => {
    let variable = 0
    const impulse = Impulse(
      () => variable,
      (value) => {
        variable = value
      },
    )

    expectTypeOf(impulse).toEqualTypeOf<Impulse<number>>()
    expectTypeOf(impulse).toMatchTypeOf<ReadonlyImpulse<number>>()
  })

  it("allows source as a Impulse", ({ monitor }) => {
    const source = Impulse(0)
    const impulse = Impulse(source, () => {
      // noop
    })

    expect(impulse.read(monitor)).toBe(0)
  })

  it("allows source as a ReadonlyImpulse", ({ monitor }) => {
    const source = Impulse(() => 0)
    const derived = Impulse(source, () => {
      // noop
    })

    expect(derived.read(monitor)).toBe(0)
  })

  it("allows source as a ReadableImpulse", ({ monitor }) => {
    class Custom implements ReadableImpulse<number> {
      public readonly counter = Impulse(0)

      public read(monitor: Monitor): number {
        return this.counter.read(monitor)
      }
    }

    const source = new Custom()
    const derived = Impulse(source, () => {
      // noop
    })

    expect(derived.read(monitor)).toBe(0)

    act(() => {
      source.counter.update(1)
    })

    expect(derived.read(monitor)).toBe(1)
  })

  it("does not allow setter as a ReadonlyImpulse", ({ monitor }) => {
    const destination = Impulse(() => 0)
    // @ts-expect-error should be Impulse
    const impulse = Impulse(() => 2, [], destination)

    expect(impulse.read(monitor)).toBe(2)
  })

  it("subscribes to Impulse source and back", () => {
    const source = Impulse({ count: 0 }, { equals: Counter.equals })
    const impulse = Impulse(
      (monitor) => source.read(monitor),
      (counter) => source.update(counter),
    )
    const spyImpulse = vi.fn()
    const spySource = vi.fn()

    effect((monitor) => {
      spyImpulse(impulse.read(monitor))
    })
    effect((monitor) => {
      spySource(source.read(monitor))
    })

    expect(spyImpulse).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    source.update({ count: 1 })
    expect(spyImpulse).toHaveBeenCalledExactlyOnceWith({ count: 1 })
    vi.clearAllMocks()

    source.update({ count: 1 })
    expect(spyImpulse).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.update({ count: 1 })
    expect(spySource).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.update({ count: 2 })
    expect(spySource).toHaveBeenCalledExactlyOnceWith({ count: 2 })
  })

  it("subscribes to ReadableImpulse/WritableImpulse and back", () => {
    class Custom implements ReadableImpulse<{ count: number }>, WritableImpulse<{ count: number }> {
      private readonly counter = Impulse(0)

      public read(monitor: Monitor): { count: number } {
        return { count: this.counter.read(monitor) }
      }

      public update(value: { count: number }): void {
        this.counter.update(value.count)
      }
    }

    const source = new Custom()
    const impulse = Impulse(
      (monitor) => source.read(monitor),
      (counter) => source.update(counter),
    )
    const spyImpulse = vi.fn()
    const spySource = vi.fn()

    effect((monitor) => {
      spyImpulse(impulse.read(monitor))
    })
    effect((monitor) => {
      spySource(source.read(monitor))
    })

    expect(spyImpulse).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    source.update({ count: 1 })
    expect(spyImpulse).toHaveBeenCalledExactlyOnceWith({ count: 1 })
    vi.clearAllMocks()

    source.update({ count: 1 })
    expect(spyImpulse).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.update({ count: 1 })
    expect(spySource).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.update({ count: 2 })
    expect(spySource).toHaveBeenCalledExactlyOnceWith({ count: 2 })
  })

  it("assigns custom function as equals", ({ monitor }) => {
    const source = Impulse({ count: 0 })
    const impulse = Impulse(
      (monitor) => source.read(monitor),
      (counter) => source.update(counter),
      {
        equals: Counter.equals,
      },
    )

    const value0 = impulse.read(monitor)

    act(() => {
      impulse.update({ count: 0 })
    })
    expect(Counter.equals).toHaveBeenCalledExactlyOnceWith(value0, { count: 0 })
    vi.clearAllMocks()

    const value1 = impulse.read(monitor)
    expect(Counter.equals).not.toHaveBeenCalled()
    expect(value1).toBe(value0)

    act(() => {
      impulse.update({ count: 1 })
    })
    expect(Counter.equals).toHaveBeenCalledExactlyOnceWith(value1, { count: 1 })
    vi.clearAllMocks()

    const value2 = impulse.read(monitor)
    expect(Counter.equals).not.toHaveBeenCalled()
    expect(value2).not.toBe(value1)
    expect(value2).toStrictEqual({ count: 1 })
  })

  it("batches setter", () => {
    const impulse1 = Impulse(1)
    const impulse2 = Impulse(2)
    const impulse3 = Impulse(3)
    const derived = Impulse(
      (monitor) => impulse1.read(monitor) + impulse2.read(monitor) + impulse3.read(monitor),
      (x) => {
        impulse1.update(x)
        impulse2.update(x)
        impulse3.update(x)
      },
    )
    const spy = vi.fn()

    const { result } = renderHook(() =>
      useComputed((monitor) => {
        spy()

        return derived.read(monitor)
      }, []),
    )

    expect(result.current).toBe(6)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      derived.update(4)
    })

    expect(result.current).toBe(12)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      derived.update(4)
    })

    expect(result.current).toBe(12)
    expect(spy).not.toHaveBeenCalled()
  })
})

function setupImpulse<T>(initialValue: T, options?: ImpulseOptions<T>) {
  const impulse = Impulse(initialValue, options)

  return { impulse }
}

function setupDerivedImpulseFromImpulse({
  getterShortcut,
  setterShortcut,
}: {
  getterShortcut: boolean
  setterShortcut: boolean
}) {
  return <T>(initialValue: T, options?: ImpulseOptions<T>) => {
    const source = Impulse(initialValue)
    const impulse = Impulse(
      getterShortcut ? source : (monitor) => source.read(monitor),
      setterShortcut ? source : (value) => source.update(value),
      options,
    )

    return {
      impulse,
      read: (monitor: Monitor) => source.read(monitor),
      update: (value: T) => {
        source.update(value)
      },
    }
  }
}

describe.each([
  ["DirectImpulse", setupImpulse],
  [
    "Derived Impulse from an Impulse",
    setupDerivedImpulseFromImpulse({
      getterShortcut: false,
      setterShortcut: false,
    }),
  ],
  [
    "Derived Impulse from an Impulse with getter shortcut",
    setupDerivedImpulseFromImpulse({
      getterShortcut: true,
      setterShortcut: false,
    }),
  ],
  [
    "Derived Impulse from an Impulse with setter shortcut",
    setupDerivedImpulseFromImpulse({
      getterShortcut: false,
      setterShortcut: true,
    }),
  ],
  [
    "Derived Impulse from an Impulse with both getter and setter shortcuts",
    setupDerivedImpulseFromImpulse({
      getterShortcut: true,
      setterShortcut: true,
    }),
  ],
])("Impulse() from %s", (_, setup) => {
  describe("Impulse#update(value)", () => {
    const { impulse } = setup({ count: 0 })

    it("updates value", ({ monitor }) => {
      const next = { count: 1 }
      impulse.update(next)
      expect(impulse.read(monitor)).toBe(next)
    })

    it("updates with the same value", ({ monitor }) => {
      const next = { count: 1 }
      impulse.update(next)
      expect(impulse.read(monitor)).toBe(next)
    })

    it("updates with equal value", ({ monitor }) => {
      const prev = impulse.read(monitor)
      impulse.update(prev)
      expect(impulse.read(monitor)).toBe(prev)
    })
  })

  describe("Impulse#update(transform)", () => {
    it("updates value", ({ monitor }) => {
      const { impulse } = setup({ count: 0 })

      impulse.update(Counter.inc)
      expect(impulse.read(monitor)).toStrictEqual({ count: 1 })
    })

    it("keeps the value", ({ monitor }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.update((counter) => counter)
      expect(impulse.read(monitor)).toBe(initial)
    })

    it("updates with the same value", ({ monitor }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.update(Counter.clone)
      expect(impulse.read(monitor)).not.toBe(initial)
      expect(impulse.read(monitor)).toStrictEqual(initial)
    })

    it("keeps the value if it is equal", ({ monitor }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial, { equals: Counter.equals })

      impulse.update(Counter.clone)
      expect(impulse.read(monitor)).toBe(initial)
      expect(impulse.read(monitor)).toStrictEqual(initial)
    })

    it("updates with the equal value", ({ monitor }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.update(() => initial)
      expect(impulse.read(monitor)).toBe(initial)
    })
  })

  describe("Impulse#clone()", () => {
    it("creates new Impulse", ({ monitor }) => {
      const { impulse: impulse1 } = setup({ count: 0 })
      const impulse2 = impulse1.clone()

      expect(impulse1).not.toBe(impulse2)
      expect(impulse1.read(monitor)).toBe(impulse2.read(monitor))
    })

    it("does not update source value when clone updates", ({ monitor }) => {
      const { impulse: impulse1 } = setup({ count: 0 })
      const impulse2 = impulse1.clone()

      impulse2.update({ count: 1 })

      expect(impulse1.read(monitor)).toStrictEqual({ count: 0 })
      expect(impulse2.read(monitor)).toStrictEqual({ count: 1 })
    })

    it("does not update clone value when source updates", ({ monitor }) => {
      const { impulse: impulse1 } = setup({ count: 0 })
      const impulse2 = impulse1.clone()

      impulse1.update({ count: 1 })

      expect(impulse1.read(monitor)).toStrictEqual({ count: 1 })
      expect(impulse2.read(monitor)).toStrictEqual({ count: 0 })
    })

    it("transfers comparator from source Impulse", () => {
      const { impulse: impulse1 } = setup({ count: 0 })
      const impulse2 = impulse1.clone()

      expect(Object.is).not.toHaveBeenCalled()
      impulse2.update({ count: 1 })

      expect(Object.is).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })

    it("transfers custom comparator from source Impulse", () => {
      const { impulse: impulse1 } = setup({ count: 0 }, { equals: Counter.equals })
      const impulse2 = impulse1.clone()

      expect(Counter.equals).not.toHaveBeenCalled()
      impulse2.update({ count: 1 })

      expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })
  })

  describe("Impulse#clone(options)", () => {
    it("inherits custom comparator by empty options", () => {
      const { impulse: impulse1 } = setup({ count: 0 }, { equals: Counter.equals })
      const impulse2 = impulse1.clone({})

      expect(Counter.equals).not.toHaveBeenCalled()
      impulse2.update({ count: 1 })

      expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })

    it("inherits custom comparator by options.equals: undefined", () => {
      const { impulse: impulse1 } = setup({ count: 0 }, { equals: Counter.equals })
      const impulse2 = impulse1.clone({ equals: undefined })

      expect(Counter.equals).not.toHaveBeenCalled()
      impulse2.update({ count: 1 })

      expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })

    it("overrides custom comparator as Object.is by options.equals: null", () => {
      const { impulse: impulse1 } = setup({ count: 0 }, { equals: Counter.equals })
      const impulse2 = impulse1.clone({ equals: null })

      expect(Object.is).not.toHaveBeenCalled()
      impulse2.update({ count: 1 })

      expect(Object.is).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })

    it("overrides comparator by custom options.equals", () => {
      const { impulse: impulse1 } = setup({ count: 0 })
      const impulse2 = impulse1.clone({ equals: Counter.equals })

      expect(Counter.equals).not.toHaveBeenCalled()
      impulse2.update({ count: 1 })

      expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })
  })

  describe("Impulse#clone(transform)", () => {
    it("creates new Impulse", ({ monitor }) => {
      const { impulse: impulse1 } = setup({ count: 0 })
      const impulse2 = impulse1.clone(Counter.clone)

      expect(impulse1).not.toBe(impulse2)
      expect(impulse1.read(monitor)).not.toBe(impulse2.read(monitor))
      expect(impulse1.read(monitor)).toStrictEqual(impulse2.read(monitor))
    })

    it("keeps comparator from source", () => {
      const { impulse: impulse1 } = setup({ count: 0 }, { equals: Counter.equals })
      const impulse2 = impulse1.clone(Counter.clone)

      expect(Counter.equals).not.toHaveBeenCalled()
      impulse2.update({ count: 1 })

      expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })

    it("creates new nested Impulse with clone(transform)", ({ monitor }) => {
      const { impulse: impulse1 } = setup({
        count: setup(0).impulse,
        name: setup("John").impulse,
      })
      const impulse2 = impulse1.clone(({ count, name }) => ({
        count: count.clone(),
        name: name.clone(),
      }))

      expect(impulse1).not.toBe(impulse2)
      expect(impulse1.read(monitor)).not.toBe(impulse2.read(monitor))
      expect(impulse1.read(monitor).count).not.toBe(impulse2.read(monitor).count)
      expect(impulse1.read(monitor).name).not.toBe(impulse2.read(monitor).name)
      expect({
        count: impulse1.read(monitor).count.read(monitor),
        name: impulse1.read(monitor).name.read(monitor),
      }).toStrictEqual({
        count: impulse2.read(monitor).count.read(monitor),
        name: impulse2.read(monitor).name.read(monitor),
      })

      // the nested impulses are independent
      impulse1.read(monitor).count.update(1)
      expect(impulse1.read(monitor).count.read(monitor)).toBe(1)
      expect(impulse2.read(monitor).count.read(monitor)).toBe(0)

      impulse1.read(monitor).name.update("Doe")
      expect(impulse1.read(monitor).name.read(monitor)).toBe("Doe")
      expect(impulse2.read(monitor).name.read(monitor)).toBe("John")
    })

    it("creates shallow nested Impulse with clone()", ({ monitor }) => {
      const { impulse: impulse1 } = setup({
        count: setup(0).impulse,
        name: setup("John").impulse,
      })
      const impulse2 = impulse1.clone()

      expect(impulse1).not.toBe(impulse2)
      expect(impulse1.read(monitor)).toBe(impulse2.read(monitor))
      expect(impulse1.read(monitor).count).toBe(impulse2.read(monitor).count)
      expect(impulse1.read(monitor).name).toBe(impulse2.read(monitor).name)
      expect({
        count: impulse1.read(monitor).count.read(monitor),
        name: impulse1.read(monitor).name.read(monitor),
      }).toStrictEqual({
        count: impulse1.read(monitor).count.read(monitor),
        name: impulse1.read(monitor).name.read(monitor),
      })

      // the nested impulses are dependent
      impulse1.read(monitor).count.update(1)
      expect(impulse1.read(monitor).count.read(monitor)).toBe(1)
      expect(impulse2.read(monitor).count.read(monitor)).toBe(1)

      impulse1.read(monitor).name.update("Doe")
      expect(impulse1.read(monitor).name.read(monitor)).toBe("Doe")
      expect(impulse2.read(monitor).name.read(monitor)).toBe("Doe")
    })
  })

  describe("Impulse#clone(transform, options)", () => {
    it("creates new Impulse with custom equals", ({ monitor }) => {
      const { impulse: impulse1 } = setup({ count: 0 })
      const impulse2 = impulse1.clone(Counter.clone, {
        equals: Counter.equals,
      })

      expect(impulse1).not.toBe(impulse2)
      expect(impulse1.read(monitor)).not.toBe(impulse2.read(monitor))
      expect(impulse1.read(monitor)).toStrictEqual(impulse2.read(monitor))

      expect(Counter.equals).not.toHaveBeenCalled()
      impulse2.update({ count: 1 })

      expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
    })
  })

  describe("Impulse#toJSON()", () => {
    it("converts value to JSON", () => {
      const { impulse } = setup({
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

      expect(JSON.stringify(impulse)).toMatchInlineSnapshot(
        `"{"number":0,"string":"biba","boolean":false,"null":null,"array":[1,"boba",true,null,null],"object":{"number":2,"string":"baba","boolean":false,"null":null}}"`,
      )
    })

    it("applies replace fields", () => {
      const { impulse } = setup({ first: 1, second: 2, third: 3 })

      expect(JSON.stringify(impulse, ["first", "third"])).toMatchInlineSnapshot(
        `"{"first":1,"third":3}"`,
      )
    })

    it("applies replace function", () => {
      const { impulse } = setup({ first: 1, second: 2, third: 3 })

      expect(
        JSON.stringify(impulse, (_key, value: unknown) => {
          if (typeof value === "number") {
            return value * 2
          }

          return value
        }),
      ).toMatchInlineSnapshot(`"{"first":2,"second":4,"third":6}"`)
    })

    it("applies spaces", () => {
      const { impulse } = setup({ first: 1, second: 2, third: 3 })

      expect(JSON.stringify(impulse, null, 2)).toMatchInlineSnapshot(
        `
        "{
          "first": 1,
          "second": 2,
          "third": 3
        }"
      `,
      )
    })

    it("stringifies nested Impulse", () => {
      const { impulse } = setup({
        first: setup(1).impulse,
        second: setup([setup("1").impulse, setup(false).impulse]).impulse,
      })

      expect(JSON.stringify(impulse, null, 2)).toMatchInlineSnapshot(`
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

  describe("Impulse#toString", () => {
    it.each([
      ["number", 1, "1"],
      ["boolean", false, "false"],
      ["null", null, "null"],
      ["undefined", undefined, "undefined"],
      ["array", [1, 2, setup(3).impulse], "1,2,3"],
      ["object", { first: 1 }, "[object Object]"],
    ])("converts %s value to string", (_, value, expected) => {
      const { impulse } = setup(value)

      expect(String(impulse)).toBe(expected)
    })
  })
})
