import { z } from "zod"

import { params } from "~/tools/params"

import { FormUnit, type SignalForm } from "../../src"

it("resets to initial value", ({ monitor }) => {
  const unit = FormUnit("")

  unit.setInput("1")
  expect(unit.getInput(monitor)).toBe("1")

  unit.reset()
  expect(unit.getInput(monitor)).toBe("")
})

describe.each([
  ["without arguments", (form: SignalForm) => form.reset()],
  ["with resetter=identity", (form: SignalForm) => form.reset(params._first)],
])("%s", (_, reset) => {
  it("resets to custom initial value", ({ monitor }) => {
    const unit = FormUnit("", { initial: "1" })

    reset(unit)
    expect(unit.getInput(monitor)).toBe("1")
    expect(unit.getInitial(monitor)).toBe("1")
    expect(unit.isDirty(monitor)).toBe(false)
  })
})

it("resets to initial value by consuming current original value with resetter", ({ monitor }) => {
  const unit = FormUnit("2", { initial: "1" })

  unit.reset((_, current) => current)
  expect(unit.getInput(monitor)).toBe("2")
  expect(unit.getInitial(monitor)).toBe("2")
  expect(unit.isDirty(monitor)).toBe(false)
})

it("resets to new initial value", ({ monitor }) => {
  const unit = FormUnit("2", { initial: "1" })

  unit.setInitial("3")
  expect(unit.getInput(monitor)).toBe("2")

  unit.reset()
  expect(unit.getInput(monitor)).toBe("3")
  expect(unit.getInitial(monitor)).toBe("3")
  expect(unit.isDirty(monitor)).toBe(false)
})

it("resets to provided initial value", ({ monitor }) => {
  const unit = FormUnit("2", { initial: "1" })

  unit.reset("3")
  expect(unit.getInput(monitor)).toBe("3")
  expect(unit.getInitial(monitor)).toBe("3")
  expect(unit.isDirty(monitor)).toBe(false)
})

it("resets custom error", ({ monitor }) => {
  const unit = FormUnit("2", {
    schema: z.string(),
  })

  unit.setError(["error"])
  expect(unit.getError(monitor)).toStrictEqual(["error"])

  unit.reset()
  expect(unit.getError(monitor)).toBeNull()
})

it("keeps isValidated=true when no validation is defined", ({ monitor }) => {
  const unit = FormUnit("", {
    initial: "1",
  })

  expect(unit.isValidated(monitor)).toBe(true)

  unit.reset()

  expect(unit.isValidated(monitor)).toBe(true)
})

it("resets isValidated when validateOn=onTouch", ({ monitor }) => {
  const unit = FormUnit("", {
    validateOn: "onTouch",
    schema: z.string().min(1),
  })

  expect(unit.isValidated(monitor)).toBe(false)

  unit.setTouched(true)
  expect(unit.isValidated(monitor)).toBe(true)

  unit.reset()
  expect(unit.isValidated(monitor)).toBe(false)
})

it("resets isValidated when validateOn=onChange", ({ monitor }) => {
  const unit = FormUnit("", {
    validateOn: "onChange",
    schema: z.string().min(1),
  })

  expect(unit.isValidated(monitor)).toBe(false)

  unit.setInput("1")
  expect(unit.isValidated(monitor)).toBe(true)

  unit.reset()
  expect(unit.isValidated(monitor)).toBe(false)
})

it('resets isValidated when validateOn="onSubmit"', async ({ monitor }) => {
  const unit = FormUnit("", {
    validateOn: "onSubmit",
    schema: z.string().min(1),
  })

  expect(unit.isValidated(monitor)).toBe(false)

  await unit.submit()
  expect(unit.isValidated(monitor)).toBe(true)

  unit.reset()
  expect(unit.isValidated(monitor)).toBe(false)
})

/**
 * bugfix: SignalForm#reset() should respect validateOn settings #797
 * @link https://github.com/owanturist/react-impulse/issues/797
 */
it("keeps isValidated when validateOn=onInit", ({ monitor }) => {
  const unit = FormUnit(1, {
    initial: 0,
    validateOn: "onInit",
    schema: z.number().min(1),
    error: ["custom error"],
  })

  expect(unit.isValidated(monitor)).toBe(true)
  expect(unit.getValidateOn(monitor)).toBe("onInit")
  expect(unit.getOutput(monitor)).toBeNull()
  expect(unit.getError(monitor)).toStrictEqual(["custom error"])

  unit.reset()

  expect(unit.isValidated(monitor)).toBe(true)
  expect(unit.getValidateOn(monitor)).toBe("onInit")
  expect(unit.getOutput(monitor)).toBeNull()
  expect(unit.getError(monitor)).toStrictEqual([expect.stringContaining("Too small")])
})
