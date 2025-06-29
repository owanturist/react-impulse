import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import { ImpulseFormUnit } from "../../src"

it("selects touched", ({ scope }) => {
  const value = ImpulseFormUnit("")

  expect(value.isTouched(scope)).toBe(false)
  expect(value.isTouched(scope, (x) => !x)).toBe(true)

  value.setTouched(true)
  expect(value.isTouched(scope)).toBe(true)

  value.setTouched((x) => !x)
  expect(value.isTouched(scope)).toBe(false)

  expectTypeOf(value.isTouched(scope)).toEqualTypeOf<boolean>()
  expectTypeOf(value.isTouched(scope, params._first)).toEqualTypeOf<boolean>()
  expectTypeOf(value.setTouched).parameter(0).toEqualTypeOf<Setter<boolean>>()
})
