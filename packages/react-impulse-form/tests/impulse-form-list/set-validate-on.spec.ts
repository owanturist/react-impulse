import type { Setter } from "~/tools/setter"

import {
  ImpulseFormList,
  ImpulseFormUnit,
  type ValidateStrategy,
} from "../../src"

it("matches the type definition", ({ scope }) => {
  const form = ImpulseFormList([ImpulseFormUnit(0)])

  expectTypeOf(form.setValidateOn).toEqualTypeOf<
    (
      setter: Setter<
        ValidateStrategy | ReadonlyArray<undefined | Setter<ValidateStrategy>>,
        [ReadonlyArray<ValidateStrategy>]
      >,
    ) => void
  >()

  expectTypeOf(form.getElements(scope).at(0)!.setValidateOn).toEqualTypeOf<
    (setter: Setter<ValidateStrategy>) => void
  >()
})

it("changes all items", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0),
    ImpulseFormUnit(1),
    ImpulseFormUnit(2),
  ])

  form.setValidateOn("onInit")
  expect(form.getValidateOn(scope)).toBe("onInit")

  form.setValidateOn("onSubmit")
  expect(form.getValidateOn(scope)).toBe("onSubmit")
})
