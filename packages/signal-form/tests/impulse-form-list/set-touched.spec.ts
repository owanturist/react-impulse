import type { Setter } from "~/tools/setter"

import { ImpulseFormList, ImpulseFormUnit } from "../../src"

it("matches the type definition", ({ monitor }) => {
  const form = ImpulseFormList([ImpulseFormUnit(0)])

  expectTypeOf(form.setTouched).toEqualTypeOf<
    (
      setter: Setter<
        boolean | ReadonlyArray<undefined | Setter<boolean>>,
        [ReadonlyArray<boolean>]
      >,
    ) => void
  >()

  expectTypeOf(form.getElements(monitor).at(0)!.setTouched).toEqualTypeOf<
    (setter: Setter<boolean>) => void
  >()
})

it("touches all items", ({ monitor }) => {
  const form = ImpulseFormList([ImpulseFormUnit(0), ImpulseFormUnit(1), ImpulseFormUnit(2)])

  form.setTouched(true)
  expect(form.isTouched(monitor)).toBe(true)

  form.setTouched(false)
  expect(form.isTouched(monitor)).toBe(false)
})
