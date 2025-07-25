import type { Scope } from "react-impulse"

import { params } from "~/tools/params"

import {
  type ImpulseForm,
  ImpulseFormList,
  type ImpulseFormListOptions,
  ImpulseFormShape,
  type ImpulseFormShapeOptions,
  ImpulseFormUnit,
} from "../../src"

function setup<T extends ImpulseForm>(
  elements: ReadonlyArray<T>,
  options?: ImpulseFormListOptions<T>,
) {
  return ImpulseFormList(elements, options)
}

interface Element {
  first: ImpulseFormUnit<number>
  second: ImpulseFormUnit<string>
}

function setupElement(options?: ImpulseFormShapeOptions<Element>) {
  return ImpulseFormShape(
    {
      first: ImpulseFormUnit(0),
      second: ImpulseFormUnit(""),
    },
    options,
  )
}

it("matches the type signature", ({ scope }) => {
  const form = setup([setupElement()])

  expectTypeOf(form.isDirty).toEqualTypeOf<{
    (scope: Scope): boolean

    <TResult>(
      scope: Scope,
      select: (
        concise:
          | boolean
          | ReadonlyArray<
              | boolean
              | {
                  readonly first: boolean
                  readonly second: boolean
                }
            >,
        verbose: ReadonlyArray<{
          readonly first: boolean
          readonly second: boolean
        }>,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.getElements(scope).at(0)!.isDirty).toEqualTypeOf<{
    (scope: Scope): boolean

    <TResult>(
      scope: Scope,
      select: (
        concise:
          | boolean
          | {
              readonly first: boolean
              readonly second: boolean
            },
        verbose: {
          readonly first: boolean
          readonly second: boolean
        },
      ) => TResult,
    ): TResult
  }>()
})

it("returns false for empty list", ({ scope }) => {
  const form = setup([])

  expect(form.isDirty(scope)).toBe(false)
  expect(form.isDirty(scope, params._first)).toBe(false)
  expect(form.isDirty(scope, params._second)).toStrictEqual([])
})

it("returns false for pristine list", ({ scope }) => {
  const form = setup([setupElement(), setupElement()])

  expect(form.isDirty(scope)).toBe(false)
  expect(form.isDirty(scope, params._first)).toBe(false)
  expect(form.isDirty(scope, params._second)).toStrictEqual([
    { first: false, second: false },
    { first: false, second: false },
  ])

  expect(
    form.getElements(scope).map((element) => element.isDirty(scope)),
  ).toStrictEqual([false, false])
})

it("returns true when at least one element is dirty", ({ scope }) => {
  const form = setup([
    setupElement({
      initial: {
        first: 1,
      },
    }),
    setupElement(),
  ])

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, params._first)).toStrictEqual([
    { first: true, second: false },
    false,
  ])
  expect(form.isDirty(scope, params._second)).toStrictEqual([
    { first: true, second: false },
    { first: false, second: false },
  ])

  expect(
    form.getElements(scope).map((element) => element.isDirty(scope)),
  ).toStrictEqual([true, false])
})

it("returns true when all elements are dirty", ({ scope }) => {
  const form = setup([
    setupElement({
      initial: {
        first: 1,
      },
    }),
    setupElement({
      initial: {
        second: "2",
      },
    }),
  ])

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, params._first)).toStrictEqual([
    { first: true, second: false },
    { first: false, second: true },
  ])
  expect(form.isDirty(scope, params._second)).toStrictEqual([
    { first: true, second: false },
    { first: false, second: true },
  ])

  expect(
    form.getElements(scope).map((element) => element.isDirty(scope)),
  ).toStrictEqual([true, true])
})

describe.skip("adding a new element to the list's end", () => {
  it("returns true for a new pristine element and a pristine list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [...elements, setupElement()])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toStrictEqual([
      false,
      false,
      true,
    ])
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false])
  })

  it("returns true for a new pristine element and a dirty list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 3, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [...elements, setupElement()])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toStrictEqual([
      false,
      { first: true, second: false },
      true,
    ])
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: true, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, true, false])
  })

  it("returns true for a new dirty element and a pristine list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      ...elements,
      setupElement({
        initial: { first: 3 },
      }),
    ])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toStrictEqual([
      false,
      false,
      true,
    ])
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, true])
  })

  it("returns true for a new dirty element and a dirty list", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "4" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      ...elements,
      setupElement({
        initial: { first: 3, second: "3" },
      }),
    ])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toStrictEqual([
      { first: false, second: true },
      false,
      true,
    ])
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: true },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([true, false, true])
  })
})

