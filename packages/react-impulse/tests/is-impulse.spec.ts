import { isString } from "~/tools/is-string"

import { Impulse, type ReadonlyImpulse, type Scope, isImpulse } from "../src"

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

describe("isImpulse(scope, check, value)", () => {
  const knownCheck = (scope: Scope, impulse: string | Impulse<string>) => {
    if (isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<string>()

    return false
  }

  const unionCheck = (scope: Scope, impulse: Impulse<string> | Impulse<number>) => {
    if (isImpulse(scope, isString<string>, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<Impulse<number>>()

    return false
  }

  const unionValueCheck = (scope: Scope, impulse: Impulse<number | string>) => {
    if (isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<number | string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<never>()

    return false
  }

  const readonlyCheck = (scope: Scope, impulse: string | ReadonlyImpulse<string>) => {
    if (isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<ReadonlyImpulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<string>()

    return false
  }

  const unknownCheck = (scope: Scope, impulse: unknown) => {
    if (isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<Impulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<unknown>()

    return false
  }

  it("returns true for Impulse with success check", ({ scope }) => {
    const impulse = Impulse("")
    const readonly = Impulse(() => "")
    const union = Impulse<string | number>("")

    expect(knownCheck(scope, impulse)).toBe(true)
    expect(unionCheck(scope, impulse)).toBe(true)
    expect(unionValueCheck(scope, union)).toBe(true)
    // @ts-expect-error should be Impulse<string>
    expect(knownCheck(scope, readonly)).toBe(true)
    expect(readonlyCheck(scope, impulse)).toBe(true)
    expect(readonlyCheck(scope, readonly)).toBe(true)
    expect(unknownCheck(scope, impulse)).toBe(true)
    expect(unknownCheck(scope, readonly)).toBe(true)
  })

  it("returns false for Impulse with failed check", ({ scope }) => {
    const impulse = Impulse(0)

    // @ts-expect-error should be Impulse<string>
    expect(knownCheck(scope, impulse)).toBe(false)
    expect(unknownCheck(scope, impulse)).toBe(false)
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
      expect(knownCheck(scope, value)).toBe(false)
      expect(unknownCheck(scope, value)).toBe(false)
    })
  })
})
