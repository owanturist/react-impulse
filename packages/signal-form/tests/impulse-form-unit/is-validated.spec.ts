import type { Monitor } from "@owanturist/signal"
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
  monitor: Monitor,
  value: ImpulseFormUnit<string, TError, TOutput>,
) {
  return value.isValidated(monitor)
}

function isValidatedConcise<TError, TOutput>(
  monitor: Monitor,
  value: ImpulseFormUnit<string, TError, TOutput>,
) {
  return value.isValidated(monitor, (concise) => concise)
}

function isValidatedVerbose<TError, TOutput>(
  monitor: Monitor,
  value: ImpulseFormUnit<string, TError, TOutput>,
) {
  return value.isValidated(monitor, (_, verbose) => verbose)
}

it("matches the type signature", () => {
  const form = setup()

  expectTypeOf(form.isValidated).toEqualTypeOf<{
    (monitor: Monitor): boolean

    <TResult>(monitor: Monitor, select: (concise: boolean, verbose: boolean) => TResult): TResult
  }>()
})

it("returns true on init without transform, validate, or schema", ({ monitor }) => {
  const unit = ImpulseFormUnit("y")

  expect(unit.isValidated(monitor)).toBe(true)
})

it("returns true on init when transform", ({ monitor }) => {
  const unit = ImpulseFormUnit("y", {
    transform: (input) => input,
  })

  expect(unit.isValidated(monitor)).toBe(true)
})

it("returns false on init when validate", ({ monitor }) => {
  const unit = ImpulseFormUnit("y", {
    validate: (input) => [null, input],
  })

  expect(unit.isValidated(monitor)).toBe(false)
})

it("returns false on init when schema", ({ monitor }) => {
  const unit = ImpulseFormUnit("y", {
    schema: z.string(),
  })

  expect(unit.isValidated(monitor)).toBe(false)
})

describe.each([
  ["(monitor)", isValidatedDefault],
  ["(monitor, (concise) => concise)", isValidatedConcise],
  ["(monitor, (_, verbose) => verbose)", isValidatedVerbose],
])("isValidated%s", (_, isValidated) => {
  it("returns boolean value", ({ monitor }) => {
    const value = setup()

    expectTypeOf(isValidated(monitor, value)).toBeBoolean()
  })

  describe("when onInit", () => {
    it("marks as validated on init", ({ monitor }) => {
      const value = setup({ validateOn: "onInit" })

      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    })
  })

  describe("when onTouch", () => {
    it("marks as validated on init when touched=true", ({ monitor }) => {
      const value = setup({ validateOn: "onTouch", touched: true })

      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    })

    it("does not mark validated on setTouched(false)", ({ monitor }) => {
      const value = setup({ validateOn: "onTouch" })

      value.setTouched(false)
      expect(isValidated(monitor, value)).toBe(false)
      expect(value.getError(monitor)).toBeNull()
    })

    it("marks as validated on setTouched(true)", ({ monitor }) => {
      const value = setup({ validateOn: "onTouch" })

      value.setTouched(true)
      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    })

    it("keeps validated on setTouched(false)", ({ monitor }) => {
      const value = setup({ validateOn: "onTouch", touched: true })

      value.setTouched(false)
      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    })

    it("keeps validated on setValidateOn(onTouch)", ({ monitor }) => {
      const value = setup({ touched: true, validateOn: "onTouch" })

      value.setTouched(false)
      value.setValidateOn("onTouch")
      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    })

    it("does not mark as validated on change", ({ monitor }) => {
      const value = setup({ validateOn: "onTouch" })

      value.setInput("x")
      expect(isValidated(monitor, value)).toBe(false)
      expect(value.getError(monitor)).toBeNull()
    })
  })

  describe("when onChange", () => {
    it("marks as validated on init when dirty", ({ monitor }) => {
      const value = setup({ validateOn: "onChange", initial: "x" })

      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    })

    it("marks as validated on change", ({ monitor }) => {
      const value = setup({ validateOn: "onChange" })

      value.setInput("x")
      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    })

    it("marks as validated on initial change", ({ monitor }) => {
      const value = setup({ validateOn: "onChange" })

      value.setInitial("x")
      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    })

    it("does not mark as validated for the same value", ({ monitor }) => {
      const value = setup({ validateOn: "onChange" })

      value.setInput("y")
      expect(isValidated(monitor, value)).toBe(false)
      expect(value.getError(monitor)).toBeNull()
    })

    it("keeps validated when the value changes to initial", ({ monitor }) => {
      const value = setup({ validateOn: "onChange" })

      value.setInput("x")
      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual([expect.any(String)])

      value.setInput(value.getInitial(monitor))
      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    })

    it("keeps validated on setValidateOn(onChange)", ({ monitor }) => {
      const value = setup({ initial: "x", validateOn: "onChange" })

      value.setInput(value.getInitial(monitor))
      value.setValidateOn("onChange")
      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    })

    it("is not validated on touch", ({ monitor }) => {
      const value = setup({ validateOn: "onChange" })

      value.setTouched(true)
      expect(isValidated(monitor, value)).toBe(false)
      expect(value.getError(monitor)).toBeNull()
    })
  })

  describe("when onSubmit", () => {
    it("does not mark as validated on touch", ({ monitor }) => {
      const value = setup({ validateOn: "onSubmit" })

      value.setTouched(true)
      expect(isValidated(monitor, value)).toBe(false)
      expect(value.getError(monitor)).toBeNull()
    })

    it("does not mark as validated on change", ({ monitor }) => {
      const value = setup({ validateOn: "onSubmit" })

      value.setInput("x")
      expect(isValidated(monitor, value)).toBe(false)
      expect(value.getError(monitor)).toBeNull()
    })
  })

  describe.each([
    "onTouch",
    "onChange",
    "onSubmit",
  ] satisfies Array<ValidateStrategy>)("when %s", (validateOn) => {
    it("does not mark as validated on init", ({ monitor }) => {
      const value = setup({ validateOn })

      expect(isValidated(monitor, value)).toBe(false)
      expect(value.getError(monitor)).toBeNull()
    })

    it("marks as validated on submit", async ({ monitor }) => {
      const value = setup({ validateOn })

      await value.submit()
      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    })

    it("marks as validated when initialized with custom error", ({ monitor }) => {
      const value = setup({ validateOn, error: ["error"] })

      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual(["error"])
    })

    it("marks as validated when custom error set", ({ monitor }) => {
      const value = setup({ validateOn })

      value.setError(["error"])
      expect(isValidated(monitor, value)).toBe(true)
      expect(value.getError(monitor)).toStrictEqual(["error"])
    })

    it("unmarks as validated when custom error is removed", ({ monitor }) => {
      const value = setup({ validateOn, error: ["error"] })

      value.setError(null)
      expect(isValidated(monitor, value)).toBe(false)
      expect(value.getError(monitor)).toBeNull()
    })
  })
})
