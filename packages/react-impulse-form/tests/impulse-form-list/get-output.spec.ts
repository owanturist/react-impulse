import type { Scope } from "react-impulse"
import { z } from "zod"

import { ImpulseFormList, ImpulseFormUnit } from "../../src"
import { arg } from "../common"

function setup<TError>(
  elements: ReadonlyArray<ImpulseFormUnit<number, TError, string>>,
) {
  return ImpulseFormList(elements, {
    validateOn: "onInit",
  })
}

function setupElement(initial: number) {
  return ImpulseFormUnit(initial, {
    schema: z
      .number()
      .min(1)
      .transform((x) => x.toFixed()),
  })
}

it("matches the type definition", ({ scope }) => {
  const form = setup([setupElement(0)])

  expectTypeOf(form.getOutput).toEqualTypeOf<{
    (scope: Scope): null | ReadonlyArray<string>

    <TResult>(
      scope: Scope,
      select: (
        concise: null | ReadonlyArray<string>,
        verbose: ReadonlyArray<null | string>,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.getElements(scope).at(0)!.getOutput).toEqualTypeOf<{
    (scope: Scope): null | string

    <TResult>(
      scope: Scope,
      select: (concise: null | string, verbose: null | string) => TResult,
    ): TResult
  }>()
})

it("returns all items when valid", ({ scope }) => {
  const form = setup([setupElement(1), setupElement(2), setupElement(3)])

  expect(form.getOutput(scope)).toStrictEqual(["1", "2", "3"])
  expect(form.getOutput(scope, arg(0))).toStrictEqual(["1", "2", "3"])
  expect(form.getOutput(scope, arg(1))).toStrictEqual(["1", "2", "3"])
})

it("returns empty array for empty list", ({ scope }) => {
  const form = setup([])

  expect(form.getOutput(scope)).toStrictEqual([])
  expect(form.getOutput(scope, arg(0))).toStrictEqual([])
  expect(form.getOutput(scope, arg(1))).toStrictEqual([])
})

it("returns null if a single element is not valid", ({ scope }) => {
  const form = setup([setupElement(0)])

  expect(form.getOutput(scope)).toBeNull()
  expect(form.getOutput(scope, arg(0))).toBeNull()
  expect(form.getOutput(scope, arg(1))).toStrictEqual([null])
})

it("returns null if at least one element is not valid", ({ scope }) => {
  const form = setup([setupElement(1), setupElement(0), setupElement(3)])

  expect(form.getOutput(scope)).toBeNull()
  expect(form.getOutput(scope, arg(0))).toBeNull()
  expect(form.getOutput(scope, arg(1))).toStrictEqual(["1", null, "3"])
})
