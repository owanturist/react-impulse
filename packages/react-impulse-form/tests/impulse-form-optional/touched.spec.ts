import z from "zod"

import { params } from "~/tools/params"

import { ImpulseFormOptional, ImpulseFormUnit } from "../../src"

describe("types", () => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit(0, { schema: z.number() }),
  )

  type TouchedSchema =
    | boolean
    | { readonly enabled: boolean; readonly element: boolean }

  interface TouchedVerboseSchema {
    readonly enabled: boolean
    readonly element: boolean
  }

  it("matches schema type for isTouched(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isTouched(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(
      form.isTouched(scope, params._first),
    ).toEqualTypeOf<TouchedSchema>()

    expectTypeOf(
      form.isTouched(scope, params._second),
    ).toEqualTypeOf<TouchedVerboseSchema>()
  })
})

describe("basic behavior", () => {
  it("propagates setTouched to children", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      ImpulseFormUnit(1, { schema: z.number() }),
    )

    expect(form.isTouched(scope)).toBe(false)

    form.setTouched(true)

    expect(form.isTouched(scope)).toBe(true)
    expect(form.isTouched(scope, params._second)).toStrictEqual({
      enabled: true,
      element: true,
    })

    form.setTouched({ enabled: false })

    expect(form.isTouched(scope, params._first)).toStrictEqual({
      enabled: false,
      element: true,
    })

    form.setTouched({ element: false })

    expect(form.isTouched(scope, params._first)).toStrictEqual({
      enabled: false,
      element: false,
    })
  })
})

describe("stable touched value", () => {
  it("subsequently selects equal touched", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      ImpulseFormUnit(1, { schema: z.number() }),
    )

    expect(form.isTouched(scope)).toBeTypeOf("boolean")
    expect(form.isTouched(scope)).toBe(form.isTouched(scope))

    expect(form.isTouched(scope, params._first)).toBeInstanceOf(Object)
    expect(form.isTouched(scope, params._first)).toBe(
      form.isTouched(scope, params._first),
    )
    expect(form.isTouched(scope, params._second)).toBeInstanceOf(Object)
    expect(form.isTouched(scope, params._second)).toBe(
      form.isTouched(scope, params._second),
    )
  })
})
