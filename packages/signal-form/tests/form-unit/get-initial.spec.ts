import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import type { Setter } from "~/tools/setter"

import { FormUnit } from "../../src"

it("assigns default initial", ({ monitor }) => {
  const value = FormUnit("1")

  expect(value.getInput(monitor)).toBe("1")
  expect(value.getInitial(monitor)).toBe("1")
})

it("selects custom initial", ({ monitor }) => {
  const value = FormUnit("2", { initial: "1" })

  expect(value.getInput(monitor)).toBe("2")
  expect(value.getInitial(monitor)).toBe("1")
})

it("selects unequal custom input and initial values when isInputEqual is not specified", ({
  monitor,
}) => {
  const input = { count: 0 }
  const form = FormUnit(input, {
    initial: { count: 0 },
  })

  expect(form.getInitial(monitor)).not.toBe(input)
  expect(form.getInput(monitor)).not.toBe(form.getInitial(monitor))
  expect(form.getInput(monitor)).toStrictEqual(form.getInitial(monitor))
})

it("selects equal custom input and initial values when isInputEqual is specified", ({
  monitor,
}) => {
  const input = { count: 0 }
  const form = FormUnit(input, {
    initial: { count: 0 },
    isInputEqual: (left, right) => left.count === right.count,
  })

  expect(form.getInitial(monitor)).toBe(input)
  expect(form.getInitial(monitor)).toBe(form.getInitial(monitor))
  expect(form.getInitial(monitor)).toStrictEqual(form.getInitial(monitor))
})

it("sets initial", ({ monitor }) => {
  const value = FormUnit("1")

  value.setInitial("2")
  expect(value.getInput(monitor)).toBe("1")
  expect(value.getInitial(monitor)).toBe("2")

  expectTypeOf(value.setInitial).parameter(0).toEqualTypeOf<Setter<string, [string, string]>>()
})

it("updates initial", ({ monitor }) => {
  const value = FormUnit(1)

  value.setInitial((count) => count + 1)
  expect(value.getInput(monitor)).toBe(1)
  expect(value.getInitial(monitor)).toBe(2)
})

it("selects unequal initial values when isInputEqual is not specified", ({ monitor }) => {
  const value = FormUnit([0])

  const initial0 = value.getInitial(monitor)

  value.setInitial([0])
  const initial1 = value.getInitial(monitor)

  expect(initial0).not.toBe(initial1)
  expect(initial0).toStrictEqual(initial1)
})

it("selects equal initial values when isInputEqual is specified", ({ monitor }) => {
  const value = FormUnit([0], {
    isInputEqual: isShallowArrayEqual,
  })

  const initial0 = value.getInitial(monitor)

  value.setInitial([0])
  const initial1 = value.getInitial(monitor)

  expect(initial0).toBe(initial1)
  expect(initial0).toStrictEqual(initial1)
})
