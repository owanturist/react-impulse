import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import type { Setter } from "~/tools/setter"

import { ImpulseFormUnit } from "../../src"

it("assigns default initial", ({ scope }) => {
  const value = ImpulseFormUnit("1")

  expect(value.getInput(scope)).toBe("1")
  expect(value.getInitial(scope)).toBe("1")
})

it("selects custom initial", ({ scope }) => {
  const value = ImpulseFormUnit("2", { initial: "1" })

  expect(value.getInput(scope)).toBe("2")
  expect(value.getInitial(scope)).toBe("1")
})

it("selects unequal custom input and initial values when isInputEqual is not specified", ({
  scope,
}) => {
  const input = { count: 0 }
  const form = ImpulseFormUnit(input, {
    initial: { count: 0 },
  })

  expect(form.getInitial(scope)).not.toBe(input)
  expect(form.getInput(scope)).not.toBe(form.getInitial(scope))
  expect(form.getInput(scope)).toStrictEqual(form.getInitial(scope))
})

it("selects equal custom input and initial values when isInputEqual is specified", ({
  scope,
}) => {
  const input = { count: 0 }
  const form = ImpulseFormUnit(input, {
    initial: { count: 0 },
    isInputEqual: (left, right) => left.count === right.count,
  })

  expect(form.getInitial(scope)).toBe(input)
  expect(form.getInitial(scope)).toBe(form.getInitial(scope))
  expect(form.getInitial(scope)).toStrictEqual(form.getInitial(scope))
})

it("sets initial", ({ scope }) => {
  const value = ImpulseFormUnit("1")

  value.setInitial("2")
  expect(value.getInput(scope)).toBe("1")
  expect(value.getInitial(scope)).toBe("2")

  expectTypeOf(value.setInitial)
    .parameter(0)
    .toEqualTypeOf<Setter<string, [string, string]>>()
})

it("updates initial", ({ scope }) => {
  const value = ImpulseFormUnit(1)

  value.setInitial((count) => count + 1)
  expect(value.getInput(scope)).toBe(1)
  expect(value.getInitial(scope)).toBe(2)
})

it("selects unequal initial values when isInputEqual is not specified", ({
  scope,
}) => {
  const value = ImpulseFormUnit([0])

  const initial_0 = value.getInitial(scope)

  value.setInitial([0])
  const initial_1 = value.getInitial(scope)

  expect(initial_0).not.toBe(initial_1)
  expect(initial_0).toStrictEqual(initial_1)
})

it("selects equal initial values when isInputEqual is specified", ({
  scope,
}) => {
  const value = ImpulseFormUnit([0], {
    isInputEqual: isShallowArrayEqual,
  })

  const initial_0 = value.getInitial(scope)

  value.setInitial([0])
  const initial_1 = value.getInitial(scope)

  expect(initial_0).toBe(initial_1)
  expect(initial_0).toStrictEqual(initial_1)
})
