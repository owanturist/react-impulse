import type { Scope } from "react-impulse"
import { z } from "zod"

import {
  ImpulseFormUnit,
  type ImpulseFormUnitOptions,
  type ImpulseFormUnitSchemaOptions,
  type ImpulseFormUnitValidatedOptions,
  type ValidateStrategy,
} from "../../src"
import { arg } from "../common"

function getValidateOnDefault<TError, TOutput>(
  scope: Scope,
  value: ImpulseFormUnit<string, TError, TOutput>,
) {
  return value.getValidateOn(scope)
}

function getValidateOnConcise<TError, TOutput>(
  scope: Scope,
  value: ImpulseFormUnit<string, TError, TOutput>,
) {
  return value.getValidateOn(scope, arg(0))
}

function getValidateOnVerbose<TError, TOutput>(
  scope: Scope,
  value: ImpulseFormUnit<string, TError, TOutput>,
) {
  return value.getValidateOn(scope, arg(1))
}

describe("when options: ImpulseFormUnitSchemaOptions", () => {
  function setup(options?: Partial<ImpulseFormUnitSchemaOptions<string>>) {
    return ImpulseFormUnit("", {
      schema: z.string(),
      ...options,
    })
  }

  it("matches the type signature", () => {
    const form = setup()

    expectTypeOf(form.getValidateOn).toEqualTypeOf<{
      (scope: Scope): ValidateStrategy
      <TResult>(
        scope: Scope,
        select: (
          concise: ValidateStrategy,
          verbose: ValidateStrategy,
        ) => TResult,
      ): TResult
    }>()
  })

  describe.each([
    ["(scope)", getValidateOnDefault],
    ["(scope, (concise) => concise)", getValidateOnConcise],
    ["(scope, (_, verbose) => concise)", getValidateOnVerbose],
  ])("getValidateOn%s", (_, getValidateOn) => {
    it("returns ValidateStrategy value", ({ scope }) => {
      const value = setup()

      expectTypeOf(
        getValidateOn(scope, value),
      ).toEqualTypeOf<ValidateStrategy>()
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
})

describe("when options: ImpulseFormUnitValidatedOptions", () => {
  function setup(
    options?: Partial<ImpulseFormUnitValidatedOptions<string, number>>,
  ) {
    return ImpulseFormUnit("", {
      ...options,
      validate: (input) => (input.length > 0 ? [null, input] : [1, null]),
    })
  }

  it("matches the type signature", () => {
    const form = setup()

    expectTypeOf(form.getValidateOn).toEqualTypeOf<{
      (scope: Scope): ValidateStrategy
      <TResult>(
        scope: Scope,
        select: (
          concise: ValidateStrategy,
          verbose: ValidateStrategy,
        ) => TResult,
      ): TResult
    }>()
  })

  describe.each([
    ["(scope)", getValidateOnDefault],
    ["(scope, (concise) => concise)", getValidateOnConcise],
    ["(scope, (_, verbose) => concise)", getValidateOnVerbose],
  ])("getValidateOn%s", (_, getValidateOn) => {
    it("returns ValidateStrategy value", ({ scope }) => {
      const value = setup()

      expectTypeOf(
        getValidateOn(scope, value),
      ).toEqualTypeOf<ValidateStrategy>()
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
})

describe("when options: ImpulseFormUnitOptions", () => {
  function setup(options?: ImpulseFormUnitOptions<string>) {
    return ImpulseFormUnit("", options)
  }

  it("matches the type signature", () => {
    const form = setup()

    expectTypeOf(form.getValidateOn).toEqualTypeOf<{
      (scope: Scope): ValidateStrategy
      <TResult>(
        scope: Scope,
        select: (
          concise: ValidateStrategy,
          verbose: ValidateStrategy,
        ) => TResult,
      ): TResult
    }>()
  })

  describe.each([
    ["(scope)", getValidateOnDefault],
    ["(scope, (concise) => concise)", getValidateOnConcise],
    ["(scope, (_, verbose) => concise)", getValidateOnVerbose],
  ])("getValidateOn%s", (_, getValidateOn) => {
    it("returns ValidateStrategy value", ({ scope }) => {
      const value = setup()

      expectTypeOf(
        getValidateOn(scope, value),
      ).toEqualTypeOf<ValidateStrategy>()
    })

    it("defaults to onTouch", ({ scope }) => {
      const value = setup()

      expect(getValidateOn(scope, value)).toBe("onTouch")
    })
  })
})
