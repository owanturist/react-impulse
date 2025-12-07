import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { params } from "~/tools/params"

import { ImpulseFormList, ImpulseFormUnit } from "../../src"

function setup<TError>(elements: ReadonlyArray<ImpulseFormUnit<number, TError, string>>) {
  return ImpulseFormList(elements, {
    validateOn: "onInit",
  })
}

function setupElement(initial: number) {
  return ImpulseFormUnit(initial, {
    schema: z
      .number()
      .min(1)
      .transform((x) => x.toFixed(0)),
  })
}

it("matches the type definition", ({ monitor }) => {
  const form = setup([setupElement(0)])

  expectTypeOf(form.getOutput).toEqualTypeOf<{
    (monitor: Monitor): null | ReadonlyArray<string>

    <TResult>(
      monitor: Monitor,
      select: (
        concise: null | ReadonlyArray<string>,
        verbose: ReadonlyArray<null | string>,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.getElements(monitor).at(0)!.getOutput).toEqualTypeOf<{
    (monitor: Monitor): null | string

    <TResult>(
      monitor: Monitor,
      select: (concise: null | string, verbose: null | string) => TResult,
    ): TResult
  }>()
})

it("returns all items when valid", ({ monitor }) => {
  const form = setup([setupElement(1), setupElement(2), setupElement(3)])

  expect(form.getOutput(monitor)).toStrictEqual(["1", "2", "3"])
  expect(form.getOutput(monitor, params._first)).toStrictEqual(["1", "2", "3"])
  expect(form.getOutput(monitor, params._second)).toStrictEqual(["1", "2", "3"])
})

it("returns empty array for empty list", ({ monitor }) => {
  const form = setup([])

  expect(form.getOutput(monitor)).toStrictEqual([])
  expect(form.getOutput(monitor, params._first)).toStrictEqual([])
  expect(form.getOutput(monitor, params._second)).toStrictEqual([])
})

it("returns null if a single element is not valid", ({ monitor }) => {
  const form = setup([setupElement(0)])

  expect(form.getOutput(monitor)).toBeNull()
  expect(form.getOutput(monitor, params._first)).toBeNull()
  expect(form.getOutput(monitor, params._second)).toStrictEqual([null])
})

it("returns null if at least one element is not valid", ({ monitor }) => {
  const form = setup([setupElement(1), setupElement(0), setupElement(3)])

  expect(form.getOutput(monitor)).toBeNull()
  expect(form.getOutput(monitor, params._first)).toBeNull()
  expect(form.getOutput(monitor, params._second)).toStrictEqual(["1", null, "3"])
})
