import type { Scope } from "react-impulse"
import { z } from "zod"

import { ImpulseFormList, ImpulseFormUnit } from "../../src"

it("matches the type definition", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, {
      schema: z.number().transform((x) => x.toFixed(0)),
    }),
  ])

  expectTypeOf(form.getInput).toEqualTypeOf<(scope: Scope) => ReadonlyArray<number>>()

  expectTypeOf(form.getElements(scope).at(0)!.getInput).toEqualTypeOf<(scope: Scope) => number>()
})

it("returns empty array for empty list", ({ scope }) => {
  const form = ImpulseFormList([])

  expect(form.getInput(scope)).toStrictEqual([])
})

it("returns an array of original values", ({ scope }) => {
  const form = ImpulseFormList([ImpulseFormUnit(0), ImpulseFormUnit(1), ImpulseFormUnit(2)])

  expect(form.getInput(scope)).toStrictEqual([0, 1, 2])
})
