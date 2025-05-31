import { z } from "zod"

import { params } from "~/tools/params"

import { type ImpulseForm, ImpulseFormUnit } from "../../src"

describe("ImpulseFormUnit#reset()", () => {
  describe.each([
    ["without arguments", (form: ImpulseForm) => form.reset()],
    [
      "with resetter=identity",
      (form: ImpulseForm) => form.reset(params._first),
    ],
  ])("%s", (_, reset) => {
    it("resets to initial value", ({ scope }) => {
      const value = ImpulseFormUnit("", { initial: "1" })

      reset(value)
      expect(value.getInput(scope)).toBe("1")
      expect(value.getInitial(scope)).toBe("1")
      expect(value.isDirty(scope)).toBe(false)
    })
  })

  it("resets to initial value by consuming current original value with resetter", ({
    scope,
  }) => {
    const value = ImpulseFormUnit("2", { initial: "1" })

    value.reset((_, current) => current)
    expect(value.getInput(scope)).toBe("2")
    expect(value.getInitial(scope)).toBe("2")
    expect(value.isDirty(scope)).toBe(false)
  })

  it("resets to new initial value", ({ scope }) => {
    const value = ImpulseFormUnit("2", { initial: "1" })

    value.reset("3")
    expect(value.getInput(scope)).toBe("3")
    expect(value.getInitial(scope)).toBe("3")
    expect(value.isDirty(scope)).toBe(false)
  })

  it("resets custom error", ({ scope }) => {
    const value = ImpulseFormUnit("2", { schema: z.string(), initial: "1" })

    value.setError(["error"])
    expect(value.getError(scope)).toStrictEqual(["error"])

    value.reset()
    expect(value.getError(scope)).toBeNull()
  })

  it("resets isValidated", ({ scope }) => {
    const value = ImpulseFormUnit("2", { initial: "1" })

    value.setTouched(true)
    expect(value.isValidated(scope)).toBe(true)

    value.reset()
    expect(value.isValidated(scope)).toBe(false)
  })
})
