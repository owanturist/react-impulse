import { isString } from "~/tools/is-string"

import { type Monitor, type ReadonlySignal, Signal, isSignal } from "../src"

describe("isSignal(input)", () => {
  const knownCheck = (input: number | Signal<number>) => {
    if (isSignal(input)) {
      expectTypeOf(input).toEqualTypeOf<Signal<number>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<number>()

    return false
  }

  const readonlyCheck = (input: number | ReadonlySignal<number>) => {
    if (isSignal(input)) {
      expectTypeOf(input).toEqualTypeOf<ReadonlySignal<number>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<number>()

    return false
  }

  const unknownCheck = (input: unknown) => {
    if (isSignal(input)) {
      expectTypeOf(input).toEqualTypeOf<Signal<unknown>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<unknown>()

    return false
  }

  it("returns true for Signal", () => {
    const signal = Signal(0)
    const readonly = Signal(() => 1)

    expect(knownCheck(signal)).toBe(true)
    // @ts-expect-error should be Signal<number>
    expect(knownCheck(readonly)).toBe(true)
    expect(readonlyCheck(signal)).toBe(true)
    expect(readonlyCheck(readonly)).toBe(true)
    expect(unknownCheck(signal)).toBe(true)
    expect(unknownCheck(readonly)).toBe(true)
  })

  it.each([
    ["number", 1],
    ["boolean", false],
    ["null", null],
    ["undefined", undefined],
    ["array", [1, 2, 3]],
    ["object", { count: 0 }],
  ])("returns false for %s", (_, value: unknown) => {
    // @ts-expect-error should be Signal<number>
    expect(knownCheck(value)).toBe(false)
    expect(unknownCheck(value)).toBe(false)
  })
})

describe("isSignal(monitor, check, value)", () => {
  const knownCheck = (monitor: Monitor, signal: string | Signal<string>) => {
    if (isSignal(monitor, isString, signal)) {
      expectTypeOf(signal).toEqualTypeOf<Signal<string>>()

      return true
    }

    expectTypeOf(signal).toEqualTypeOf<string>()

    return false
  }

  const unionCheck = (monitor: Monitor, signal: Signal<string> | Signal<number>) => {
    if (isSignal(monitor, isString<string>, signal)) {
      expectTypeOf(signal).toEqualTypeOf<Signal<string>>()

      return true
    }

    expectTypeOf(signal).toEqualTypeOf<Signal<number>>()

    return false
  }

  const unionValueCheck = (monitor: Monitor, signal: Signal<number | string>) => {
    if (isSignal(monitor, isString, signal)) {
      expectTypeOf(signal).toEqualTypeOf<Signal<number | string>>()

      return true
    }

    expectTypeOf(signal).toEqualTypeOf<never>()

    return false
  }

  const readonlyCheck = (monitor: Monitor, signal: string | ReadonlySignal<string>) => {
    if (isSignal(monitor, isString, signal)) {
      expectTypeOf(signal).toEqualTypeOf<ReadonlySignal<string>>()

      return true
    }

    expectTypeOf(signal).toEqualTypeOf<string>()

    return false
  }

  const unknownCheck = (monitor: Monitor, signal: unknown) => {
    if (isSignal(monitor, isString, signal)) {
      expectTypeOf(signal).toEqualTypeOf<Signal<string>>()

      return true
    }

    expectTypeOf(signal).toEqualTypeOf<unknown>()

    return false
  }

  it("returns true for Signal with success check", ({ monitor }) => {
    const signal = Signal("")
    const readonly = Signal(() => "")
    const union = Signal<string | number>("")

    expect(knownCheck(monitor, signal)).toBe(true)
    expect(unionCheck(monitor, signal)).toBe(true)
    expect(unionValueCheck(monitor, union)).toBe(true)
    // @ts-expect-error should be Signal<string>
    expect(knownCheck(monitor, readonly)).toBe(true)
    expect(readonlyCheck(monitor, signal)).toBe(true)
    expect(readonlyCheck(monitor, readonly)).toBe(true)
    expect(unknownCheck(monitor, signal)).toBe(true)
    expect(unknownCheck(monitor, readonly)).toBe(true)
  })

  it("returns false for Signal with failed check", ({ monitor }) => {
    const signal = Signal(0)

    // @ts-expect-error should be Signal<string>
    expect(knownCheck(monitor, signal)).toBe(false)
    expect(unknownCheck(monitor, signal)).toBe(false)
  })

  describe.each([
    ["number", 1],
    ["boolean", false],
    ["null", null],
    ["undefined", undefined],
    ["array", [1, 2, 3]],
    ["object", { count: 0 }],
  ])("when input is %s", (_, value) => {
    it("returns false", ({ monitor }) => {
      // @ts-expect-error should be Signal<string>
      expect(knownCheck(monitor, value)).toBe(false)
      expect(unknownCheck(monitor, value)).toBe(false)
    })
  })
})
