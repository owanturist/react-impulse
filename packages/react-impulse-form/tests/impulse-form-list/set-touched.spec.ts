import type { Setter } from "~/tools/setter"

import { FormList, FormUnit } from "../../src"

it("matches the type definition", ({ monitor }) => {
  const form = FormList([FormUnit(0)])

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
  const form = FormList([FormUnit(0), FormUnit(1), FormUnit(2)])

  form.setTouched(true)
  expect(form.isTouched(monitor)).toBe(true)

  form.setTouched(false)
  expect(form.isTouched(monitor)).toBe(false)
})
