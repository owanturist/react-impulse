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

  it("matches schema type for isInvalid(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isInvalid(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(
      form.isInvalid(scope, params._first),
    ).toEqualTypeOf<FlagSchema>()
    expectTypeOf(
      form.isInvalid(scope, params._second),
    ).toEqualTypeOf<FlagVerboseSchema>()
  })
})

describe("runtime", () => {
  it("reflects invalidity based on children", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      ImpulseFormUnit(0, { schema: z.number().min(1) }),
    )

    expect(form.isInvalid(scope)).toBe(true)

    form.element.setInput(2)

    expect(form.isInvalid(scope)).toBe(false)

    form.enabled.setInput(false)

    expect(form.isInvalid(scope)).toBe(false)
  })
})
