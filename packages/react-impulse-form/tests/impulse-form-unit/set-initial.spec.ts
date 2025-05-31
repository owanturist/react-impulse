import type { Setter } from "~/tools/setter"

import { ImpulseFormUnit } from "../../src"

it("sets initial value", ({ scope }) => {
  const value = ImpulseFormUnit("")

  expect(value.getInitial(scope)).toBe("")

  value.setInitial("1")
  expect(value.getInitial(scope)).toBe("1")

  value.setInitial((x) => `${x}2`)
  expect(value.getInitial(scope)).toBe("12")
  expect(value.getInput(scope)).toBe("")

  expectTypeOf(value.setInitial)
    .parameter(0)
    .toEqualTypeOf<Setter<string, [string, string]>>()
})
