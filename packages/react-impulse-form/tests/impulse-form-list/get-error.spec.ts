import type { Scope } from "react-impulse"
import { z } from "zod"

import {
  ImpulseFormList,
  ImpulseFormUnit,
  type ImpulseFormUnitSchemaOptions,
} from "../../src"
import { arg } from "../common"

function setup<TError>(
  elements: ReadonlyArray<ImpulseFormUnit<number, TError>>,
) {
  return ImpulseFormList(elements)
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

  expectTypeOf(form.getError).toEqualTypeOf<{
    (scope: Scope): null | ReadonlyArray<null | ReadonlyArray<string>>

    <TResult>(
      scope: Scope,
      select: (
        concise: null | ReadonlyArray<null | ReadonlyArray<string>>,
        verbose: ReadonlyArray<null | ReadonlyArray<string>>,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.getElements(scope).at(0)!.getError).toEqualTypeOf<{
    (scope: Scope): null | ReadonlyArray<string>

    <TResult>(
      scope: Scope,
      select: (
        concise: null | ReadonlyArray<string>,
        verbose: null | ReadonlyArray<string>,
      ) => TResult,
    ): TResult
  }>()
})

it("returns null for empty list", ({ scope }) => {
  const form = setup([])

  expect(form.getError(scope)).toBeNull()
  expect(form.getError(scope, arg(0))).toBeNull()
  expect(form.getError(scope, arg(1))).toStrictEqual([])
})

it("returns null when none of the elements have errors", ({ scope }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  expect(form.getError(scope)).toBeNull()
  expect(form.getError(scope, arg(0))).toBeNull()
  expect(form.getError(scope, arg(1))).toStrictEqual([null, null, null])
})

it("returns concise when at least one element has errors", ({ scope }) => {
  const form = setup([
    setupElement(0),
    setupElement(1),
    setupElement(2, { error: ["err"] }),
  ])

  const expected = [null, null, ["err"]]

  expect(form.getError(scope)).toStrictEqual(expected)
  expect(form.getError(scope, arg(0))).toStrictEqual(expected)
  expect(form.getError(scope, arg(1))).toStrictEqual(expected)
})

it("returns concise when all elements have errors", ({ scope }) => {
  const form = setup([
    setupElement(0, { error: ["err0"] }),
    setupElement(1, { error: ["err1"] }),
    setupElement(2, { error: ["err2"] }),
  ])

  const expected = [["err0"], ["err1"], ["err2"]]

  expect(form.getError(scope)).toStrictEqual(expected)
  expect(form.getError(scope, arg(0))).toStrictEqual(expected)
  expect(form.getError(scope, arg(1))).toStrictEqual(expected)
})
