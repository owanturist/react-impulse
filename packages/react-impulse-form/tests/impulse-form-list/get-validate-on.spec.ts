import type { Scope } from "react-impulse"
import { z } from "zod"

import {
  ImpulseFormList,
  type ImpulseFormListOptions,
  ImpulseFormUnit,
  type ImpulseFormUnitSchemaOptions,
  type ValidateStrategy,
} from "../../src"
import { arg } from "../common"

function setup<TError>(
  elements: ReadonlyArray<ImpulseFormUnit<number, TError>>,
  options?: ImpulseFormListOptions<ImpulseFormUnit<number, TError>>,
) {
  return ImpulseFormList(elements, options)
}

function setupElement(
  initial: number,
  options?: Partial<ImpulseFormUnitSchemaOptions<number>>,
) {
  return ImpulseFormUnit(initial, {
    schema: z.number(),
    ...options,
  })
}

it("matches the type definition", ({ scope }) => {
  const form = setup([setupElement(0)])

  expectTypeOf(form.getValidateOn).toEqualTypeOf<{
    (scope: Scope): ValidateStrategy | ReadonlyArray<ValidateStrategy>

    <TResult>(
      scope: Scope,
      select: (
        concise: ValidateStrategy | ReadonlyArray<ValidateStrategy>,
        verbose: ReadonlyArray<ValidateStrategy>,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.getElements(scope).at(0)!.getValidateOn).toEqualTypeOf<{
    (scope: Scope): ValidateStrategy

    <TResult>(
      scope: Scope,
      select: (concise: ValidateStrategy, verbose: ValidateStrategy) => TResult,
    ): TResult
  }>()
})

it("returns 'onTouch' for empty list", ({ scope }) => {
  const form = setup([])

  expect(form.getValidateOn(scope)).toBe("onTouch")
  expect(form.getValidateOn(scope, arg(0))).toBe("onTouch")
  expect(form.getValidateOn(scope, arg(1))).toStrictEqual([])
})

it("returns verbose when elements use more than a single strategy", ({
  scope,
}) => {
  const form = setup([
    setupElement(0, { validateOn: "onInit" }),
    setupElement(1),
    setupElement(2, { validateOn: "onSubmit" }),
  ])

  const expected = ["onInit", "onTouch", "onSubmit"]

  expect(form.getValidateOn(scope)).toStrictEqual(expected)
  expect(form.getValidateOn(scope, arg(0))).toStrictEqual(expected)
  expect(form.getValidateOn(scope, arg(1))).toStrictEqual(expected)
})

it("returns concise when all elements use the same strategy", ({ scope }) => {
  const form = setup([
    setupElement(0, { validateOn: "onChange" }),
    setupElement(1, { validateOn: "onChange" }),
    setupElement(2, { validateOn: "onChange" }),
  ])

  expect(form.getValidateOn(scope)).toBe("onChange")
  expect(form.getValidateOn(scope, arg(0))).toBe("onChange")
  expect(form.getValidateOn(scope, arg(1))).toStrictEqual([
    "onChange",
    "onChange",
    "onChange",
  ])
})
