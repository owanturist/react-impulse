import { act, configure, renderHook, waitFor } from "@testing-library/react"
import { useState } from "react"

import {
  type ReadonlyImpulse,
  type ImpulseOptions,
  Impulse,
  subscribe,
  type Scope,
  useScoped,
  type ImpulseGetter,
  type ImpulseSetter,
  untrack,
  batch,
} from "../src"

import { Counter } from "./common"

configure({
  asyncUtilTimeout: 10000,
})

const isString = (value: unknown): value is string => typeof value === "string"

describe("Impulse.of()", () => {
  it("creates an Impulse of undefined | T type", () => {
    const impulse = Impulse.of<string>()

    expectTypeOf(impulse).toEqualTypeOf<Impulse<string | undefined>>()
  })

  it("should create an impulse with undefined initial value", ({ scope }) => {
    const impulse = Impulse.of<number>()

    expect(impulse.getValue(scope)).toBeUndefined()
  })

  it("updates the impulse with a new value", ({ scope }) => {
    const impulse = Impulse.of<number>()

    impulse.setValue(1)

    expect(impulse.getValue(scope)).toBe(1)
  })

  it("updates the impulse with a undefined", ({ scope }) => {
    const impulse = Impulse.of<number>()

    impulse.setValue(1)
    impulse.setValue(undefined)

    expect(impulse.getValue(scope)).toBeUndefined()
  })
})

describe("Impulse.of(value, options?)", () => {
  it("does not call compare on init", () => {
    Impulse.of({ count: 0 }, { compare: Counter.compare })

    expect(Counter.compare).not.toHaveBeenCalled()
  })

  it("assigns Object.is as default compare", () => {
    const impulse = Impulse.of({ count: 0 })

    impulse.setValue({ count: 1 })
    expect(Object.is).toHaveBeenCalledExactlyOnceWith(
      { count: 0 },
      { count: 1 },
    )
  })

  it("assigns Object.is by `null` as compare", () => {
    const impulse = Impulse.of({ count: 0 }, { compare: null })

    impulse.setValue({ count: 1 })
    expect(Object.is).toHaveBeenCalledExactlyOnceWith(
      { count: 0 },
      { count: 1 },
    )
  })

  it("assigns custom function as compare", ({ scope }) => {
    const impulse = Impulse.of({ count: 0 }, { compare: Counter.compare })

    impulse.setValue({ count: 1 })
    expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
      { count: 0 },
      { count: 1 },
      scope,
    )
  })

  it("carries the function value wrapped in an object", ({ scope }) => {
    const impulse = Impulse.of({ fn: (input: number) => input })

    expectTypeOf(impulse).toEqualTypeOf<
      Impulse<{
        fn: (input: number) => number
      }>
    >()
    expectTypeOf(impulse.getValue(scope)).toEqualTypeOf<{
      fn: (input: number) => number
    }>()
    expect(impulse.getValue(scope).fn(42)).toBe(42)
  })
})