describe.skip("adding a new element to the list's beginning", () => {
  it("returns true for a new pristine element and a pristine list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [setupElement(), ...elements])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toBe(true)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([true, true, false])
  })

  it("returns true for a new pristine element and a dirty list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 3, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [setupElement(), ...elements])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toBe(true)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([true, true, true])
  })

  it("returns true for a new dirty element and a pristine list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        input: { first: 3 },
      }),
      ...elements,
    ])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toBe(true)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([true, true, false])
  })

  it("returns true for a new dirty element and a dirty list", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "4" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        input: { first: 3, second: "3" },
      }),
      ...elements,
    ])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toBe(true)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([true, true, false])
  })

  it("returns true for a new same element and a pristine list", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      ...elements,
    ])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toStrictEqual([
      false,
      true,
      true,
    ])
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, true, false])
  })
})

describe.skip("removing an initial element from the list's end", () => {
  it("returns true for a pristine list", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
      setupElement({
        input: { first: 3, second: "3" },
        initial: { first: 3, second: "3" },
      }),
    ])

    form.setElements((elements) => elements.slice(0, 2))

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toStrictEqual([
      false,
      false,
      true,
    ])
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false])
  })

  it("returns true a dirty list", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 3, second: "2" },
        initial: { first: 2, second: "2" },
      }),
      setupElement({
        input: { first: 3, second: "3" },
        initial: { first: 3, second: "3" },
      }),
    ])

    form.setElements((elements) => elements.slice(0, 2))

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toStrictEqual([
      false,
      { first: true, second: false },
      true,
    ])
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: true, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, true])
  })
})

describe.skip("removing an initial element from the list's beginning", () => {
  it("returns true for a pristine list", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
      setupElement({
        input: { first: 3, second: "3" },
        initial: { first: 3, second: "3" },
      }),
    ])

    form.setElements((elements) => elements.slice(1))

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toBe(true)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([true, true])
  })

  it("returns true for a dirty list", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
      setupElement({
        input: { first: 4, second: "3" },
        initial: { first: 3, second: "3" },
      }),
    ])

    form.setElements((elements) => elements.slice(1))

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toBe(true)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([true, true])
  })

  it("returns true for a deleting the same element", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => elements.slice(1))

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toStrictEqual([
      false,
      true,
      true,
    ])
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, true])
  })
})

describe("swapping elements", () => {
  it("returns true for two pristine unequal elements", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
      setupElement({
        input: { first: 3, second: "3" },
        initial: { first: 3, second: "3" },
      }),
    ])

    form.setElements(([first, second, third]) => [third!, second!, first!])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toStrictEqual([
      true,
      false,
      true,
    ])
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([true, false, true])
  })

  it("returns false for two pristine equal elements", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
    ])

    form.setElements(([first, second, third]) => [third!, second!, first!])

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, params._first)).toBe(false)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false])
  })
})

describe.skip("after ImpulseFormList#reset()", () => {
  it("resets original to initial values", ({ scope }) => {
    const form = setup([
      setupElement({
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        initial: { first: 2, second: "2" },
      }),
      setupElement({
        initial: { first: 3, second: "3" },
      }),
    ])

    form.reset()

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, params._first)).toBe(false)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false])
  })

  it("restores a removed element", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
      setupElement({
        input: { first: 3, second: "3" },
        initial: { first: 3, second: "3" },
      }),
    ])

    form.setElements((elements) => elements.slice(0, 2))

    form.reset()

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, params._first)).toBe(false)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false])
  })

  it("restores all removed elements", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
      setupElement({
        input: { first: 3, second: "3" },
        initial: { first: 3, second: "3" },
      }),
    ])

    form.setElements([])

    form.reset()

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, params._first)).toBe(false)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false])
  })

  it("removes new elements", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement(),
      ...elements,
      setupElement(),
    ])

    form.reset()

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, params._first)).toBe(false)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false])
  })

  it("removes all elements for an empty initial list", ({ scope }) => {
    const form = setup<ReturnType<typeof setupElement>>([])

    form.setElements([setupElement(), setupElement()])

    form.reset()

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, params._first)).toBe(false)
    expect(form.isDirty(scope, params._second)).toStrictEqual([])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([])
  })
})

