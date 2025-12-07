import { Impulse } from "../src"

import { Counter } from "./common"

describe("Impulse()", () => {
  it("creates an Impulse of undefined | T type", () => {
    const impulse = Impulse<string>()

    expectTypeOf(impulse).toEqualTypeOf<Impulse<string | undefined>>()
  })

  it("should create an impulse with undefined initial value", ({ monitor }) => {
    const impulse = Impulse<number>()

    expect(impulse.read(monitor)).toBeUndefined()
  })

  it("updates the impulse with a new value", ({ monitor }) => {
    const impulse = Impulse<number>()

    impulse.update(1)

    expect(impulse.read(monitor)).toBe(1)
  })

  it("updates the impulse with a undefined", ({ monitor }) => {
    const impulse = Impulse<number>()

    impulse.update(1)
    impulse.update(undefined)

    expect(impulse.read(monitor)).toBeUndefined()
  })
})

describe("Impulse(value, options?)", () => {
  it("does not call equals on init", () => {
    Impulse({ count: 0 }, { equals: Counter.equals })

    expect(Counter.equals).not.toHaveBeenCalled()
  })

  it("assigns Object.is as default equals", () => {
    const impulse = Impulse({ count: 0 })

    impulse.update({ count: 1 })
    expect(Object.is).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
  })

  it("assigns Object.is by `null` as equals", () => {
    const impulse = Impulse({ count: 0 }, { equals: null })

    impulse.update({ count: 1 })
    expect(Object.is).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
  })

  it("assigns custom function as equals", () => {
    const impulse = Impulse({ count: 0 }, { equals: Counter.equals })

    impulse.update({ count: 1 })
    expect(Counter.equals).toHaveBeenCalledExactlyOnceWith({ count: 0 }, { count: 1 })
  })

  it("carries the function value wrapped in an object", ({ monitor }) => {
    const impulse = Impulse({ fn: (input: number) => input })

    expectTypeOf(impulse).toEqualTypeOf<
      Impulse<{
        fn: (input: number) => number
      }>
    >()
    expectTypeOf(impulse.read(monitor)).toEqualTypeOf<{
      fn: (input: number) => number
    }>()
    expect(impulse.read(monitor).fn(42)).toBe(42)
  })
})
