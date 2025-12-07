import type { Monitor } from "@owanturist/signal"

import type { Setter } from "~/tools/setter"

import { ImpulseFormList, ImpulseFormUnit, type ImpulseFormUnitOptions } from "../../src"

function setup(elements: ReadonlyArray<ImpulseFormUnit<number>>) {
  return ImpulseFormList(elements)
}

function setupElement(initial: number, options?: ImpulseFormUnitOptions<number>) {
  return ImpulseFormUnit(initial, options)
}

it("matches the type definition", () => {
  const form = setup([setupElement(0)])

  expectTypeOf(form.setElements).toEqualTypeOf<
    (
      setter: Setter<
        ReadonlyArray<ImpulseFormUnit<number>>,
        [ReadonlyArray<ImpulseFormUnit<number>>, Monitor]
      >,
    ) => void
  >()
})

it("subsequently selects equal elements", ({ monitor }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  const elements = form.getElements(monitor)

  expect(elements).toBe(form.getElements(monitor))

  form.setElements((current) => current)

  expect(elements).toBe(form.getElements(monitor))
})

it("replaces all elements", ({ monitor }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  form.setElements([setupElement(3), setupElement(4), setupElement(5)])
  expect(form.getInput(monitor)).toStrictEqual([3, 4, 5])
})

it("filters some elements", ({ monitor }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  form.setElements((elements, monitor) =>
    elements.filter((element) => element.getInput(monitor) > 1),
  )
  expect(form.getInput(monitor)).toStrictEqual([2])
})

it("modifies existing elements", ({ monitor }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  form.setElements((elements) => [...elements, setupElement(3)])
  expect(form.getInput(monitor)).toStrictEqual([0, 1, 2, 3])
})

it("adding new elements", ({ monitor }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  form.setElements((elements) => [...elements, setupElement(3)])
  expect(form.getInput(monitor)).toStrictEqual([0, 1, 2, 3])
})

it("attach the new elements to the form root", ({ monitor }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  form.setElements((current) => [...current, setupElement(3)])
  form.submit()

  expect(form.getSubmitCount(monitor)).toBe(1)
  expect(form.getElements(monitor)).toHaveLength(4)
  expect(form.getElements(monitor).at(0)!.getSubmitCount(monitor)).toBe(1)
  expect(form.getElements(monitor).at(3)!.getSubmitCount(monitor)).toBe(1)
})

it("persists elements reference", ({ monitor }) => {
  const form = setup([setupElement(0), setupElement(1)])

  const [first0, second0] = form.getElements(monitor)

  form.setElements(([first, second]) => [second!, first!])

  const [first1, second1] = form.getElements(monitor)

  expect(first1).toBe(second0)
  expect(second1).toBe(first0)

  const third0 = setupElement(2)
  form.setElements((elements) => [...elements, third0])

  const [first2, second2, third2] = form.getElements(monitor)
  expect(first2).toBe(second0)
  expect(second2).toBe(first0)
  expect(third2).not.toBe(third0)
})
