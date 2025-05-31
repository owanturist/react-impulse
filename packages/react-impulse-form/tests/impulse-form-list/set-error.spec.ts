import type { Setter } from "~/tools/setter"

import { ImpulseFormList, ImpulseFormUnit } from "../../src"

it("matches the type definition", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, {
      validate: (input) => (input === 0 ? ["fail", null] : [null, input]),
    }),
  ])

  expectTypeOf(form.setError).toEqualTypeOf<
    (
      setter: Setter<
        null | ReadonlyArray<undefined | Setter<null | string>>,
        [ReadonlyArray<null | string>]
      >,
    ) => void
  >()

  expectTypeOf(form.getElements(scope).at(0)!.setError).toEqualTypeOf<
    (setter: Setter<null | string>) => void
  >()
})

it("resets all errors with null", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { error: ["err0"] }),
    ImpulseFormUnit(1, { error: ["err1"] }),
    ImpulseFormUnit(2, { error: ["err2"] }),
  ])

  form.setError(null)
  expect(form.getError(scope)).toBeNull()
})

it("changes all errors", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { error: ["err0"] }),
    ImpulseFormUnit(1, { error: ["err1"] }),
    ImpulseFormUnit(2, { error: ["err2"] }),
  ])

  form.setError([["e0"], ["e1"], null])
  expect(form.getError(scope)).toStrictEqual([["e0"], ["e1"], null])
})

it("changes some errors", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { error: ["err0"] }),
    ImpulseFormUnit(1, { error: ["err1"] }),
    ImpulseFormUnit(2, { error: ["err2"] }),
  ])

  form.setError([(x) => [...x!, "x"], undefined, (x) => [...x!, "x"]])
  expect(form.getError(scope)).toStrictEqual([
    ["err0", "x"],
    ["err1"],
    ["err2", "x"],
  ])
})
