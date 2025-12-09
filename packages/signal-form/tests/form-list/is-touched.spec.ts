import type { Monitor } from "@owanturist/signal"

import { params } from "~/tools/params"

import { FormList, FormUnit, type FormUnitOptions } from "../../src"

function setup(elements: ReadonlyArray<FormUnit<number>>) {
  return FormList(elements)
}

function setupElement(initial: number, options?: FormUnitOptions<number>) {
  return FormUnit(initial, options)
}

it("matches the type definition", ({ monitor }) => {
  const form = setup([setupElement(0)])

  expectTypeOf(form.isTouched).toEqualTypeOf<{
    (monitor: Monitor): boolean

    <TResult>(
      monitor: Monitor,
      select: (
        concise: boolean | ReadonlyArray<boolean>,
        verbose: ReadonlyArray<boolean>,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.getElements(monitor).at(0)!.isTouched).toEqualTypeOf<{
    (monitor: Monitor): boolean

    <TResult>(monitor: Monitor, select: (concise: boolean, verbose: boolean) => TResult): TResult
  }>()
})

it("returns false for empty list", ({ monitor }) => {
  const form = setup([])

  expect(form.isTouched(monitor)).toBe(false)
  expect(form.isTouched(monitor, params._first)).toBe(false)
  expect(form.isTouched(monitor, params._second)).toStrictEqual([])
})

it("returns false when all elements are not touched", ({ monitor }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  expect(form.isTouched(monitor)).toBe(false)
  expect(form.isTouched(monitor, params._first)).toBe(false)
  expect(form.isTouched(monitor, params._second)).toStrictEqual([false, false, false])
})

it("returns true when at least one element is touched", ({ monitor }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2, { touched: true })])

  expect(form.isTouched(monitor)).toBe(true)
  expect(form.isTouched(monitor, params._first)).toStrictEqual([false, false, true])
  expect(form.isTouched(monitor, params._second)).toStrictEqual([false, false, true])
})

it("returns true when all elements are touched", ({ monitor }) => {
  const form = setup([
    setupElement(0, { touched: true }),
    setupElement(1, { touched: true }),
    setupElement(2, { touched: true }),
  ])

  expect(form.isTouched(monitor)).toBe(true)
  expect(form.isTouched(monitor, params._first)).toBe(true)
  expect(form.isTouched(monitor, params._second)).toStrictEqual([true, true, true])
})
