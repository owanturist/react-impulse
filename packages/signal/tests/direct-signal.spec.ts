import { Counter } from "~/tools/testing/counter"

import { Signal } from "../src"

describe("Signal()", () => {
  it("creates an Signal of undefined | T type", () => {
    const signal = Signal<string>()

    expectTypeOf(signal).toEqualTypeOf<Signal<string | undefined>>()
  })

  it("should create an signal with undefined initial value", ({ monitor }) => {
    const signal = Signal<number>()

    expect(signal.read(monitor)).toBeUndefined()
  })

  it("updates the signal with a new value", ({ monitor }) => {
    const signal = Signal<number>()

    signal.write(1)

    expect(signal.read(monitor)).toBe(1)
  })

  it("updates the signal with a undefined", ({ monitor }) => {
    const signal = Signal<number>()

    signal.write(1)
    signal.write(undefined)

    expect(signal.read(monitor)).toBeUndefined()
  })
})

describe("Signal(value, options?)", () => {
  it("does not call equals on init", () => {
    Signal({ count: 0 }, { equals: Counter.equals })

    expect(Counter.equals).not.toHaveBeenCalled()
  })

  it("assigns Object.is as default equals", () => {
    const signal = Signal({ count: 0 })

    signal.write({ count: 1 })
    expect(Object.is).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
  })

  it("assigns Object.is by `null` as equals", () => {
    const signal = Signal({ count: 0 }, { equals: null })

    signal.write({ count: 1 })
    expect(Object.is).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
  })

  it("assigns custom function as equals", () => {
    const signal = Signal({ count: 0 }, { equals: Counter.equals })

    signal.write({ count: 1 })
    expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
  })

  it("carries the function value wrapped in an object", ({ monitor }) => {
    const signal = Signal({ fn: (input: number) => input })

    expectTypeOf(signal).toEqualTypeOf<
      Signal<{
        fn: (input: number) => number
      }>
    >()
    expectTypeOf(signal.read(monitor)).toEqualTypeOf<{
      fn: (input: number) => number
    }>()
    expect(signal.read(monitor).fn(42)).toBe(42)
  })
})
