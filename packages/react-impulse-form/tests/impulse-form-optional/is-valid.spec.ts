import z from "zod"

import { params } from "~/tools/params"

import { ImpulseFormOptional, ImpulseFormUnit } from "../../src"

describe("types", () => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit(0, { schema: z.number().min(1) }),
  )

  type FlagSchema =
    | boolean
    | { readonly enabled: boolean; readonly element: boolean }

  interface FlagVerboseSchema {
    readonly enabled: boolean
    readonly element: boolean
  }

  it("matches schema type for isValid(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isValid(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(form.isValid(scope, params._first)).toEqualTypeOf<FlagSchema>()
    expectTypeOf(
      form.isValid(scope, params._second),
    ).toEqualTypeOf<FlagVerboseSchema>()
  })
})

describe("runtime", () => {
  it("reflects validity based on children", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      ImpulseFormUnit(0, { schema: z.number().min(1) }),
    )

    expect(form.isValid(scope)).toBe(false)
    expect(form.isValid(scope, params._second)).toStrictEqual({
      enabled: true,
      element: false,
    })

    form.element.setInput(2)

    expect(form.isValid(scope)).toBe(true)
    expect(form.isValid(scope, params._second)).toStrictEqual({
      enabled: true,
      element: true,
    })

    form.enabled.setInput(false)

    expect(form.isValid(scope)).toBe(true)
    expect(form.isValid(scope, params._second)).toStrictEqual({
      enabled: false,
      element: true,
    })
  })
})
