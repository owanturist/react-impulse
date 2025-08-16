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

  it("matches schema type for isValidated(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isValidated(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(
      form.isValidated(scope, params._first),
    ).toEqualTypeOf<FlagSchema>()
    expectTypeOf(
      form.isValidated(scope, params._second),
    ).toEqualTypeOf<FlagVerboseSchema>()
  })
})

describe.each([
  "onTouch" as const,
  "onChange" as const,
  "onSubmit" as const,
  "onInit" as const,
])("runtime when validateOn=%s", (validateOn) => {
  it("reflects validated based on children", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean(), validateOn }),
      ImpulseFormUnit(0, { schema: z.number().min(1), validateOn }),
    )

    expect(form.isValidated(scope)).toBe(validateOn !== "onInit")
    expect(form.isValidated(scope, params._second)).toStrictEqual({
      enabled: validateOn !== "onInit",
      element: validateOn !== "onInit",
    })
  })
})
