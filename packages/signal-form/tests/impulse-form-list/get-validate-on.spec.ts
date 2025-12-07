import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { params } from "~/tools/params"

import {
  ImpulseFormList,
  type ImpulseFormListOptions,
  ImpulseFormUnit,
  type ImpulseFormUnitSchemaOptions,
  type ValidateStrategy,
} from "../../src"

function setup<TError>(
  elements: ReadonlyArray<ImpulseFormUnit<number, TError>>,
  options?: ImpulseFormListOptions<ImpulseFormUnit<number, TError>>,
) {
  return ImpulseFormList(elements, options)
}

function setupElement(initial: number, options?: Partial<ImpulseFormUnitSchemaOptions<number>>) {
  return ImpulseFormUnit(initial, {
    schema: z.number(),
    ...options,
  })
}

it("matches the type definition", ({ monitor }) => {
  const form = setup([setupElement(0)])

  expectTypeOf(form.getValidateOn).toEqualTypeOf<{
    (monitor: Monitor): ValidateStrategy | ReadonlyArray<ValidateStrategy>

    <TResult>(
      monitor: Monitor,
      select: (
        concise: ValidateStrategy | ReadonlyArray<ValidateStrategy>,
        verbose: ReadonlyArray<ValidateStrategy>,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.getElements(monitor).at(0)!.getValidateOn).toEqualTypeOf<{
    (monitor: Monitor): ValidateStrategy

    <TResult>(
      monitor: Monitor,
      select: (concise: ValidateStrategy, verbose: ValidateStrategy) => TResult,
    ): TResult
  }>()
})

it("returns 'onTouch' for empty list", ({ monitor }) => {
  const form = setup([])

  expect(form.getValidateOn(monitor)).toBe("onTouch")
  expect(form.getValidateOn(monitor, params._first)).toBe("onTouch")
  expect(form.getValidateOn(monitor, params._second)).toStrictEqual([])
})

it("returns verbose when elements use more than a single strategy", ({ monitor }) => {
  const form = setup([
    setupElement(0, { validateOn: "onInit" }),
    setupElement(1),
    setupElement(2, { validateOn: "onSubmit" }),
  ])

  const expected = ["onInit", "onTouch", "onSubmit"]

  expect(form.getValidateOn(monitor)).toStrictEqual(expected)
  expect(form.getValidateOn(monitor, params._first)).toStrictEqual(expected)
  expect(form.getValidateOn(monitor, params._second)).toStrictEqual(expected)
})

it("returns concise when all elements use the same strategy", ({ monitor }) => {
  const form = setup([
    setupElement(0, { validateOn: "onChange" }),
    setupElement(1, { validateOn: "onChange" }),
    setupElement(2, { validateOn: "onChange" }),
  ])

  expect(form.getValidateOn(monitor)).toBe("onChange")
  expect(form.getValidateOn(monitor, params._first)).toBe("onChange")
  expect(form.getValidateOn(monitor, params._second)).toStrictEqual([
    "onChange",
    "onChange",
    "onChange",
  ])
})
