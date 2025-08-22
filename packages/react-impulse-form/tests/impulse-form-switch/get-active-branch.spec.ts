import z from "zod"

import { ImpulseFormShape, ImpulseFormSwitch, ImpulseFormUnit } from "../../src"

describe("types", () => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    },
  )

  type ActiveBranch =
    | {
        readonly kind: "_1"
        readonly value: ImpulseFormUnit<
          boolean,
          ReadonlyArray<string>,
          "ok" | "not ok"
        >
      }
    | {
        readonly kind: "_2"
        readonly value: ImpulseFormShape<{
          _3: ImpulseFormUnit<string>
          _4: ImpulseFormUnit<number>
        }>
      }

  it("matches schema type for getActiveBranch(scope)", () => {
    expectTypeOf(form.getActiveBranch).returns.toEqualTypeOf<
      undefined | ActiveBranch
    >()
  })
})
