import z from "zod"

import { params } from "~/tools/params"

import { FormOptional, FormUnit } from "../../src"

describe("types", () => {
  const form = FormOptional(
    FormUnit(true, { schema: z.boolean() }),
    FormUnit(0, { schema: z.number().min(1) }),
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

  it("matches schema type for isDirty(monitor, select?)", ({ monitor }) => {
    expectTypeOf(form.isDirty(monitor)).toEqualTypeOf<boolean>()

    expectTypeOf(form.isDirty(monitor, params._first)).toEqualTypeOf<FlagSchema>()
    expectTypeOf(form.isDirty(monitor, params._second)).toEqualTypeOf<FlagVerboseSchema>()
  })
})

describe("runtime", () => {
  it("reflects dirtiness based on children", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, { schema: z.boolean() }),
      FormUnit(1, { schema: z.number() }),
    )

    expect(form.isDirty(monitor)).toBe(false)

    form.element.setInput(2)

    expect(form.isDirty(monitor)).toBe(true)

    form.reset()

    expect(form.isDirty(monitor)).toBe(false)

    form.enabled.setInput(false)

    expect(form.isDirty(monitor)).toBe(true)
  })
})
