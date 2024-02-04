import type { Scope } from "react-impulse"

import {
  type ValidateStrategy,
  type ImpulseFormValueOptions,
  ImpulseFormValue,
} from "../../src"

const setup = (options?: ImpulseFormValueOptions<string>) => {
  return ImpulseFormValue.of("", options)
}

const getValidateOnDefault = (scope: Scope, value: ImpulseFormValue<string>) =>
  value.getValidateOn(scope)

const getValidateOnConcise = (scope: Scope, value: ImpulseFormValue<string>) =>
  value.getValidateOn(scope, (concise) => concise)

const getValidateOnVerbose = (scope: Scope, value: ImpulseFormValue<string>) =>
  value.getValidateOn(scope, (_, verbose) => verbose)

describe.each([
  ["getValidateOn(scope)", getValidateOnDefault],
  ["getValidateOn(scope, (concise) => concise)", getValidateOnConcise],
  ["getValidateOn(scope, (_, verbose) => concise)", getValidateOnVerbose],
])("ImpulseFormValue#%s", (_, getValidateOn) => {
  it("returns ValidateStrategy value", ({ scope }) => {
    const value = setup()

    expectTypeOf(getValidateOn(scope, value)).toEqualTypeOf<ValidateStrategy>()
  })

  it("defaults to onTouch", ({ scope }) => {
    const value = setup()

    expect(getValidateOn(scope, value)).toBe("onTouch")
  })

  it("returns initial ValidateStrategy", ({ scope }) => {
    const value = setup({
      validateOn: "onSubmit",
    })

    expect(getValidateOn(scope, value)).toBe("onSubmit")
  })
})
