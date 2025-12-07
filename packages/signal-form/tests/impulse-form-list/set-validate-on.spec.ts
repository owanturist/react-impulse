import type { Setter } from "~/tools/setter"

import { ImpulseFormList, ImpulseFormUnit, type ValidateStrategy } from "../../src"

it("matches the type definition", ({ monitor }) => {
  const form = ImpulseFormList([ImpulseFormUnit(0)])

  expectTypeOf(form.setValidateOn).toEqualTypeOf<
    (
      setter: Setter<
        ValidateStrategy | ReadonlyArray<undefined | Setter<ValidateStrategy>>,
        [ReadonlyArray<ValidateStrategy>]
      >,
    ) => void
  >()

  expectTypeOf(form.getElements(monitor).at(0)!.setValidateOn).toEqualTypeOf<
    (setter: Setter<ValidateStrategy>) => void
  >()
})

it("changes all items", ({ monitor }) => {
  const form = ImpulseFormList([ImpulseFormUnit(0), ImpulseFormUnit(1), ImpulseFormUnit(2)])

  form.setValidateOn("onInit")
  expect(form.getValidateOn(monitor)).toBe("onInit")

  form.setValidateOn("onSubmit")
  expect(form.getValidateOn(monitor)).toBe("onSubmit")
})
