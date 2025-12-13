import z from "zod"

import { FormShape, FormSwitch, FormUnit } from "../../src"

describe("types", () => {
  const form = FormSwitch(
    FormUnit("", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: FormUnit(true, {
        schema: z.boolean().transform((value) => (value ? "ok" : "not ok")),
      }),
      _2: FormShape({
        _3: FormUnit("name"),
        _4: FormUnit(18),
      }),
    },
  )

  type ActiveBranch =
    | {
        readonly kind: "_1"
        readonly value: FormUnit<boolean, ReadonlyArray<string>, "ok" | "not ok">
      }
    | {
        readonly kind: "_2"
        readonly value: FormShape<{
          _3: FormUnit<string>
          _4: FormUnit<number>
        }>
      }

  it("matches schema type for getActiveBranch(monitor)", () => {
    expectTypeOf(form.getActiveBranch).returns.toEqualTypeOf<undefined | ActiveBranch>()
  })
})
