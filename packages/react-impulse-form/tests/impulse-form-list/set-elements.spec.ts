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

it("attach the new elements to the form root", ({ scope }) => {
  const form = setup([setupElement(0), setupElement(1), setupElement(2)])

  form.setElements((current) => [...current, setupElement(3)])
  void form.submit()

  expect(form.getSubmitCount(scope)).toBe(1)
  expect(form.getElements(scope).at(0)!.getSubmitCount(scope)).toBe(1)
  expect(form.getElements(scope).at(3)!.getSubmitCount(scope)).toBe(1)
})