describe.each<{
  name: string
  getValue: <T>(impulse: ReadonlyImpulse<T>, scope: Scope) => T
  setValue: <T>(
    impulse: Impulse<T>,
    setter: T | ((currentValue: T, scope: Scope) => T),
  ) => void
}>([
  {
    name: "1x getValue / 1x setValue",
    getValue: (impulse, scope) => impulse.getValue(scope),
    setValue: (impulse, setter) => {
      impulse.setValue(setter)
    },
  },

  {
    name: "1x getValue / 2x setValue",
    getValue: (impulse, scope) => impulse.getValue(scope),
    setValue: (impulse, setter) => {
      impulse.setValue(setter)
      impulse.setValue(setter)
    },
  },
  {
    name: "1x getValue / 2x batched setValue",
    getValue: (impulse, scope) => impulse.getValue(scope),
    setValue: (impulse, setter) => {
      batch(() => {
        impulse.setValue(setter)
        impulse.setValue(setter)
      })
    },
  },

  {
    name: "2x getValue / 1x setValue",
    getValue: (impulse, scope) => {
      impulse.getValue(scope)

      return impulse.getValue(scope)
    },
    setValue: (impulse, setter) => {
      impulse.setValue(setter)
    },
  },

  {
    name: "2x getValue / 2x setValue",
    getValue: (impulse, scope) => {
      impulse.getValue(scope)

      return impulse.getValue(scope)
    },
    setValue: (impulse, setter) => {
      impulse.setValue(setter)
      impulse.setValue(setter)
    },
  },
  {
    name: "2x getValue / 2x batched setValue",
    getValue: (impulse, scope) => {
      impulse.getValue(scope)

      return impulse.getValue(scope)
    },
    setValue: (impulse, setter) => {
      batch(() => {
        impulse.setValue(setter)
        impulse.setValue(setter)
      })
    },
  },
])("Impulse.of(getter, options?) when $name", ({ getValue, setValue }) => {
  it("creates a ReadonlyImpulse", () => {
    const impulse = Impulse.of(() => 0)

    // @ts-expect-error should be ReadonlyImpulse
    expectTypeOf(impulse).toEqualTypeOf<Impulse<number>>()
    expectTypeOf(impulse).toEqualTypeOf<ReadonlyImpulse<number>>()
  })

  it("reads the value from the source", ({ scope }) => {
    const initial = { count: 0 }
    const source = Impulse.of(initial)
    const impulse = Impulse.of((scope) => getValue(source, scope))

    expect(getValue(impulse, scope)).toBe(initial)
    expect(getValue(impulse, scope)).toStrictEqual({ count: 0 })

    const next = { count: 1 }
    setValue(source, next)
    expect(getValue(impulse, scope)).toBe(next)
    expect(getValue(impulse, scope)).toStrictEqual({ count: 1 })
  })

  it("subscribes to Impulse source", ({ scope }) => {
    const source = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const derived = Impulse.of((scope) => getValue(source, scope))
    const spy = vi.fn()

    expect(source).toHaveEmittersSize(0)

    const unsubscribe = subscribe((scope) => {
      spy(getValue(derived, scope))
    })

    expect(source).toHaveEmittersSize(1)
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    setValue(source, { count: 1 })
    expect(getValue(derived, scope)).toStrictEqual({ count: 1 })
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 1 })
    vi.clearAllMocks()

    setValue(source, { count: 1 })
    expect(getValue(derived, scope)).toStrictEqual({ count: 1 })
    expect(spy).not.toHaveBeenCalled()

    expect(source).toHaveEmittersSize(1)
    unsubscribe()

    expect(source).toHaveEmittersSize(1)
  })

  it("cannot subscribe to none-Impulse source", () => {
    let variable = 0
    const impulse = Impulse.of(() => variable)
    const spy = vi.fn()

    subscribe((scope) => {
      spy(getValue(impulse, scope))
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(0)
    vi.clearAllMocks()

    variable = 1
    expect(spy).not.toHaveBeenCalled()
  })

  it("does not emit change when derived value does not change", () => {
    const source = Impulse.of(0)
    const derived = Impulse.of((scope) => getValue(source, scope) > 0)
    const spy = vi.fn()

    const unsubscribe = subscribe((scope) => {
      spy(getValue(derived, scope))
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith(false)
    vi.clearAllMocks()

    setValue(source, 1)
    expect(spy).toHaveBeenCalledExactlyOnceWith(true)
    vi.clearAllMocks()

    setValue(source, 2)
    expect(spy).not.toHaveBeenCalled()

    unsubscribe()
    expect(spy).not.toHaveBeenCalled()
  })

  it("observes Impulse source only after the first read", ({ scope }) => {
    const source = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const derived = Impulse.of((scope) => getValue(source, scope))

    expect(source).toHaveEmittersSize(0)

    setValue(source, { count: 1 })
    expect(source).toHaveEmittersSize(0)
    expect(getValue(derived, scope)).toStrictEqual({ count: 1 })
    expect(source).toHaveEmittersSize(1)

    setValue(source, { count: 2 })
    expect(source).toHaveEmittersSize(0)
    expect(getValue(derived, scope)).toStrictEqual({ count: 2 })
    expect(source).toHaveEmittersSize(1)

    setValue(source, { count: 2 })
    expect(source).toHaveEmittersSize(1)
  })

  it("derives the value after subsequent source.setValue(different) calls", ({
    scope,
  }) => {
    const source = Impulse.of(0)
    const derived = Impulse.of((scope) => ({ count: getValue(source, scope) }))

    const value_0 = getValue(derived, scope)
    expect(value_0).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)

    setValue(source, 1)
    expect(source).toHaveEmittersSize(0)
    setValue(source, 2)
    expect(source).toHaveEmittersSize(0)

    const value_1 = getValue(derived, scope)
    expect(value_1).not.toBe(value_0)
    expect(value_1).toStrictEqual({ count: 2 })
    expect(source).toHaveEmittersSize(1)
  })

  it("derives the value after subsequent source.setValue(same) source.setValue(different) calls", ({
    scope,
  }) => {
    const source = Impulse.of(0)
    const derived = Impulse.of((scope) => ({ count: getValue(source, scope) }))

    const value_0 = getValue(derived, scope)
    expect(value_0).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)

    setValue(source, 0)
    expect(source).toHaveEmittersSize(1)
    setValue(source, 1)
    expect(source).toHaveEmittersSize(0)

    const value_1 = getValue(derived, scope)
    expect(value_1).not.toBe(value_0)
    expect(value_1).toStrictEqual({ count: 1 })
    expect(source).toHaveEmittersSize(1)
  })

  it("does not recalculate the value on subsequent calls", () => {
    const source = Impulse.of(0)
    const derived = Impulse.of((scope) => ({ count: getValue(source, scope) }))

    const { result: first } = renderHook(() =>
      useScoped((scope) => getValue(derived, scope)),
    )

    const { result: second } = renderHook(() =>
      useScoped((scope) => getValue(derived, scope)),
    )

    expect(source).toHaveEmittersSize(1)

    const initial = first.current
    expect(first.current).toBe(second.current)
    expect(initial).toStrictEqual({ count: 0 })
  })

  it("does not recalculate the value on subsequent re-renders", () => {
    const source = Impulse.of(0)
    const derived = Impulse.of((scope) => ({ count: getValue(source, scope) }))

    const { result: first, rerender: rerenderFirst } = renderHook(() =>
      useScoped((scope) => getValue(derived, scope)),
    )

    const { result: second, rerender: rerenderSecond } = renderHook(() =>
      useScoped((scope) => getValue(derived, scope)),
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
    const source = Impulse.of(0)
    const derived = Impulse.of((scope) => ({ count: getValue(source, scope) }))

    const { result: first } = renderHook(() => {
      const [, force] = useState(0)

      return {
        force,
        counter: useScoped((scope) => getValue(derived, scope)),
      }
    })

    const { result: second } = renderHook(() => {
      const [, force] = useState(0)

      return {
        force,
        counter: useScoped((scope) => getValue(derived, scope)),
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

  it("does not recalculate for subsequent calls with static scope", ({
    scope,
  }) => {
    const source = Impulse.of(0)
    const derived = Impulse.of((scope) => ({ count: getValue(source, scope) }))

    expect(getValue(derived, scope)).toStrictEqual({ count: 0 })
    expect(getValue(derived, scope)).toBe(getValue(derived, scope))
    expect(source).toHaveEmittersSize(1)

    act(() => {
      setValue(source, 1)
    })

    expect(getValue(derived, scope)).toStrictEqual({ count: 1 })
    expect(source).toHaveEmittersSize(1)
  })

  it("does not recalculate the value when dependency sets the same value", () => {
    const source = Impulse.of(0)
    const derived = Impulse.of((scope) => ({ count: getValue(source, scope) }))

    const { result: first } = renderHook(() =>
      useScoped((scope) => getValue(derived, scope)),
    )

    const { result: second } = renderHook(() =>
      useScoped((scope) => getValue(derived, scope)),
    )

    const initial = first.current

    act(() => {
      setValue(source, 0)
    })

    expect(initial).toBe(first.current)
    expect(initial).toBe(second.current)
    expect(first.current).toBe(second.current)
    expect(first.current).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)
  })

  it("recalculates the value on dependency change", () => {
    const source = Impulse.of(0)
    const derived = Impulse.of((scope) => ({ count: getValue(source, scope) }))

    const { result: first } = renderHook(() => {
      return useScoped((scope) => getValue(derived, scope))
    })

    const { result: second } = renderHook(() => {
      return useScoped((scope) => getValue(derived, scope))
    })

    const initial = first.current

    act(() => {
      setValue(source, 1)
      setValue(source, 2)
    })

    expect(initial).not.toBe(first.current)
    expect(initial).not.toBe(second.current)
    expect(first.current).toBe(second.current)
    expect(first.current).toStrictEqual({ count: 2 })
    expect(source).toHaveEmittersSize(1)
  })

  it("verify against useScoped with deps", () => {
    const source = Impulse.of(1)
    const derived = Impulse.of((scope) => 2 * getValue(source, scope))

    const { result } = renderHook(() => {
      const [count, setCount] = useState(2)

      return {
        scoped: useScoped((scope) => getValue(derived, scope) + count, [count]),
        setCount,
      }
    })

    expect(result.current.scoped).toBe(4)

    act(() => {
      result.current.setCount(3)
    })
    expect(result.current.scoped).toBe(5)

    act(() => {
      result.current.setCount(4)
    })
    expect(result.current.scoped).toBe(6)

    act(() => {
      setValue(source, 2)
    })
    expect(result.current.scoped).toBe(8)

    act(() => {
      setValue(source, 3)
    })
    expect(result.current.scoped).toBe(10)
  })

  it("keeps observing while derived value does not change", () => {
    const source = Impulse.of(0)
    const derived = Impulse.of((scope) => getValue(source, scope) > 0)

    expect(source).toHaveEmittersSize(0)
    expect(derived).toHaveEmittersSize(0)

    const { result } = renderHook(() =>
      useScoped((scope) => getValue(derived, scope)),
    )
    expect(source).toHaveEmittersSize(1)
    expect(derived).toHaveEmittersSize(1)
    expect(result.current).toBe(false)

    act(() => {
      setValue(source, 1)
    })
    expect(source).toHaveEmittersSize(1)
    expect(derived).toHaveEmittersSize(1)
    expect(result.current).toBe(true)

    act(() => {
      setValue(source, 2)
    })
    expect(source).toHaveEmittersSize(1)
    expect(derived).toHaveEmittersSize(1)
    expect(result.current).toBe(true)

    act(() => {
      setValue(source, 0)
    })
    expect(source).toHaveEmittersSize(1)
    expect(derived).toHaveEmittersSize(1)
    expect(result.current).toBe(false)
  })

  it("recalculates the value for nested derived impulses", () => {
    const email = Impulse.of("")
    const password = Impulse.of("")
    const isEmailEmpty = Impulse.of((scope) => getValue(email, scope) === "")
    const isPasswordEmpty = Impulse.of(
      (scope) => getValue(password, scope) === "",
    )
    const isFormEmpty = Impulse.of((scope) => ({
      email: getValue(isEmailEmpty, scope),
      password: getValue(isPasswordEmpty, scope),
    }))

    const { result } = renderHook(() =>
      useScoped((scope) => getValue(isFormEmpty, scope)),
    )

    const value_0 = result.current
    expect(value_0).toStrictEqual({
      email: true,
      password: true,
    })

    act(() => {
      setValue(email, "t")
    })
    const value_1 = result.current
    expect(value_1).toStrictEqual({
      email: false,
      password: true,
    })
    expect(value_1).not.toBe(value_0)

    act(() => {
      setValue(email, "te")
    })
    const value_2 = result.current
    expect(value_2).toBe(value_1)

    act(() => {
      setValue(password, "q")
    })
    const value_3 = result.current
    expect(value_3).toStrictEqual({
      email: false,
      password: false,
    })
    expect(value_3).not.toBe(value_2)

    act(() => {
      setValue(email, "test")
      setValue(password, "qwerty")
    })
    const value_4 = result.current
    expect(value_4).toBe(value_3)

    act(() => {
      setValue(email, "")
      setValue(password, "")
    })

    const value_5 = result.current
    expect(value_5).toStrictEqual({
      email: true,
      password: true,
    })
    expect(value_5).not.toBe(value_4)
  })

  it("causes a single re-render caused by dependency update", () => {
    const source = Impulse.of(0)
    const derived = Impulse.of((scope) => ({ count: getValue(source, scope) }))

    const spy = vi.fn()

    renderHook(() => {
      const counter = useScoped((scope) => getValue(derived, scope))

      spy(counter)
    })

    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    act(() => {
      setValue(source, 0)
    })
    expect(spy).not.toHaveBeenCalled()

    act(() => {
      setValue(source, 1)
    })
    expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 1 })
  })

  it("do not re-subscribe to dependencies when they are not in use", () => {
    const source = Impulse.of(1)
    const condition = Impulse.of(false)
    const derived = Impulse.of((scope) => ({
      count: getValue(condition, scope) ? getValue(source, scope) : 0,
    }))

    const { result } = renderHook(() =>
      useScoped((scope) => getValue(derived, scope)),
    )

    const initial = result.current
    expect(initial).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(0)
    expect(condition).toHaveEmittersSize(1)

    act(() => {
      setValue(source, 0)
    })
    expect(result.current).toBe(initial)
    expect(source).toHaveEmittersSize(0)
    expect(condition).toHaveEmittersSize(1)

    act(() => {
      setValue(condition, true)
    })
    expect(result.current).not.toBe(initial)
    expect(result.current).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(1)
    expect(condition).toHaveEmittersSize(1)

    act(() => {
      setValue(source, 1)
    })
    expect(result.current).toStrictEqual({ count: 1 })
    expect(source).toHaveEmittersSize(1)
    expect(condition).toHaveEmittersSize(1)

    act(() => {
      setValue(condition, false)
    })
    expect(result.current).not.toBe(initial)
    expect(result.current).toStrictEqual({ count: 0 })
    expect(source).toHaveEmittersSize(0)
    expect(condition).toHaveEmittersSize(1)
  })

  it("does not call compare on init", () => {
    const source = Impulse.of({ count: 0 })

    Impulse.of((scope) => getValue(source, scope), {
      compare: Counter.compare,
    })

    expect(Counter.compare).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(0)
  })

  it("does not call compare on first getValue", ({ scope }) => {
    const source = Impulse.of({ count: 0 })
    const derived = Impulse.of((scope) => getValue(source, scope), {
      compare: Counter.compare,
    })

    expect(getValue(derived, scope)).toStrictEqual({ count: 0 })
    expect(Counter.compare).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(1)
  })

  it("does not calls compare on subsequent calls when the source does not change", ({
    scope,
  }) => {
    const source = Impulse.of({ count: 0 })
    const derived = Impulse.of((scope) => getValue(source, scope), {
      compare: Counter.compare,
    })

    const counter = getValue(derived, scope)
    expect(counter).toStrictEqual({ count: 0 })
    expect(getValue(derived, scope)).toBe(counter)
    expect(getValue(derived, scope)).toBe(counter)
    expect(getValue(derived, scope)).toBe(counter)
    expect(getValue(derived, scope)).toBe(counter)

    expect(Counter.compare).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(1)
  })

  it("does not call compare function when an unobserved source changes", ({
    scope,
  }) => {
    const source = Impulse.of({ count: 0 })
    const derived = Impulse.of((scope) => getValue(source, scope), {
      compare: Counter.compare,
    })

    act(() => {
      setValue(source, { count: 1 })
    })

    expect(Counter.compare).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(0)

    expect(getValue(derived, scope)).toStrictEqual({ count: 1 })
    expect(Counter.compare).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(1)
  })

  it("calls compare function only when an observed source setter is called", ({
    scope,
  }) => {
    const source = Impulse.of({ count: 0 })
    const derived = Impulse.of((scope) => getValue(source, scope), {
      compare: Counter.compare,
    })

    expect(getValue(derived, scope)).toStrictEqual({ count: 0 })
    expect(Counter.compare).not.toHaveBeenCalled()

    act(() => {
      setValue(source, { count: 1 })
    })
    expect(Counter.compare).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    expect(source).toHaveEmittersSize(0)
    expect(getValue(derived, scope)).toStrictEqual({ count: 1 })
    expect(Counter.compare).not.toHaveBeenCalled()
    expect(source).toHaveEmittersSize(1)
  })

  describe.each([
    ["default", undefined],
    ["null", null],
  ])("when compare is %s", (_, compare) => {
    it("uses Object.is as compare", ({ scope }) => {
      const source = Impulse.of({ count: 0 }, { compare: Counter.compare })
      const derived = Impulse.of(
        (scope) => ({
          isMoreThanZero: getValue(source, scope).count > 0,
        }),
        { compare },
      )
      const value_0 = getValue(derived, scope)

      expect(Object.is).not.toHaveBeenCalled()
      expect(value_0).toStrictEqual({ isMoreThanZero: false })
      vi.clearAllMocks()

      act(() => {
        setValue(source, { count: 1 })
      })
      expect(Object.is).toHaveBeenCalledExactlyOnceWith(value_0, {
        isMoreThanZero: true,
      })
      vi.clearAllMocks()

      const value_1 = getValue(derived, scope)
      expect(Object.is).not.toHaveBeenCalled()
      expect(value_1).not.toBe(value_0)
      expect(value_1).toStrictEqual({ isMoreThanZero: true })
      vi.clearAllMocks()

      act(() => {
        setValue(source, { count: 2 })
      })
      expect(Object.is).toHaveBeenCalledExactlyOnceWith(value_1, {
        isMoreThanZero: true,
      })
      vi.clearAllMocks()

      const value_2 = getValue(derived, scope)
      expect(Object.is).not.toHaveBeenCalled()
      expect(value_2).not.toBe(value_1)
      expect(value_2).toStrictEqual({ isMoreThanZero: true })
    })
  })

  it("assigns custom function as compare", ({ scope }) => {
    const source = Impulse.of({ count: 0 })
    const derived = Impulse.of((scope) => getValue(source, scope), {
      compare: Counter.compare,
    })

    const value_0 = getValue(derived, scope)

    act(() => {
      setValue(source, { count: 0 })
    })
    expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
      value_0,
      { count: 0 },
      scope,
    )
    vi.clearAllMocks()

    const value_1 = getValue(derived, scope)
    expect(Counter.compare).not.toHaveBeenCalled()
    expect(value_0).toBe(value_1)
    expect(value_0).toStrictEqual({ count: 0 })

    act(() => {
      setValue(source, { count: 1 })
    })
    expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
      value_1,
      { count: 1 },
      scope,
    )
    vi.clearAllMocks()

    const value_2 = getValue(derived, scope)
    expect(Counter.compare).not.toHaveBeenCalled()
    expect(value_2).not.toBe(value_1)
    expect(value_2).toStrictEqual({ count: 1 })
  })
})

describe.skipIf(process.env.CI).concurrent(
  "Impulse.of(getter) garbage collection",
  {
    timeout: 10000,
    retry: 2,
  },
  () => {
    it("cleanups immediately when source.setValue is called with the different value", ({
      scope,
    }) => {
      const source = Impulse.of(0)

      ;(() => {
        const derived = Impulse.of((scope) => ({
          count: source.getValue(scope),
        }))

        expect(source).toHaveEmittersSize(0)

        expect(derived.getValue(scope)).toStrictEqual({ count: 0 })
        expect(source).toHaveEmittersSize(1)
        expect(derived).toHaveEmittersSize(0)
      })()

      expect(source).toHaveEmittersSize(1)

      source.setValue(1)
      expect(source).toHaveEmittersSize(0)
    })

    it("cleanups the WeakRef when source.setValue is called with the same value", async ({
      scope,
    }) => {
      const source = Impulse.of(0)

      ;(() => {
        const derived = Impulse.of((scope) => ({
          count: source.getValue(scope),
        }))

        expect(source).toHaveEmittersSize(0)

        expect(derived.getValue(scope)).toStrictEqual({ count: 0 })
        expect(source).toHaveEmittersSize(1)
        expect(derived).toHaveEmittersSize(0)
      })()

      expect(source).toHaveEmittersSize(1)

      source.setValue(0)
      expect(source).toHaveEmittersSize(1)

      await waitFor(() => {
        expect(source).toHaveEmittersSize(0)
      })
    })

    it("cleanups the WeakRef", async ({ scope }) => {
      const source = Impulse.of(0)
      let derived: null | ReadonlyImpulse<Counter> = Impulse.of((scope) => ({
        count: source.getValue(scope),
      }))

      expect(derived.getValue(scope)).toStrictEqual({ count: 0 })
      expect(source).toHaveEmittersSize(1)
      expect(derived).toHaveEmittersSize(0)

      derived = null

      expect(source).toHaveEmittersSize(1)

      await waitFor(() => {
        expect(source).toHaveEmittersSize(0)
      })
    })

    it("cleanups the WeakRef from clojure", async ({ scope }) => {
      const source = Impulse.of(0)

      ;(() => {
        const derived = Impulse.of((scope) => ({
          count: source.getValue(scope),
        }))

        expect(derived.getValue(scope)).toStrictEqual({ count: 0 })
        expect(source).toHaveEmittersSize(1)
        expect(derived).toHaveEmittersSize(0)
      })()

      expect(source).toHaveEmittersSize(1)

      await waitFor(() => {
        expect(source).toHaveEmittersSize(0)
      })
    })

    it("cleanups the WeakRef from subscribe", async () => {
      const source = Impulse.of(0)

      ;(() => {
        const derived = Impulse.of((scope) => ({
          count: source.getValue(scope),
        }))

        const spy = vi.fn()

        const cleanup = subscribe((scope) => {
          spy(derived.getValue(scope))
        })

        expect(spy).toHaveBeenCalledExactlyOnceWith({ count: 0 })

        expect(source).toHaveEmittersSize(1)
        expect(derived).toHaveEmittersSize(1)

        cleanup()
        expect(source).toHaveEmittersSize(1)
        expect(derived).toHaveEmittersSize(0)
      })()

      expect(source).toHaveEmittersSize(1)

      await waitFor(() => {
        expect(source).toHaveEmittersSize(0)
      })
    })

    it("cleanups the WeakRef from untrack", async () => {
      const source = Impulse.of(0)

      ;(() => {
        const derived = Impulse.of((scope) => ({
          count: source.getValue(scope),
        }))

        expect(untrack(derived)).toStrictEqual({ count: 0 })
        expect(source).toHaveEmittersSize(1)
        expect(derived).toHaveEmittersSize(0)
      })()
      expect(source).toHaveEmittersSize(1)

      await waitFor(() => {
        expect(source).toHaveEmittersSize(0)
      })
    })

    it("cleanups the WeakRef from a hook", async () => {
      const source = Impulse.of(0)

      const { result, unmount } = renderHook(() => {
        const derived = Impulse.of((scope) => ({
          count: source.getValue(scope),
        }))

        return useScoped(derived)
      })

      expect(result.current).toStrictEqual({ count: 0 })
      expect(source).toHaveEmittersSize(1)

      unmount()
      expect(source).toHaveEmittersSize(1)

      await waitFor(() => {
        expect(source).toHaveEmittersSize(0)
      })
    })

    it("cleanups only unreachable dependencies", async ({ scope }) => {
      const source = Impulse.of(0)
      const derived_1 = Impulse.of((scope) => ({
        count: source.getValue(scope),
      }))

      expect(derived_1.getValue(scope)).toStrictEqual({ count: 0 })
      expect(source).toHaveEmittersSize(1)
      ;(() => {
        const derived_2 = Impulse.of((scope) => ({
          count: source.getValue(scope),
        }))

        expect(derived_2.getValue(scope)).toStrictEqual({ count: 0 })
        expect(source).toHaveEmittersSize(2)
        expect(derived_2).toHaveEmittersSize(0)
      })()
      ;(() => {
        const derived_3 = Impulse.of((scope) => ({
          count: source.getValue(scope),
        }))

        expect(derived_3.getValue(scope)).toStrictEqual({ count: 0 })
        expect(source).toHaveEmittersSize(3)
        expect(derived_3).toHaveEmittersSize(0)
      })()

      expect(source).toHaveEmittersSize(3)

      await waitFor(() => {
        expect(source).toHaveEmittersSize(1)
      })
    })
  },
)

describe("Impulse.of(getter, setter, options?)", () => {
  it("creates an Impulse", () => {
    let variable = 0
    const impulse = Impulse.of(
      () => variable,
      (value) => {
        variable = value
      },
    )

    expectTypeOf(impulse).toEqualTypeOf<Impulse<number>>()
    expectTypeOf(impulse).toMatchTypeOf<ReadonlyImpulse<number>>()
  })

  it("allows source as a Impulse", ({ scope }) => {
    const source = Impulse.of(0)
    const impulse = Impulse.of(source, () => {
      // noop
    })

    expect(impulse.getValue(scope)).toBe(0)
  })

  it("allows source as a ReadonlyImpulse", ({ scope }) => {
    const source = Impulse.of(() => 0)
    const derived = Impulse.of(source, () => {
      // noop
    })

    expect(derived.getValue(scope)).toBe(0)
  })

  it("allows source as a ImpulseGetter", ({ scope }) => {
    class Custom implements ImpulseGetter<number> {
      public readonly counter = Impulse.of(0)

      public getValue(scope: Scope): number {
        return this.counter.getValue(scope)
      }
    }

    const source = new Custom()
    const derived = Impulse.of(source, () => {
      // noop
    })

    expect(derived.getValue(scope)).toBe(0)

    act(() => {
      source.counter.setValue(1)
    })

    expect(derived.getValue(scope)).toBe(1)
  })

  it("does not allow setter as a ReadonlyImpulse", ({ scope }) => {
    const destination = Impulse.of(() => 0)
    // @ts-expect-error should be Impulse
    const impulse = Impulse.of(() => 2, [], destination)

    expect(impulse.getValue(scope)).toBe(2)
  })

  it("subscribes to Impulse source and back", () => {
    const source = Impulse.of({ count: 0 }, { compare: Counter.compare })
    const impulse = Impulse.of(
      (scope) => source.getValue(scope),
      (counter) => source.setValue(counter),
    )
    const spyOnImpulse = vi.fn()
    const spyOnSource = vi.fn()

    subscribe((scope) => {
      spyOnImpulse(impulse.getValue(scope))
    })
    subscribe((scope) => {
      spyOnSource(source.getValue(scope))
    })

    expect(spyOnImpulse).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(spyOnImpulse).toHaveBeenCalledExactlyOnceWith({ count: 1 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(spyOnImpulse).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.setValue({ count: 1 })
    expect(spyOnSource).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.setValue({ count: 2 })
    expect(spyOnSource).toHaveBeenCalledExactlyOnceWith({ count: 2 })
  })

  it("subscribes to ImpulseGetter/ImpulseSetter and back", () => {
    class Custom
      implements
        ImpulseGetter<{ count: number }>,
        ImpulseSetter<{ count: number }>
    {
      private readonly counter = Impulse.of(0)

      public getValue(scope: Scope): { count: number } {
        return { count: this.counter.getValue(scope) }
      }

      public setValue(value: { count: number }): void {
        this.counter.setValue(value.count)
      }
    }

    const source = new Custom()
    const impulse = Impulse.of(
      (scope) => source.getValue(scope),
      (counter) => source.setValue(counter),
    )
    const spyOnImpulse = vi.fn()
    const spyOnSource = vi.fn()

    subscribe((scope) => {
      spyOnImpulse(impulse.getValue(scope))
    })
    subscribe((scope) => {
      spyOnSource(source.getValue(scope))
    })

    expect(spyOnImpulse).toHaveBeenCalledExactlyOnceWith({ count: 0 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(spyOnImpulse).toHaveBeenCalledExactlyOnceWith({ count: 1 })
    vi.clearAllMocks()

    source.setValue({ count: 1 })
    expect(spyOnImpulse).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.setValue({ count: 1 })
    expect(spyOnSource).not.toHaveBeenCalled()
    vi.clearAllMocks()

    impulse.setValue({ count: 2 })
    expect(spyOnSource).toHaveBeenCalledExactlyOnceWith({ count: 2 })
  })

  it("assigns custom function as compare", ({ scope }) => {
    const source = Impulse.of({ count: 0 })
    const impulse = Impulse.of(
      (scope) => source.getValue(scope),
      (counter) => source.setValue(counter),
      {
        compare: Counter.compare,
      },
    )

    const value_0 = impulse.getValue(scope)

    act(() => {
      impulse.setValue({ count: 0 })
    })
    expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
      value_0,
      { count: 0 },
      scope,
    )
    vi.clearAllMocks()

    const value_1 = impulse.getValue(scope)
    expect(Counter.compare).not.toHaveBeenCalled()
    expect(value_1).toBe(value_0)

    act(() => {
      impulse.setValue({ count: 1 })
    })
    expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
      value_1,
      { count: 1 },
      scope,
    )
    vi.clearAllMocks()

    const value_2 = impulse.getValue(scope)
    expect(Counter.compare).not.toHaveBeenCalled()
    expect(value_2).not.toBe(value_1)
    expect(value_2).toStrictEqual({ count: 1 })
  })

  it("batches setter", () => {
    const impulse_1 = Impulse.of(1)
    const impulse_2 = Impulse.of(2)
    const impulse_3 = Impulse.of(3)
    const derived = Impulse.of(
      (scope) => {
        return (
          impulse_1.getValue(scope) +
          impulse_2.getValue(scope) +
          impulse_3.getValue(scope)
        )
      },
      (x) => {
        impulse_1.setValue(x)
        impulse_2.setValue(x)
        impulse_3.setValue(x)
      },
    )
    const spy = vi.fn()

    const { result } = renderHook(() => {
      return useScoped((scope) => {
        spy()

        return derived.getValue(scope)
      }, [])
    })

    expect(result.current).toBe(6)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      derived.setValue(4)
    })

    expect(result.current).toBe(12)
    expect(spy).toHaveBeenCalledOnce()
    vi.clearAllMocks()

    act(() => {
      derived.setValue(4)
    })

    expect(result.current).toBe(12)
    expect(spy).not.toHaveBeenCalled()
  })
})

describe("Impulse.isImpulse(input)", () => {
  const known_check = (input: number | Impulse<number>) => {
    if (Impulse.isImpulse(input)) {
      expectTypeOf(input).toEqualTypeOf<Impulse<number>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<number>()

    return false
  }

  const readonly_check = (input: number | ReadonlyImpulse<number>) => {
    if (Impulse.isImpulse(input)) {
      expectTypeOf(input).toEqualTypeOf<ReadonlyImpulse<number>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<number>()

    return false
  }

  const unknown_check = (input: unknown) => {
    if (Impulse.isImpulse(input)) {
      expectTypeOf(input).toEqualTypeOf<Impulse<unknown>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<unknown>()

    return false
  }

  it("returns true for Impulse", () => {
    const impulse = Impulse.of(0)
    const readonly = Impulse.of(() => 1)

    expect(known_check(impulse)).toBe(true)
    // @ts-expect-error should be Impulse<number>
    expect(known_check(readonly)).toBe(true)
    expect(readonly_check(impulse)).toBe(true)
    expect(readonly_check(readonly)).toBe(true)
    expect(unknown_check(impulse)).toBe(true)
    expect(unknown_check(readonly)).toBe(true)
  })

  it.each([
    ["number", 1],
    ["boolean", false],
    ["null", null],
    ["undefined", undefined],
    ["array", [1, 2, 3]],
    ["object", { count: 0 }],
  ])("returns false for %s", (_, value: unknown) => {
    // @ts-expect-error should be Impulse<number>
    expect(known_check(value)).toBe(false)
    expect(unknown_check(value)).toBe(false)
  })
})

describe("Impulse.isImpulse(scope, check, value)", () => {
  const known_check = (scope: Scope, impulse: string | Impulse<string>) => {
    if (Impulse.isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<string>()

    return false
  }

  const union_check = (
    scope: Scope,
    impulse: Impulse<string> | Impulse<number>,
  ) => {
    if (Impulse.isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<Impulse<number>>()

    return false
  }

  const union_value_check = (
    scope: Scope,
    impulse: Impulse<number | string>,
  ) => {
    if (Impulse.isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<number | string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<never>()

    return false
  }

  const readonly_check = (
    scope: Scope,
    impulse: string | ReadonlyImpulse<string>,
  ) => {
    if (Impulse.isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<ReadonlyImpulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<string>()

    return false
  }

  const unknown_check = (scope: Scope, impulse: unknown) => {
    if (Impulse.isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<unknown>()

    return false
  }

  it("returns true for Impulse with success check", ({ scope }) => {
    const impulse = Impulse.of("")
    const readonly = Impulse.of(() => "")

    expect(known_check(scope, impulse)).toBe(true)
    expect(union_check(scope, impulse)).toBe(true)
    expect(union_value_check(scope, Impulse.of<string | number>(""))).toBe(true)
    // @ts-expect-error should be Impulse<string>
    expect(known_check(scope, readonly)).toBe(true)
    expect(readonly_check(scope, impulse)).toBe(true)
    expect(readonly_check(scope, readonly)).toBe(true)
    expect(unknown_check(scope, impulse)).toBe(true)
    expect(unknown_check(scope, readonly)).toBe(true)
  })

  it("returns false for Impulse with failed check", ({ scope }) => {
    const impulse = Impulse.of(0)

    // @ts-expect-error should be Impulse<string>
    expect(known_check(scope, impulse)).toBe(false)
    expect(unknown_check(scope, impulse)).toBe(false)
  })

  describe.each([
    ["number", 1],
    ["boolean", false],
    ["null", null],
    ["undefined", undefined],
    ["array", [1, 2, 3]],
    ["object", { count: 0 }],
  ])("when input is %s", (_, value) => {
    it("returns false", ({ scope }) => {
      // @ts-expect-error should be Impulse<string>
      expect(known_check(scope, value)).toBe(false)
      expect(unknown_check(scope, value)).toBe(false)
    })
  })
})

function setupImpulse<T>(initialValue: T, options?: ImpulseOptions<T>) {
  const impulse = Impulse.of(initialValue, options)

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
    const source = Impulse.of(initialValue)
    const impulse = Impulse.of(
      getterShortcut ? source : (scope) => source.getValue(scope),
      setterShortcut ? source : (value) => source.setValue(value),
      options,
    )

    return {
      impulse,
      getValue: (scope: Scope) => source.getValue(scope),
      setValue: (value: T) => {
        source.setValue(value)
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
])("Impulse.of() from %s", (_, setup) => {
  describe("Impulse#setValue(value)", () => {
    const { impulse } = setup({ count: 0 })

    it("updates value", ({ scope }) => {
      const next = { count: 1 }
      impulse.setValue(next)
      expect(impulse.getValue(scope)).toBe(next)
    })

    it("updates with the same value", ({ scope }) => {
      const next = { count: 1 }
      impulse.setValue(next)
      expect(impulse.getValue(scope)).toBe(next)
    })

    it("updates with equal value", ({ scope }) => {
      const prev = impulse.getValue(scope)
      impulse.setValue(prev)
      expect(impulse.getValue(scope)).toBe(prev)
    })
  })

  describe("Impulse#setValue(transform)", () => {
    it("updates value", ({ scope }) => {
      const { impulse } = setup({ count: 0 })

      impulse.setValue(Counter.inc)
      expect(impulse.getValue(scope)).toStrictEqual({ count: 1 })
    })

    it("keeps the value", ({ scope }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.setValue((counter) => counter)
      expect(impulse.getValue(scope)).toBe(initial)
    })

    it("updates with the same value", ({ scope }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.setValue(Counter.clone)
      expect(impulse.getValue(scope)).not.toBe(initial)
      expect(impulse.getValue(scope)).toStrictEqual(initial)
    })

    it("keeps the value if it is equal", ({ scope }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial, { compare: Counter.compare })

      impulse.setValue(Counter.clone)
      expect(impulse.getValue(scope)).toBe(initial)
      expect(impulse.getValue(scope)).toStrictEqual(initial)
    })

    it("updates with the equal value", ({ scope }) => {
      const initial = { count: 0 }
      const { impulse } = setup(initial)

      impulse.setValue(() => initial)
      expect(impulse.getValue(scope)).toBe(initial)
    })
  })

  describe("Impulse#clone()", () => {
    it("creates new Impulse", ({ scope }) => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone()

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue(scope)).toBe(impulse_2.getValue(scope))
    })

    it("does not update source value when clone updates", ({ scope }) => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone()

      impulse_2.setValue({ count: 1 })

      expect(impulse_1.getValue(scope)).toStrictEqual({ count: 0 })
      expect(impulse_2.getValue(scope)).toStrictEqual({ count: 1 })
    })

    it("does not update clone value when source updates", ({ scope }) => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone()

      impulse_1.setValue({ count: 1 })

      expect(impulse_1.getValue(scope)).toStrictEqual({ count: 1 })
      expect(impulse_2.getValue(scope)).toStrictEqual({ count: 0 })
    })

    it("transfers comparator from source Impulse", () => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone()

      expect(Object.is).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Object.is).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
      )
    })

    it("transfers custom comparator from source Impulse", ({ scope }) => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone()

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
        scope,
      )
    })
  })

  describe("Impulse#clone(options)", () => {
    it("inherits custom comparator by empty options", ({ scope }) => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone({})

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
        scope,
      )
    })

    it("inherits custom comparator by options.compare: undefined", ({
      scope,
    }) => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone({ compare: undefined })

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
        scope,
      )
    })

    it("overrides custom comparator as Object.is by options.compare: null", () => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone({ compare: null })

      expect(Object.is).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Object.is).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
      )
    })

    it("overrides comparator by custom options.compare", ({ scope }) => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone({ compare: Counter.compare })

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
        scope,
      )
    })
  })

  describe("Impulse#clone(transform)", () => {
    it("creates new Impulse", ({ scope }) => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone(Counter.clone)

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue(scope)).not.toBe(impulse_2.getValue(scope))
      expect(impulse_1.getValue(scope)).toStrictEqual(impulse_2.getValue(scope))
    })

    it("keeps comparator from source", ({ scope }) => {
      const { impulse: impulse_1 } = setup(
        { count: 0 },
        { compare: Counter.compare },
      )
      const impulse_2 = impulse_1.clone(Counter.clone)

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
        scope,
      )
    })

    it("creates new nested Impulse with clone(transform)", ({ scope }) => {
      const { impulse: impulse_1 } = setup({
        count: setup(0).impulse,
        name: setup("John").impulse,
      })
      const impulse_2 = impulse_1.clone(({ count, name }) => ({
        count: count.clone(),
        name: name.clone(),
      }))

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue(scope)).not.toBe(impulse_2.getValue(scope))
      expect(impulse_1.getValue(scope).count).not.toBe(
        impulse_2.getValue(scope).count,
      )
      expect(impulse_1.getValue(scope).name).not.toBe(
        impulse_2.getValue(scope).name,
      )
      expect({
        count: impulse_1.getValue(scope).count.getValue(scope),
        name: impulse_1.getValue(scope).name.getValue(scope),
      }).toStrictEqual({
        count: impulse_2.getValue(scope).count.getValue(scope),
        name: impulse_2.getValue(scope).name.getValue(scope),
      })

      // the nested impulses are independent
      impulse_1.getValue(scope).count.setValue(1)
      expect(impulse_1.getValue(scope).count.getValue(scope)).toBe(1)
      expect(impulse_2.getValue(scope).count.getValue(scope)).toBe(0)

      impulse_1.getValue(scope).name.setValue("Doe")
      expect(impulse_1.getValue(scope).name.getValue(scope)).toBe("Doe")
      expect(impulse_2.getValue(scope).name.getValue(scope)).toBe("John")
    })

    it("creates shallow nested Impulse with clone()", ({ scope }) => {
      const { impulse: impulse_1 } = setup({
        count: setup(0).impulse,
        name: setup("John").impulse,
      })
      const impulse_2 = impulse_1.clone()

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue(scope)).toBe(impulse_2.getValue(scope))
      expect(impulse_1.getValue(scope).count).toBe(
        impulse_2.getValue(scope).count,
      )
      expect(impulse_1.getValue(scope).name).toBe(
        impulse_2.getValue(scope).name,
      )
      expect({
        count: impulse_1.getValue(scope).count.getValue(scope),
        name: impulse_1.getValue(scope).name.getValue(scope),
      }).toStrictEqual({
        count: impulse_1.getValue(scope).count.getValue(scope),
        name: impulse_1.getValue(scope).name.getValue(scope),
      })

      // the nested impulses are dependent
      impulse_1.getValue(scope).count.setValue(1)
      expect(impulse_1.getValue(scope).count.getValue(scope)).toBe(1)
      expect(impulse_2.getValue(scope).count.getValue(scope)).toBe(1)

      impulse_1.getValue(scope).name.setValue("Doe")
      expect(impulse_1.getValue(scope).name.getValue(scope)).toBe("Doe")
      expect(impulse_2.getValue(scope).name.getValue(scope)).toBe("Doe")
    })
  })

  describe("Impulse#clone(transform, options)", () => {
    it("creates new Impulse with custom compare", ({ scope }) => {
      const { impulse: impulse_1 } = setup({ count: 0 })
      const impulse_2 = impulse_1.clone(Counter.clone, {
        compare: Counter.compare,
      })

      expect(impulse_1).not.toBe(impulse_2)
      expect(impulse_1.getValue(scope)).not.toBe(impulse_2.getValue(scope))
      expect(impulse_1.getValue(scope)).toStrictEqual(impulse_2.getValue(scope))

      expect(Counter.compare).not.toHaveBeenCalled()
      impulse_2.setValue({ count: 1 })

      expect(Counter.compare).toHaveBeenCalledExactlyOnceWith(
        { count: 0 },
        { count: 1 },
        scope,
      )
    })
  })

  describe("Impulse#toJSON()", () => {
    it("converts value to JSON", () => {
      const { impulse } = setup({
        number: 0,
        string: "biba",
        boolean: false,
        undefined: undefined,
        null: null,
        array: [1, "boba", true, undefined, null],
        object: {
          number: 2,
          string: "baba",
          boolean: false,
          undefined: undefined,
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
