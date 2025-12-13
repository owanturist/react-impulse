import type { Setter } from "~/tools/setter"

import { FormList, FormUnit, type ValidateStrategy } from "../../src"

it("matches the type definition", ({ monitor }) => {
  const form = FormList([FormUnit(0)])

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
  const form = FormList([FormUnit(0), FormUnit(1), FormUnit(2)])

  form.setValidateOn("onInit")
  expect(form.getValidateOn(monitor)).toBe("onInit")

  form.setValidateOn("onSubmit")
  expect(form.getValidateOn(monitor)).toBe("onSubmit")
})
