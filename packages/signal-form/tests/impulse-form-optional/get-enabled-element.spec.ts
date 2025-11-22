import z from "zod"

import { ImpulseFormOptional, ImpulseFormShape, ImpulseFormUnit } from "../../src"

describe("types", () => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true),
    ImpulseFormShape({
      _1: ImpulseFormUnit("name", {
        schema: z.string().transform((input) => input.length),
      }),
      _2: ImpulseFormUnit(true, {
        error: 123,
      }),
    }),
  )

  type EnabledElement = ImpulseFormShape<{
    _1: ImpulseFormUnit<string, ReadonlyArray<string>, number>
    _2: ImpulseFormUnit<boolean, number>
  }>

  it("matches schema type for getEnabledElement(scope)", () => {
    expectTypeOf(form.getEnabledElement).returns.toEqualTypeOf<undefined | EnabledElement>()
  })
})
