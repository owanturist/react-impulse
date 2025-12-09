import type { Setter } from "~/tools/setter"

import { FormList, FormUnit } from "../../src"

it("matches the type definition", ({ monitor }) => {
  const form = FormList([FormUnit(0)])

  expectTypeOf(form.setInput).toEqualTypeOf<
    (
      setter: Setter<
        ReadonlyArray<undefined | Setter<number, [number, number]>>,
        [ReadonlyArray<number>, ReadonlyArray<number>]
      >,
    ) => void
  >()

  expectTypeOf(form.getElements(monitor).at(0)!.setInput).toEqualTypeOf<
    (setter: Setter<number, [number, number]>) => void
  >()
})

it("changes all items", ({ monitor }) => {
  const form = FormList([FormUnit(0), FormUnit(1), FormUnit(2)])

  form.setInput([3, 4, 5])
  expect(form.getInput(monitor)).toStrictEqual([3, 4, 5])
})

it("changes nothing when setting an empty list", ({ monitor }) => {
  const form = FormList([FormUnit(0)])

  form.setInput([])
  expect(form.getInput(monitor)).toStrictEqual([0])
})

it("keeps the list empty", ({ monitor }) => {
  const form = FormList<FormUnit<number>>([])

  form.setInput([0, 1])
  expect(form.getInput(monitor)).toStrictEqual([])
})

it("changes only defined items", ({ monitor }) => {
  const form = FormList([FormUnit(0), FormUnit(1), FormUnit(2)])

  form.setInput([3])
  expect(form.getInput(monitor)).toStrictEqual([3, 1, 2])

  form.setInput([undefined, undefined, 4])
  expect(form.getInput(monitor)).toStrictEqual([3, 1, 4])
})

it("does not extend existing list", ({ monitor }) => {
  const form = FormList([FormUnit(0), FormUnit(1), FormUnit(2)])

  form.setInput([3, 4, 5, 6])
  expect(form.getInput(monitor)).toStrictEqual([3, 4, 5])
})

it("passes the list in the transform function", ({ monitor }) => {
  const form = FormList([FormUnit(0), FormUnit(1), FormUnit(2)])

  form.setInput((elements) => elements.map((x) => x + 1))
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
})

it("passes an element in the transform function", ({ monitor }) => {
  const form = FormList([FormUnit(0), FormUnit(1), FormUnit(2)])

  form.setInput([undefined, (x) => x + 3])
  expect(form.getInput(monitor)).toStrictEqual([0, 4, 2])
})

it("passes an element in the list transform function", ({ monitor }) => {
  const form = FormList([FormUnit(0), FormUnit(1), FormUnit(2)])

  form.setInput((elements) => elements.map(() => (x) => x + 1))
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
})
