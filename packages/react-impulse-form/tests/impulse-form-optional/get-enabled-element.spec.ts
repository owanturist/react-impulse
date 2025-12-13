import z from "zod"

import { FormOptional, FormShape, FormUnit } from "../../src"

describe("types", () => {
  const form = FormOptional(
    FormUnit(true),
    FormShape({
      _1: FormUnit("name", {
        schema: z.string().transform((input) => input.length),
      }),
      _2: FormUnit(true, {
        error: 123,
      }),
    }),
  )

  type EnabledElement = FormShape<{
    _1: FormUnit<string, ReadonlyArray<string>, number>
    _2: FormUnit<boolean, number>
  }>

  it("matches schema type for getEnabledElement(monitor)", () => {
    expectTypeOf(form.getEnabledElement).returns.toEqualTypeOf<undefined | EnabledElement>()
  })
})
