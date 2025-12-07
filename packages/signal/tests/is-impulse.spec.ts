import { isString } from "~/tools/is-string"

import { Impulse, type Monitor, type ReadonlyImpulse, isImpulse } from "../src"

describe("isImpulse(input)", () => {
  const knownCheck = (input: number | Impulse<number>) => {
    if (isImpulse(input)) {
      expectTypeOf(input).toEqualTypeOf<Impulse<number>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<number>()

    return false
  }

  const readonlyCheck = (input: number | ReadonlyImpulse<number>) => {
    if (isImpulse(input)) {
      expectTypeOf(input).toEqualTypeOf<ReadonlyImpulse<number>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<number>()

    return false
  }

  const unknownCheck = (input: unknown) => {
    if (isImpulse(input)) {
      expectTypeOf(input).toEqualTypeOf<Impulse<unknown>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<unknown>()

    return false
  }

  it("returns true for Impulse", () => {
    const impulse = Impulse(0)
    const readonly = Impulse(() => 1)

    expect(knownCheck(impulse)).toBe(true)
    // @ts-expect-error should be Impulse<number>
    expect(knownCheck(readonly)).toBe(true)
    expect(readonlyCheck(impulse)).toBe(true)
    expect(readonlyCheck(readonly)).toBe(true)
    expect(unknownCheck(impulse)).toBe(true)
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
    // @ts-expect-error should be Impulse<number>
    expect(knownCheck(value)).toBe(false)
    expect(unknownCheck(value)).toBe(false)
  })
})

describe("isImpulse(monitor, check, value)", () => {
  const knownCheck = (monitor: Monitor, impulse: string | Impulse<string>) => {
    if (isImpulse(monitor, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<string>()

    return false
  }

  const unionCheck = (monitor: Monitor, impulse: Impulse<string> | Impulse<number>) => {
    if (isImpulse(monitor, isString<string>, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<Impulse<number>>()

    return false
  }

  const unionValueCheck = (monitor: Monitor, impulse: Impulse<number | string>) => {
    if (isImpulse(monitor, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<number | string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<never>()

    return false
  }

  const readonlyCheck = (monitor: Monitor, impulse: string | ReadonlyImpulse<string>) => {
    if (isImpulse(monitor, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<ReadonlyImpulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<string>()

    return false
  }

  const unknownCheck = (monitor: Monitor, impulse: unknown) => {
    if (isImpulse(monitor, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<unknown>()

    return false
  }

  it("returns true for Impulse with success check", ({ monitor }) => {
    const impulse = Impulse("")
    const readonly = Impulse(() => "")
    const union = Impulse<string | number>("")

    expect(knownCheck(monitor, impulse)).toBe(true)
    expect(unionCheck(monitor, impulse)).toBe(true)
    expect(unionValueCheck(monitor, union)).toBe(true)
    // @ts-expect-error should be Impulse<string>
    expect(knownCheck(monitor, readonly)).toBe(true)
    expect(readonlyCheck(monitor, impulse)).toBe(true)
    expect(readonlyCheck(monitor, readonly)).toBe(true)
    expect(unknownCheck(monitor, impulse)).toBe(true)
    expect(unknownCheck(monitor, readonly)).toBe(true)
  })

  it("returns false for Impulse with failed check", ({ monitor }) => {
    const impulse = Impulse(0)

    // @ts-expect-error should be Impulse<string>
    expect(knownCheck(monitor, impulse)).toBe(false)
    expect(unknownCheck(monitor, impulse)).toBe(false)
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
      // @ts-expect-error should be Impulse<string>
      expect(knownCheck(monitor, value)).toBe(false)
      expect(unknownCheck(monitor, value)).toBe(false)
    })
  })
})
