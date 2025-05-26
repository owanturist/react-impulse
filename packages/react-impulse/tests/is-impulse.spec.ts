import { isString } from "~/tools/is-string"

import { Impulse, type ReadonlyImpulse, type Scope, isImpulse } from "../src"

describe("isImpulse(input)", () => {
  const known_check = (input: number | Impulse<number>) => {
    if (isImpulse(input)) {
      expectTypeOf(input).toEqualTypeOf<Impulse<number>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<number>()

    return false
  }

  const readonly_check = (input: number | ReadonlyImpulse<number>) => {
    if (isImpulse(input)) {
      expectTypeOf(input).toEqualTypeOf<ReadonlyImpulse<number>>()

      return true
    }

    expectTypeOf(input).toEqualTypeOf<number>()

    return false
  }

  const unknown_check = (input: unknown) => {
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

describe("isImpulse(scope, check, value)", () => {
  const known_check = (scope: Scope, impulse: string | Impulse<string>) => {
    if (isImpulse(scope, isString, impulse)) {
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
    if (isImpulse(scope, isString, impulse)) {
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
    if (isImpulse(scope, isString, impulse)) {
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
    if (isImpulse(scope, isString, impulse)) {
      expectTypeOf(impulse).toEqualTypeOf<ReadonlyImpulse<string>>()

      return true
    }

    expectTypeOf(impulse).toEqualTypeOf<string>()

    return false
  }

  const unknown_check = (scope: Scope, impulse: unknown) => {
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

    expect(known_check(scope, impulse)).toBe(true)
    expect(union_check(scope, impulse)).toBe(true)
    expect(union_value_check(scope, union)).toBe(true)
    // @ts-expect-error should be Impulse<string>
    expect(known_check(scope, readonly)).toBe(true)
    expect(readonly_check(scope, impulse)).toBe(true)
    expect(readonly_check(scope, readonly)).toBe(true)
    expect(unknown_check(scope, impulse)).toBe(true)
    expect(unknown_check(scope, readonly)).toBe(true)
  })

  it("returns false for Impulse with failed check", ({ scope }) => {
    const impulse = Impulse(0)

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
