import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { ImpulseFormList, ImpulseFormUnit } from "../../src"

it("matches the type definition", ({ monitor }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, {
      schema: z.number().transform((x) => x.toFixed(0)),
    }),
  ])

  expectTypeOf(form.getInput).toEqualTypeOf<(monitor: Monitor) => ReadonlyArray<number>>()

  expectTypeOf(form.getElements(monitor).at(0)!.getInput).toEqualTypeOf<
    (monitor: Monitor) => number
  >()
})

it("returns empty array for empty list", ({ monitor }) => {
  const form = ImpulseFormList([])

  expect(form.getInput(monitor)).toStrictEqual([])
})

it("returns an array of original values", ({ monitor }) => {
  const form = ImpulseFormList([ImpulseFormUnit(0), ImpulseFormUnit(1), ImpulseFormUnit(2)])

  expect(form.getInput(monitor)).toStrictEqual([0, 1, 2])
})
