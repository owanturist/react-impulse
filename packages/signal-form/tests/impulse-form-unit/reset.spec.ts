import { z } from "zod"

import { params } from "~/tools/params"

import { type ImpulseForm, ImpulseFormUnit } from "../../src"

it("resets to initial value", ({ scope }) => {
  const unit = ImpulseFormUnit("")

  unit.setInput("1")
  expect(unit.getInput(scope)).toBe("1")

  unit.reset()
  expect(unit.getInput(scope)).toBe("")
})

describe.each([
  ["without arguments", (form: ImpulseForm) => form.reset()],
  ["with resetter=identity", (form: ImpulseForm) => form.reset(params._first)],
])("%s", (_, reset) => {
  it("resets to custom initial value", ({ scope }) => {
    const unit = ImpulseFormUnit("", { initial: "1" })

    reset(unit)
    expect(unit.getInput(scope)).toBe("1")
    expect(unit.getInitial(scope)).toBe("1")
    expect(unit.isDirty(scope)).toBe(false)
  })
})

it("resets to initial value by consuming current original value with resetter", ({ scope }) => {
  const unit = ImpulseFormUnit("2", { initial: "1" })

  unit.reset((_, current) => current)
  expect(unit.getInput(scope)).toBe("2")
  expect(unit.getInitial(scope)).toBe("2")
  expect(unit.isDirty(scope)).toBe(false)
})

it("resets to new initial value", ({ scope }) => {
  const unit = ImpulseFormUnit("2", { initial: "1" })

  unit.setInitial("3")
  expect(unit.getInput(scope)).toBe("2")

  unit.reset()
  expect(unit.getInput(scope)).toBe("3")
  expect(unit.getInitial(scope)).toBe("3")
  expect(unit.isDirty(scope)).toBe(false)
})

it("resets to provided initial value", ({ scope }) => {
  const unit = ImpulseFormUnit("2", { initial: "1" })

  unit.reset("3")
  expect(unit.getInput(scope)).toBe("3")
  expect(unit.getInitial(scope)).toBe("3")
  expect(unit.isDirty(scope)).toBe(false)
})

it("resets custom error", ({ scope }) => {
  const unit = ImpulseFormUnit("2", {
    schema: z.string(),
  })

  unit.setError(["error"])
  expect(unit.getError(scope)).toStrictEqual(["error"])

  unit.reset()
  expect(unit.getError(scope)).toBeNull()
})

it("keeps isValidated=true when no validation is defined", ({ scope }) => {
  const unit = ImpulseFormUnit("", {
    initial: "1",
  })

  expect(unit.isValidated(scope)).toBe(true)

  unit.reset()

  expect(unit.isValidated(scope)).toBe(true)
})

it("resets isValidated when validateOn=onTouch", ({ scope }) => {
  const unit = ImpulseFormUnit("", {
    validateOn: "onTouch",
    schema: z.string().min(1),
  })

  expect(unit.isValidated(scope)).toBe(false)

  unit.setTouched(true)
  expect(unit.isValidated(scope)).toBe(true)

  unit.reset()
  expect(unit.isValidated(scope)).toBe(false)
})

it("resets isValidated when validateOn=onChange", ({ scope }) => {
  const unit = ImpulseFormUnit("", {
    validateOn: "onChange",
    schema: z.string().min(1),
  })

  expect(unit.isValidated(scope)).toBe(false)

  unit.setInput("1")
  expect(unit.isValidated(scope)).toBe(true)

  unit.reset()
  expect(unit.isValidated(scope)).toBe(false)
})

it('resets isValidated when validateOn="onSubmit"', async ({ scope }) => {
  const unit = ImpulseFormUnit("", {
    validateOn: "onSubmit",
    schema: z.string().min(1),
  })

  expect(unit.isValidated(scope)).toBe(false)

  await unit.submit()
  expect(unit.isValidated(scope)).toBe(true)

  unit.reset()
  expect(unit.isValidated(scope)).toBe(false)
})

/**
 * bugfix: ImpulseForm#reset() should respect validateOn settings #797
 * @link https://github.com/owanturist/react-impulse/issues/797
 */
it("keeps isValidated when validateOn=onInit", ({ scope }) => {
  const unit = ImpulseFormUnit(1, {
    initial: 0,
    validateOn: "onInit",
    schema: z.number().min(1),
    error: ["custom error"],
  })

  expect(unit.isValidated(scope)).toBe(true)
  expect(unit.getValidateOn(scope)).toBe("onInit")
  expect(unit.getOutput(scope)).toBeNull()
  expect(unit.getError(scope)).toStrictEqual(["custom error"])

  unit.reset()

  expect(unit.isValidated(scope)).toBe(true)
  expect(unit.getValidateOn(scope)).toBe("onInit")
  expect(unit.getOutput(scope)).toBeNull()
  expect(unit.getError(scope)).toStrictEqual([expect.stringContaining("Too small")])
})
