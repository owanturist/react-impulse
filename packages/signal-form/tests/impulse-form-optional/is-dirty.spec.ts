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
    | {
        readonly enabled: boolean
        readonly element: boolean
      }

  interface FlagVerboseSchema {
    readonly enabled: boolean
    readonly element: boolean
  }

  it("matches schema type for isDirty(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isDirty(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(form.isDirty(scope, params._first)).toEqualTypeOf<FlagSchema>()
    expectTypeOf(form.isDirty(scope, params._second)).toEqualTypeOf<FlagVerboseSchema>()
  })
})

describe("runtime", () => {
  it("reflects dirtiness based on children", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      ImpulseFormUnit(1, { schema: z.number() }),
    )

    expect(form.isDirty(scope)).toBe(false)

    form.element.setInput(2)

    expect(form.isDirty(scope)).toBe(true)

    form.reset()

    expect(form.isDirty(scope)).toBe(false)

    form.enabled.setInput(false)

    expect(form.isDirty(scope)).toBe(true)
  })
})
