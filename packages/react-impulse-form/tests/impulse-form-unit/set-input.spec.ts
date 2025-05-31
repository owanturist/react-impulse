import type { Setter } from "~/tools/setter"

import { ImpulseFormUnit } from "../../src"

it("sets original value", ({ scope }) => {
  const value = ImpulseFormUnit("")

  expect(value.getInput(scope)).toBe("")

  value.setInput("1")
  expect(value.getInput(scope)).toBe("1")

  value.setInput((x) => `${x}2`)
  expect(value.getInput(scope)).toBe("12")
  expect(value.getInitial(scope)).toBe("")

  expectTypeOf(value.setInput)
    .parameter(0)
    .toEqualTypeOf<Setter<string, [string, string]>>()
})
