import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { FormList, FormUnit } from "../../src"

it("matches the type definition", ({ monitor }) => {
  const form = FormList([
    FormUnit(0, {
      schema: z.number().transform((x) => x.toFixed(0)),
    }),
  ])

  expect(form.getElements(monitor)).toHaveLength(1)

  expectTypeOf(form.getInitial).toEqualTypeOf<(monitor: Monitor) => ReadonlyArray<number>>()

  expectTypeOf(form.getElements(monitor).at(0)!.getInitial).toEqualTypeOf<
    (monitor: Monitor) => number
  >()
})

it("matches the nested type definition", ({ monitor }) => {
  const form = FormList([
    FormList<FormUnit<number, ReadonlyArray<string>, string>>([
      FormUnit(0, {
        schema: z.number().transform((x) => x.toFixed(0)),
      }),
    ]),
  ])

  expect(form.getElements(monitor)).toHaveLength(1)

  expectTypeOf(form.getInitial).toEqualTypeOf<
    (monitor: Monitor) => ReadonlyArray<ReadonlyArray<number>>
  >()

  expectTypeOf(form.getElements(monitor).at(0)!.getInitial).toEqualTypeOf<
    (monitor: Monitor) => ReadonlyArray<number>
  >()

  expectTypeOf(
    form.getElements(monitor).at(0)!.getElements(monitor).at(0)!.getInitial,
  ).toEqualTypeOf<(monitor: Monitor) => number>()
})

it("returns empty array for empty list", ({ monitor }) => {
  const form = FormList([])

  expect(form.getInitial(monitor)).toStrictEqual([])
})

it("returns an array of original values", ({ monitor }) => {
  const form = FormList([FormUnit(0, { initial: 3 }), FormUnit(1), FormUnit(2, { initial: 4 })])

  expect(form.getInitial(monitor)).toStrictEqual([3, 1, 4])
})

it("returns nested list's values", ({ monitor }) => {
  const form = FormList([FormList([FormUnit(1)]), FormList([FormUnit(2), FormUnit(3)])])

  expect(form.getInitial(monitor)).toStrictEqual([[1], [2, 3]])
})
