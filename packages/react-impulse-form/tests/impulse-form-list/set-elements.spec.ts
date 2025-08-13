import type { Scope } from "react-impulse"

import type { Setter } from "~/tools/setter"

import {
  ImpulseFormList,
  ImpulseFormUnit,
  type ImpulseFormUnitOptions,
} from "../../src"

function setup(elements: ReadonlyArray<ImpulseFormUnit<number>>) {
  return ImpulseFormList(elements)
}

function setupElement(
  initial: number,
  options?: ImpulseFormUnitOptions<number>,
) {
  return ImpulseFormUnit(initial, options)
}

it("matches the type definition", () => {
  const form = setup([setupElement(0)])

  expectTypeOf(form.setElements).toEqualTypeOf<
    (
      setter: Setter<
        ReadonlyArray<ImpulseFormUnit<number>>,
        [ReadonlyArray<ImpulseFormUnit<number>>, Scope]
      >,
    ) => void
  >()
})

it("subsequently selects equal elements", ({ scope }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  const elements = form.getElements(scope)

  expect(elements).toBe(form.getElements(scope))

  form.setElements((current) => current)

  expect(elements).toBe(form.getElements(scope))
})

it("replaces all elements", ({ scope }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  form.setElements([setupElement(3), setupElement(4), setupElement(5)])
  expect(form.getInput(scope)).toStrictEqual([3, 4, 5])
})

it("filters some elements", ({ scope }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  form.setElements((elements, scope) => {
    return elements.filter((element) => element.getInput(scope) > 1)
  })
  expect(form.getInput(scope)).toStrictEqual([2])
})

it("modifies existing elements", ({ scope }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  form.setElements((elements) => [...elements, setupElement(3)])
  expect(form.getInput(scope)).toStrictEqual([0, 1, 2, 3])
})

it("adding new elements", ({ scope }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  form.setElements((elements) => [...elements, setupElement(3)])
  expect(form.getInput(scope)).toStrictEqual([0, 1, 2, 3])
})

it("attach the new elements to the form root", ({ scope }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  form.setElements((current) => [...current, setupElement(3)])
  void form.submit()

  expect(form.getSubmitCount(scope)).toBe(1)
  expect(form.getElements(scope)).toHaveLength(4)
  expect(form.getElements(scope).at(0)!.getSubmitCount(scope)).toBe(1)
  expect(form.getElements(scope).at(3)!.getSubmitCount(scope)).toBe(1)
})

it("persists elements reference", ({ scope }) => {
  const form = setup([setupElement(0), setupElement(1)])

  const [first_0, second_0] = form.getElements(scope)

  form.setElements(([first, second]) => [second!, first!])

  const [first_1, second_1] = form.getElements(scope)

  expect(first_1).toBe(second_0)
  expect(second_1).toBe(first_0)

  const third_0 = setupElement(2)
  form.setElements((elements) => [...elements, third_0])

  const [first_2, second_2, third_2] = form.getElements(scope)
  expect(first_2).toBe(second_0)
  expect(second_2).toBe(first_0)
  expect(third_2).not.toBe(third_0)
})
