import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import type { Setter } from "~/tools/setter"

import { FormUnit } from "../../src"

it("selects input", ({ monitor }) => {
  const value = FormUnit("1")

  const input = value.getInput(monitor)
  expect(input).toBe("1")
  expectTypeOf(input).toEqualTypeOf<string>()

  value.setInput("12")
  expect(value.getInput(monitor)).toBe("12")
})

it("sets input", ({ monitor }) => {
  const value = FormUnit("1")

  value.setInput("2")
  expect(value.getInput(monitor)).toBe("2")

  expectTypeOf(value.setInput).parameter(0).toEqualTypeOf<Setter<string, [string, string]>>()
})

it("updates input", ({ monitor }) => {
  const value = FormUnit(1)

  value.setInput((count) => count + 1)
  expect(value.getInput(monitor)).toBe(2)
})

it("selects unequal input values when isInputEqual is not specified", ({ monitor }) => {
  const value = FormUnit([0])

  const input0 = value.getInput(monitor)

  value.setInput([0])
  const input1 = value.getInput(monitor)

  expect(input0).not.toBe(input1)
  expect(input0).toStrictEqual(input1)
})

it("selects equal input values when isInputEqual is specified", ({ monitor }) => {
  const value = FormUnit([0], {
    isInputEqual: isShallowArrayEqual,
  })

  const input0 = value.getInput(monitor)

  value.setInput([0])
  const input1 = value.getInput(monitor)

  expect(input0).toBe(input1)
  expect(input0).toStrictEqual(input1)
})
