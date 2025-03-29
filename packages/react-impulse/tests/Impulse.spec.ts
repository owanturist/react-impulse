import { type ReadonlyImpulse, Impulse, type Scope } from "../src"

import { Counter } from "./common"

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
    const readonly: ReadonlyImpulse<number> = Impulse.of(123)

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
    const readonly: ReadonlyImpulse<string> = Impulse.of("")

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
