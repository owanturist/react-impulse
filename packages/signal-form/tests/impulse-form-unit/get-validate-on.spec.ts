import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { params } from "~/tools/params"

import {
  ImpulseFormUnit,
  type ImpulseFormUnitSchemaOptions,
  type ImpulseFormUnitValidatedOptions,
  type ValidateStrategy,
} from "../../src"

function getValidateOnDefault<TError, TOutput>(
  monitor: Monitor,
  value: ImpulseFormUnit<string, TError, TOutput>,
) {
  return value.getValidateOn(monitor)
}

function getValidateOnConcise<TError, TOutput>(
  monitor: Monitor,
  value: ImpulseFormUnit<string, TError, TOutput>,
) {
  return value.getValidateOn(monitor, params._first)
}

function getValidateOnVerbose<TError, TOutput>(
  monitor: Monitor,
  value: ImpulseFormUnit<string, TError, TOutput>,
) {
  return value.getValidateOn(monitor, params._second)
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
      (monitor: Monitor): ValidateStrategy
      <TResult>(
        monitor: Monitor,
        select: (concise: ValidateStrategy, verbose: ValidateStrategy) => TResult,
      ): TResult
    }>()
  })

  describe.each([
    ["(monitor)", getValidateOnDefault],
    ["(monitor, (concise) => concise)", getValidateOnConcise],
    ["(monitor, (_, verbose) => verbose)", getValidateOnVerbose],
  ])("getValidateOn%s", (_, getValidateOn) => {
    it("returns ValidateStrategy value", ({ monitor }) => {
      const value = setup()

      expectTypeOf(getValidateOn(monitor, value)).toEqualTypeOf<ValidateStrategy>()
    })

    it("defaults to onTouch", ({ monitor }) => {
      const value = setup()

      expect(getValidateOn(monitor, value)).toBe("onTouch")
    })

    it("returns initial ValidateStrategy", ({ monitor }) => {
      const value = setup({
        validateOn: "onSubmit",
      })

      expect(getValidateOn(monitor, value)).toBe("onSubmit")
    })
  })
})

describe("when options: ImpulseFormUnitValidatedOptions", () => {
  function setup(options?: Partial<ImpulseFormUnitValidatedOptions<string, number>>) {
    return ImpulseFormUnit("", {
      ...options,
      validate: (input) => (input.length > 0 ? [null, input] : [1, null]),
    })
  }

  it("matches the type signature", () => {
    const form = setup()

    expectTypeOf(form.getValidateOn).toEqualTypeOf<{
      (monitor: Monitor): ValidateStrategy
      <TResult>(
        monitor: Monitor,
        select: (concise: ValidateStrategy, verbose: ValidateStrategy) => TResult,
      ): TResult
    }>()
  })

  describe.each([
    ["(monitor)", getValidateOnDefault],
    ["(monitor, (concise) => concise)", getValidateOnConcise],
    ["(monitor, (_, verbose) => verbose)", getValidateOnVerbose],
  ])("getValidateOn%s", (_, getValidateOn) => {
    it("returns ValidateStrategy value", ({ monitor }) => {
      const value = setup()

      expectTypeOf(getValidateOn(monitor, value)).toEqualTypeOf<ValidateStrategy>()
    })

    it("defaults to onTouch", ({ monitor }) => {
      const value = setup()

      expect(getValidateOn(monitor, value)).toBe("onTouch")
    })

    it("returns initial ValidateStrategy", ({ monitor }) => {
      const value = setup({
        validateOn: "onSubmit",
      })

      expect(getValidateOn(monitor, value)).toBe("onSubmit")
    })
  })
})

describe("when options: ImpulseFormUnitOptions", () => {
  it("matches the type signature", () => {
    const form = ImpulseFormUnit("")

    expectTypeOf(form.getValidateOn).toEqualTypeOf<{
      (monitor: Monitor): ValidateStrategy
      <TResult>(
        monitor: Monitor,
        select: (concise: ValidateStrategy, verbose: ValidateStrategy) => TResult,
      ): TResult
    }>()
  })

  describe.each([
    ["(monitor)", getValidateOnDefault],
    ["(monitor, (concise) => concise)", getValidateOnConcise],
    ["(monitor, (_, verbose) => verbose)", getValidateOnVerbose],
  ])("getValidateOn%s", (_, getValidateOn) => {
    it("returns ValidateStrategy value", ({ monitor }) => {
      const value = ImpulseFormUnit("")

      expectTypeOf(getValidateOn(monitor, value)).toEqualTypeOf<ValidateStrategy>()
    })

    it("defaults to onTouch when schema is defined", ({ monitor }) => {
      const value = ImpulseFormUnit("", {
        schema: z.string(),
      })

      expect(getValidateOn(monitor, value)).toBe("onTouch")
    })

    it("defaults to onTouch when validate is defined", ({ monitor }) => {
      const value = ImpulseFormUnit("", {
        validate: (input) => [null, input],
      })

      expect(getValidateOn(monitor, value)).toBe("onTouch")
    })

    it("defaults to onInit when transform is defined", ({ monitor }) => {
      const value = ImpulseFormUnit("", {
        transform: (input) => input,
      })

      expect(getValidateOn(monitor, value)).toBe("onInit")
    })

    it("defaults to onInit when no transform/validation is defined", ({ monitor }) => {
      const value = ImpulseFormUnit("")

      expect(getValidateOn(monitor, value)).toBe("onInit")
    })
  })
})
