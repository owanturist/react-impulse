import type { Scope } from "@owanturist/signal"
import { z } from "zod"

import { params } from "~/tools/params"

import { ImpulseFormList, ImpulseFormUnit, type ImpulseFormUnitSchemaOptions } from "../../src"

function setup<TError>(elements: ReadonlyArray<ImpulseFormUnit<number, TError>>) {
  return ImpulseFormList(elements)
}

function setupElement(initial: number, options?: Partial<ImpulseFormUnitSchemaOptions<number>>) {
  return ImpulseFormUnit(initial, {
    schema: z.number(),
    ...options,
  })
}

it("matches the type definition", ({ scope }) => {
  const form = setup([setupElement(0)])

  expectTypeOf(form.isValidated).toEqualTypeOf<{
    (scope: Scope): boolean

    <TResult>(
      scope: Scope,
      select: (
        concise: boolean | ReadonlyArray<boolean>,
        verbose: ReadonlyArray<boolean>,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.getElements(scope).at(0)!.isValidated).toEqualTypeOf<{
    (scope: Scope): boolean

    <TResult>(scope: Scope, select: (concise: boolean, verbose: boolean) => TResult): TResult
  }>()
})

it("returns false for empty list", ({ scope }) => {
  const form = setup([])

  expect(form.isValidated(scope)).toBe(false)
  expect(form.isValidated(scope, params._first)).toBe(false)
  expect(form.isValidated(scope, params._second)).toStrictEqual([])
})

it("returns false when all elements are not validated", ({ scope }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  expect(form.isValidated(scope)).toBe(false)
  expect(form.isValidated(scope, params._first)).toBe(false)
  expect(form.isValidated(scope, params._second)).toStrictEqual([false, false, false])
})

it("returns false when at least one element is not validated", ({ scope }) => {
  const form = setup([
    setupElement(0, { validateOn: "onInit" }),
    setupElement(1, { validateOn: "onInit" }),
    setupElement(2),
  ])

  expect(form.isValidated(scope)).toBe(false)
  expect(form.isValidated(scope, params._first)).toStrictEqual([true, true, false])
  expect(form.isValidated(scope, params._second)).toStrictEqual([true, true, false])
})

it("returns true when all elements are validated", ({ scope }) => {
  const form = setup([
    setupElement(0, { validateOn: "onInit" }),
    setupElement(1, { validateOn: "onInit" }),
    setupElement(2, { validateOn: "onInit" }),
  ])

  expect(form.isValidated(scope)).toBe(true)
  expect(form.isValidated(scope, params._first)).toBe(true)
  expect(form.isValidated(scope, params._second)).toStrictEqual([true, true, true])
})

it("returns false when at least one element has custom errors", ({ scope }) => {
  const form = setup([setupElement(0, { error: ["error"] }), setupElement(1), setupElement(2)])

  expect(form.isValidated(scope)).toBe(false)
  expect(form.isValidated(scope, params._first)).toStrictEqual([true, false, false])
  expect(form.isValidated(scope, params._second)).toStrictEqual([true, false, false])
})
