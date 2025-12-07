import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { ImpulseFormList, ImpulseFormUnit } from "../../src"

it("matches the type definition", ({ monitor }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, {
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
  const form = ImpulseFormList([
    ImpulseFormList<ImpulseFormUnit<number, ReadonlyArray<string>, string>>([
      ImpulseFormUnit(0, {
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
  const form = ImpulseFormList([])

  expect(form.getInitial(monitor)).toStrictEqual([])
})

it("returns an array of original values", ({ monitor }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { initial: 3 }),
    ImpulseFormUnit(1),
    ImpulseFormUnit(2, { initial: 4 }),
  ])

  expect(form.getInitial(monitor)).toStrictEqual([3, 1, 4])
})

it("returns nested list's values", ({ monitor }) => {
  const form = ImpulseFormList([
    ImpulseFormList([ImpulseFormUnit(1)]),
    ImpulseFormList([ImpulseFormUnit(2), ImpulseFormUnit(3)]),
  ])

  expect(form.getInitial(monitor)).toStrictEqual([[1], [2, 3]])
})
