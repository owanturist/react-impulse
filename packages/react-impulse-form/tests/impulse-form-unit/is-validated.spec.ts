import type { Scope } from "react-impulse"
import { z } from "zod"

import {
  ImpulseFormUnit,
  type ImpulseFormUnitSchemaOptions,
  type ValidateStrategy,
} from "../../src"

function setup(options?: Partial<ImpulseFormUnitSchemaOptions<string, number>>) {
  return ImpulseFormUnit("y", {
    schema: z.string().min(1).pipe(z.coerce.number()),
    ...options,
  })
}

function isValidatedDefault<TError, TOutput>(
  scope: Scope,
  value: ImpulseFormUnit<string, TError, TOutput>,
) {
  return value.isValidated(scope)
}

function isValidatedConcise<TError, TOutput>(
  scope: Scope,
  value: ImpulseFormUnit<string, TError, TOutput>,
) {
  return value.isValidated(scope, (concise) => concise)
}

function isValidatedVerbose<TError, TOutput>(
  scope: Scope,
  value: ImpulseFormUnit<string, TError, TOutput>,
) {
  return value.isValidated(scope, (_, verbose) => verbose)
}

it("matches the type signature", () => {
  const form = setup()

  expectTypeOf(form.isValidated).toEqualTypeOf<{
    (scope: Scope): boolean

    <TResult>(scope: Scope, select: (concise: boolean, verbose: boolean) => TResult): TResult
  }>()
})

it("returns true on init without transform, validate, or schema", ({ scope }) => {
  const unit = ImpulseFormUnit("y")

  expect(unit.isValidated(scope)).toBe(true)
})

it("returns true on init when transform", ({ scope }) => {
  const unit = ImpulseFormUnit("y", {
    transform: (input) => input,
  })

  expect(unit.isValidated(scope)).toBe(true)
})

it("returns false on init when validate", ({ scope }) => {
  const unit = ImpulseFormUnit("y", {
    validate: (input) => [null, input],
  })

  expect(unit.isValidated(scope)).toBe(false)
})

it("returns false on init when schema", ({ scope }) => {
  const unit = ImpulseFormUnit("y", {
    schema: z.string(),
  })

  expect(unit.isValidated(scope)).toBe(false)
})

describe.each([
  ["(scope)", isValidatedDefault],
  ["(scope, (concise) => concise)", isValidatedConcise],
  ["(scope, (_, verbose) => verbose)", isValidatedVerbose],
])("isValidated%s", (_, isValidated) => {
  it("returns boolean value", ({ scope }) => {
    const value = setup()

    expectTypeOf(isValidated(scope, value)).toBeBoolean()
  })

  describe("when onInit", () => {
    it("marks as validated on init", ({ scope }) => {
      const value = setup({ validateOn: "onInit" })

      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual([expect.any(String)])
    })
  })

  describe("when onTouch", () => {
    it("marks as validated on init when touched=true", ({ scope }) => {
      const value = setup({ validateOn: "onTouch", touched: true })

      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual([expect.any(String)])
    })

    it("does not mark validated on setTouched(false)", ({ scope }) => {
      const value = setup({ validateOn: "onTouch" })

      value.setTouched(false)
      expect(isValidated(scope, value)).toBe(false)
      expect(value.getError(scope)).toBeNull()
    })

    it("marks as validated on setTouched(true)", ({ scope }) => {
      const value = setup({ validateOn: "onTouch" })

      value.setTouched(true)
      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual([expect.any(String)])
    })

    it("keeps validated on setTouched(false)", ({ scope }) => {
      const value = setup({ validateOn: "onTouch", touched: true })

      value.setTouched(false)
      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual([expect.any(String)])
    })

    it("keeps validated on setValidateOn(onTouch)", ({ scope }) => {
      const value = setup({ touched: true, validateOn: "onTouch" })

      value.setTouched(false)
      value.setValidateOn("onTouch")
      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual([expect.any(String)])
    })

    it("does not mark as validated on change", ({ scope }) => {
      const value = setup({ validateOn: "onTouch" })

      value.setInput("x")
      expect(isValidated(scope, value)).toBe(false)
      expect(value.getError(scope)).toBeNull()
    })
  })

  describe("when onChange", () => {
    it("marks as validated on init when dirty", ({ scope }) => {
      const value = setup({ validateOn: "onChange", initial: "x" })

      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual([expect.any(String)])
    })

    it("marks as validated on change", ({ scope }) => {
      const value = setup({ validateOn: "onChange" })

      value.setInput("x")
      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual([expect.any(String)])
    })

    it("marks as validated on initial change", ({ scope }) => {
      const value = setup({ validateOn: "onChange" })

      value.setInitial("x")
      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual([expect.any(String)])
    })

    it("does not mark as validated for the same value", ({ scope }) => {
      const value = setup({ validateOn: "onChange" })

      value.setInput("y")
      expect(isValidated(scope, value)).toBe(false)
      expect(value.getError(scope)).toBeNull()
    })

    it("keeps validated when the value changes to initial", ({ scope }) => {
      const value = setup({ validateOn: "onChange" })

      value.setInput("x")
      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual([expect.any(String)])

      value.setInput(value.getInitial(scope))
      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual([expect.any(String)])
    })

    it("keeps validated on setValidateOn(onChange)", ({ scope }) => {
      const value = setup({ initial: "x", validateOn: "onChange" })

      value.setInput(value.getInitial(scope))
      value.setValidateOn("onChange")
      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual([expect.any(String)])
    })

    it("is not validated on touch", ({ scope }) => {
      const value = setup({ validateOn: "onChange" })

      value.setTouched(true)
      expect(isValidated(scope, value)).toBe(false)
      expect(value.getError(scope)).toBeNull()
    })
  })

  describe("when onSubmit", () => {
    it("does not mark as validated on touch", ({ scope }) => {
      const value = setup({ validateOn: "onSubmit" })

      value.setTouched(true)
      expect(isValidated(scope, value)).toBe(false)
      expect(value.getError(scope)).toBeNull()
    })

    it("does not mark as validated on change", ({ scope }) => {
      const value = setup({ validateOn: "onSubmit" })

      value.setInput("x")
      expect(isValidated(scope, value)).toBe(false)
      expect(value.getError(scope)).toBeNull()
    })
  })

  describe.each([
    "onTouch",
    "onChange",
    "onSubmit",
  ] satisfies Array<ValidateStrategy>)("when %s", (validateOn) => {
    it("does not mark as validated on init", ({ scope }) => {
      const value = setup({ validateOn })

      expect(isValidated(scope, value)).toBe(false)
      expect(value.getError(scope)).toBeNull()
    })

    it("marks as validated on submit", async ({ scope }) => {
      const value = setup({ validateOn })

      await value.submit()
      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual([expect.any(String)])
    })

    it("marks as validated when initialized with custom error", ({ scope }) => {
      const value = setup({ validateOn, error: ["error"] })

      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual(["error"])
    })

    it("marks as validated when custom error set", ({ scope }) => {
      const value = setup({ validateOn })

      value.setError(["error"])
      expect(isValidated(scope, value)).toBe(true)
      expect(value.getError(scope)).toStrictEqual(["error"])
    })

    it("unmarks as validated when custom error is removed", ({ scope }) => {
      const value = setup({ validateOn, error: ["error"] })

      value.setError(null)
      expect(isValidated(scope, value)).toBe(false)
      expect(value.getError(scope)).toBeNull()
    })
  })
})
