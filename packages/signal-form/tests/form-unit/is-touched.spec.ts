import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import { FormUnit } from "../../src"

it("selects touched", ({ monitor }) => {
  const value = FormUnit("")

  expect(value.isTouched(monitor)).toBe(false)
  expect(value.isTouched(monitor, (x) => !x)).toBe(true)

  value.setTouched(true)
  expect(value.isTouched(monitor)).toBe(true)

  value.setTouched((x) => !x)
  expect(value.isTouched(monitor)).toBe(false)

  expectTypeOf(value.isTouched(monitor)).toEqualTypeOf<boolean>()
  expectTypeOf(value.isTouched(monitor, params._first)).toEqualTypeOf<boolean>()
  expectTypeOf(value.setTouched).parameter(0).toEqualTypeOf<Setter<boolean>>()
})
