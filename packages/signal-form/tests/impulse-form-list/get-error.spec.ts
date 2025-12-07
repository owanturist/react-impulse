import type { Monitor } from "@owanturist/signal"
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

it("matches the type definition", ({ monitor }) => {
  const form = setup([setupElement(0)])

  expectTypeOf(form.getError).toEqualTypeOf<{
    (monitor: Monitor): null | ReadonlyArray<null | ReadonlyArray<string>>

    <TResult>(
      monitor: Monitor,
      select: (
        concise: null | ReadonlyArray<null | ReadonlyArray<string>>,
        verbose: ReadonlyArray<null | ReadonlyArray<string>>,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.getElements(monitor).at(0)!.getError).toEqualTypeOf<{
    (monitor: Monitor): null | ReadonlyArray<string>

    <TResult>(
      monitor: Monitor,
      select: (
        concise: null | ReadonlyArray<string>,
        verbose: null | ReadonlyArray<string>,
      ) => TResult,
    ): TResult
  }>()
})

it("returns null for empty list", ({ monitor }) => {
  const form = setup([])

  expect(form.getError(monitor)).toBeNull()
  expect(form.getError(monitor, params._first)).toBeNull()
  expect(form.getError(monitor, params._second)).toStrictEqual([])
})

it("returns null when none of the elements have errors", ({ monitor }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  expect(form.getError(monitor)).toBeNull()
  expect(form.getError(monitor, params._first)).toBeNull()
  expect(form.getError(monitor, params._second)).toStrictEqual([null, null, null])
})

it("returns concise when at least one element has errors", ({ monitor }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2, { error: ["err"] })])

  const expected = [null, null, ["err"]]

  expect(form.getError(monitor)).toStrictEqual(expected)
  expect(form.getError(monitor, params._first)).toStrictEqual(expected)
  expect(form.getError(monitor, params._second)).toStrictEqual(expected)
})

it("returns concise when all elements have errors", ({ monitor }) => {
  const form = setup([
    setupElement(0, { error: ["err0"] }),
    setupElement(1, { error: ["err1"] }),
    setupElement(2, { error: ["err2"] }),
  ])

  const expected = [["err0"], ["err1"], ["err2"]]

  expect(form.getError(monitor)).toStrictEqual(expected)
  expect(form.getError(monitor, params._first)).toStrictEqual(expected)
  expect(form.getError(monitor, params._second)).toStrictEqual(expected)
})
