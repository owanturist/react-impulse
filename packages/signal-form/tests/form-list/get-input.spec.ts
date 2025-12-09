import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { FormList, FormUnit } from "../../src"

it("matches the type definition", ({ monitor }) => {
  const form = FormList([
    FormUnit(0, {
      schema: z.number().transform((x) => x.toFixed(0)),
    }),
  ])

  expectTypeOf(form.getInput).toEqualTypeOf<(monitor: Monitor) => ReadonlyArray<number>>()

  expectTypeOf(form.getElements(monitor).at(0)!.getInput).toEqualTypeOf<
    (monitor: Monitor) => number
  >()
})

it("returns empty array for empty list", ({ monitor }) => {
  const form = FormList([])

  expect(form.getInput(monitor)).toStrictEqual([])
})

it("returns an array of original values", ({ monitor }) => {
  const form = FormList([FormUnit(0), FormUnit(1), FormUnit(2)])

  expect(form.getInput(monitor)).toStrictEqual([0, 1, 2])
})
