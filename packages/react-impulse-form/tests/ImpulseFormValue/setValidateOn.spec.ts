import {
  type Setter,
  type ImpulseFormValueOptions,
  type ValidateStrategy,
  ImpulseFormValue,
} from "../../src"

const setup = (options?: ImpulseFormValueOptions<string>) => {
  return ImpulseFormValue.of("", options)
}

it("matches the type signature", () => {
  const value = setup()

  expectTypeOf(value.setValidateOn).toEqualTypeOf<
    (setter: Setter<ValidateStrategy>) => void
  >()
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

    it("does not mark as validated for -> onTouch when touched=false", ({
      scope,
    }) => {
      const value = setup({ validateOn, touched: false })

      value.setValidateOn("onTouch")
      expect(value.isValidated(scope)).toBe(false)
    })

    it("marks as validated for -> onTouch when touched=true", ({ scope }) => {
      const value = setup({ validateOn, touched: true })

      value.setValidateOn("onTouch")
      expect(value.isValidated(scope)).toBe(true)
    })

    it("does not mark as validated for -> onChange when not dirty", ({
      scope,
    }) => {
      const value = setup({ validateOn, initialValue: "" })

      value.setValidateOn("onChange")
      expect(value.isValidated(scope)).toBe(false)
    })

    it("marks as validated for -> onChange when dirty", ({ scope }) => {
      const value = setup({ validateOn, initialValue: "x" })

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
