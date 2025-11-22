import { z } from "zod"

import type { Setter } from "~/tools/setter"

import {
  ImpulseFormUnit,
  type ImpulseFormUnitSchemaOptions,
  type ValidateStrategy,
} from "../../src"

function setup(options?: Partial<ImpulseFormUnitSchemaOptions<string>>) {
  return ImpulseFormUnit("", {
    ...options,
    schema: z.string(),
  })
}

it("matches the type signature", () => {
  const value = setup()

  expectTypeOf(value.setValidateOn).toEqualTypeOf<(setter: Setter<ValidateStrategy>) => void>()
})

describe("setValidateOn(..)", () => {
  it("sets the ValidateStrategy", ({ scope }) => {
    const value = setup({ validateOn: "onInit" })

    value.setValidateOn("onSubmit")
    expect(value.getValidateOn(scope)).toBe("onSubmit")
  })

  it("receives the current validateOn value", ({ scope }) => {
    const value = setup({
      validateOn: "onInit",
    })

    value.setValidateOn((root) => {
      expect(root).toBe("onInit")

      return "onChange"
    })

    expect(value.getValidateOn(scope)).toBe("onChange")
  })

  describe.each([
    "onInit",
    "onChange",
    "onTouch",
    "onSubmit",
  ] satisfies Array<ValidateStrategy>)("when %s", (validateOn) => {
    it("marks as validated for -> onInit", ({ scope }) => {
      const value = setup({ validateOn })

      value.setValidateOn("onInit")
      expect(value.isValidated(scope)).toBe(true)
    })

    it("does not mark as validated for -> onTouch when touched=false", ({ scope }) => {
      const value = setup({ validateOn, touched: false })

      value.setValidateOn("onTouch")
      expect(value.isValidated(scope)).toBe(false)
    })

    it("marks as validated for -> onTouch when touched=true", ({ scope }) => {
      const value = setup({ validateOn, touched: true })

      value.setValidateOn("onTouch")
      expect(value.isValidated(scope)).toBe(true)
    })

    it("does not mark as validated for -> onChange when not dirty", ({ scope }) => {
      const value = setup({ validateOn, initial: "" })

      value.setValidateOn("onChange")
      expect(value.isValidated(scope)).toBe(false)
    })

    it("marks as validated for -> onChange when dirty", ({ scope }) => {
      const value = setup({ validateOn, initial: "x" })

      value.setValidateOn("onChange")
      expect(value.isValidated(scope)).toBe(true)
    })

    it("does not mark as validated for -> onSubmit", ({ scope }) => {
      const value = setup({ validateOn })

      value.setValidateOn("onSubmit")
      expect(value.isValidated(scope)).toBe(false)
    })
  })
})