describe.skip("after ImpulseFormList#setInitial()", () => {
  it("returns false when dirty elements set as initial", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 3, second: "3" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setInitial((_, input) => input)

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, params._first)).toBe(false)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false])
  })

  it("returns true when pristine elements change initial", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setInitial([
      { first: 2, second: "2" },
      { first: 3, second: "3" },
    ])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toBe(true)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([true, true])
  })

  it("returns false when initial elements are assigned from the new elements' original values", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        input: { first: 0, second: "0" },
        initial: { first: 0, second: "0" },
      }),
      ...elements,
      setupElement({
        input: { first: 3, second: "3" },
        initial: { first: 3, second: "3" },
      }),
    ])
    form.setInitial((_, input) => input)

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, params._first)).toBe(false)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false, false])
  })

  it("returns false when initial elements are extended by the new elements' initial values", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        input: { first: 0, second: "0" },
        // reassigns initial value from 1 to 0
        initial: { first: 0, second: "0" },
      }),
      // moves 1 (keeps 2 as initial) and 2 (loses initial)
      ...elements,
      // does not affect initial value
      setupElement({
        input: { first: 3, second: "3" },
        initial: { first: 3, second: "3" },
      }),
    ])

    form.setInitial(([_0, _2, ...rest]) => [
      _0,
      { first: 1, second: "1" },
      _2,
      { first: 3, second: "3" },
      ...rest,
    ])

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, params._first)).toBe(false)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false, false])
  })

  it("returns false when removes initial value of deleted element", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
      setupElement({
        input: { first: 2, second: "2" },
        initial: { first: 2, second: "2" },
      }),
      setupElement({
        input: { first: 3, second: "3" },
        initial: { first: 3, second: "3" },
      }),
    ])

    form.setElements((elements) => elements.slice(0, 2))
    form.setInitial((initial) => initial.slice(0, 2))

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, params._first)).toBe(false)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false])
  })
})

describe.skip("after ImpulseFormList#getElements()#at()#setInitial()", () => {
  it("return true after updating pristine element's initial value", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        initial: { first: 1, second: "1" },
        input: { first: 1, second: "1" },
      }),
      setupElement({
        initial: { first: 2, second: "2" },
        input: { first: 2, second: "2" },
      }),
    ])

    form.getElements(scope).at(0)!.setInitial({ first: 2 })

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toStrictEqual([
      { first: true, second: false },
      false,
    ])
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: true, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([true, false])
  })

  it("return false after updating dirty element's initial value", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        initial: { first: 2, second: "1" },
        input: { first: 1, second: "1" },
      }),
      setupElement({
        initial: { first: 2, second: "2" },
        input: { first: 2, second: "2" },
      }),
    ])

    form.getElements(scope).at(0)!.setInitial({ first: 1 })

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, params._first)).toBe(false)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false])
  })

  it("ignores setting initial value for a new dirty element at the end", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        initial: { first: 1, second: "1" },
        input: { first: 1, second: "1" },
      }),
      setupElement({
        initial: { first: 2, second: "2" },
        input: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      ...elements,
      setupElement({
        input: { first: 3, second: "3" },
      }),
    ])

    form.getElements(scope).at(2)!.setInitial({ first: 3, second: "3" })

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toStrictEqual([
      false,
      false,
      true,
    ])
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false])
  })

  it("updates list element initial value for a new dirty element in the beginning", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        initial: { first: 1, second: "1" },
        input: { first: 1, second: "1" },
      }),
      setupElement({
        initial: { first: 2, second: "2" },
        input: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        input: { first: 3, second: "3" },
      }),
      ...elements,
    ])

    form.getElements(scope).at(0)!.setInitial({ first: 3, second: "3" })

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, params._first)).toStrictEqual([
      false,
      true,
      true,
    ])
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, true, false])
  })

  it("keeps the updated initial value after adding one more element to the beginning", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        initial: { first: 1, second: "1" },
        input: { first: 1, second: "1" },
      }),
      setupElement({
        initial: { first: 2, second: "2" },
        input: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        input: { first: 0, second: "0" },
      }),
      ...elements,
    ])

    form.getElements(scope).at(0)!.setInitial({ first: 0, second: "0" })

    form.setElements((elements) => [setupElement(), ...elements])
    form.reset()

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, params._first)).toBe(false)
    expect(form.isDirty(scope, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
    ])
    expect(form.getInput(scope)).toStrictEqual([
      { first: 0, second: "0" },
      { first: 2, second: "2" },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false])
  })
})
