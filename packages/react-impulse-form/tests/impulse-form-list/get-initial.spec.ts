import type { Scope } from "react-impulse"
import { z } from "zod"

import { ImpulseFormList, ImpulseFormUnit } from "../../src"

it("matches the type definition", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, {
      schema: z.number().transform((x) => x.toFixed(0)),
    }),
  ])

  expect(form.getElements(scope)).toHaveLength(1)

  expectTypeOf(form.getInitial).toEqualTypeOf<(scope: Scope) => ReadonlyArray<number>>()

  expectTypeOf(form.getElements(scope).at(0)!.getInitial).toEqualTypeOf<(scope: Scope) => number>()
})

it("matches the nested type definition", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormList<ImpulseFormUnit<number, ReadonlyArray<string>, string>>([
      ImpulseFormUnit(0, {
        schema: z.number().transform((x) => x.toFixed(0)),
      }),
    ]),
  ])

  expect(form.getElements(scope)).toHaveLength(1)

  expectTypeOf(form.getInitial).toEqualTypeOf<
    (scope: Scope) => ReadonlyArray<ReadonlyArray<number>>
  >()

  expectTypeOf(form.getElements(scope).at(0)!.getInitial).toEqualTypeOf<
    (scope: Scope) => ReadonlyArray<number>
  >()

  expectTypeOf(form.getElements(scope).at(0)!.getElements(scope).at(0)!.getInitial).toEqualTypeOf<
    (scope: Scope) => number
  >()
})

it("returns empty array for empty list", ({ scope }) => {
  const form = ImpulseFormList([])

  expect(form.getInitial(scope)).toStrictEqual([])
})

it("returns an array of original values", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { initial: 3 }),
    ImpulseFormUnit(1),
    ImpulseFormUnit(2, { initial: 4 }),
  ])

  expect(form.getInitial(scope)).toStrictEqual([3, 1, 4])
})

it("returns nested list's values", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormList([ImpulseFormUnit(1)]),
    ImpulseFormList([ImpulseFormUnit(2), ImpulseFormUnit(3)]),
  ])

  expect(form.getInitial(scope)).toStrictEqual([[1], [2, 3]])
})
