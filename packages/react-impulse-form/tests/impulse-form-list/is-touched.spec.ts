import type { Scope } from "react-impulse"

import {
  ImpulseFormList,
  ImpulseFormUnit,
  type ImpulseFormUnitOptions,
} from "../../src"
import { arg } from "../common"

function setup(elements: ReadonlyArray<ImpulseFormUnit<number>>) {
  return ImpulseFormList(elements)
}

function setupElement(
  initial: number,
  options?: ImpulseFormUnitOptions<number>,
) {
  return ImpulseFormUnit(initial, options)
}

it("matches the type definition", ({ scope }) => {
  const form = setup([setupElement(0)])

  expectTypeOf(form.isTouched).toEqualTypeOf<{
    (scope: Scope): boolean

    <TResult>(
      scope: Scope,
      select: (
        concise: boolean | ReadonlyArray<boolean>,
        verbose: ReadonlyArray<boolean>,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.getElements(scope).at(0)!.isTouched).toEqualTypeOf<{
    (scope: Scope): boolean

    <TResult>(
      scope: Scope,
      select: (concise: boolean, verbose: boolean) => TResult,
    ): TResult
  }>()
})

it("returns false for empty list", ({ scope }) => {
  const form = setup([])

  expect(form.isTouched(scope)).toBe(false)
  expect(form.isTouched(scope, arg(0))).toBe(false)
  expect(form.isTouched(scope, arg(1))).toStrictEqual([])
})

it("returns false when all elements are not touched", ({ scope }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  expect(form.isTouched(scope)).toBe(false)
  expect(form.isTouched(scope, arg(0))).toBe(false)
  expect(form.isTouched(scope, arg(1))).toStrictEqual([false, false, false])
})

it("returns true when at least one element is touched", ({ scope }) => {
  const form = setup([
    setupElement(0),
    setupElement(1),
    setupElement(2, { touched: true }),
  ])

  expect(form.isTouched(scope)).toBe(true)
  expect(form.isTouched(scope, arg(0))).toStrictEqual([false, false, true])
  expect(form.isTouched(scope, arg(1))).toStrictEqual([false, false, true])
})

it("returns true when all elements are touched", ({ scope }) => {
  const form = setup([
    setupElement(0, { touched: true }),
    setupElement(1, { touched: true }),
    setupElement(2, { touched: true }),
  ])

  expect(form.isTouched(scope)).toBe(true)
  expect(form.isTouched(scope, arg(0))).toBe(true)
  expect(form.isTouched(scope, arg(1))).toStrictEqual([true, true, true])
})
