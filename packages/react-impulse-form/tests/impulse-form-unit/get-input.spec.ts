import { ImpulseFormUnit } from "packages/react-impulse-form/src"

import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import type { Setter } from "~/tools/setter"

it("selects input", ({ scope }) => {
  const value = ImpulseFormUnit("1")

  const input = value.getInput(scope)
  expect(input).toBe("1")
  expectTypeOf(input).toEqualTypeOf<string>()

  value.setInput("12")
  expect(value.getInput(scope)).toBe("12")
})

it("sets input", ({ scope }) => {
  const value = ImpulseFormUnit("1")

  value.setInput("2")
  expect(value.getInput(scope)).toBe("2")

  expectTypeOf(value.setInput)
    .parameter(0)
    .toEqualTypeOf<Setter<string, [string, string]>>()
})

it("updates input", ({ scope }) => {
  const value = ImpulseFormUnit(1)

  value.setInput((count) => count + 1)
  expect(value.getInput(scope)).toBe(2)
})

it("selects different input value when isInputEqual is not specified", ({
  scope,
}) => {
  const value = ImpulseFormUnit([0])

  const input_0 = value.getInput(scope)

  value.setInput([0])
  const input_1 = value.getInput(scope)

  expect(input_0).not.toBe(input_1)
  expect(input_0).toStrictEqual(input_1)
})

it("selects same input value when isInputEqual is specified", ({ scope }) => {
  const value = ImpulseFormUnit([0], {
    isInputEqual: isShallowArrayEqual,
  })

  const input_0 = value.getInput(scope)

  value.setInput([0])
  const input_1 = value.getInput(scope)

  expect(input_0).toBe(input_1)
  expect(input_0).toStrictEqual(input_1)
})
