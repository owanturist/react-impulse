import type { Scope } from "react-impulse"

import {
  ImpulseFormValue,
  ImpulseFormList,
  type ImpulseFormListOptions,
  type ImpulseForm,
  ImpulseFormShape,
  type ImpulseFormShapeOptions,
} from "../../src"
import { arg } from "../common"

const setup = <T extends ImpulseForm>(
  elements: ReadonlyArray<T>,
  options?: ImpulseFormListOptions<T>,
) => {
  return ImpulseFormList.of(elements, options)
}

interface Element {
  first: ImpulseFormValue<number>
  second: ImpulseFormValue<string>
}

const setupElement = (options?: ImpulseFormShapeOptions<Element>) => {
  return ImpulseFormShape.of(
    {
      first: ImpulseFormValue.of(0),
      second: ImpulseFormValue.of(""),
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
          | ReadonlyArray<boolean | { first: boolean; second: boolean }>,
        verbose: ReadonlyArray<{ first: boolean; second: boolean }>,
      ) => TResult,
    ): TResult
  }>

  expectTypeOf(form.getElements(scope).at(0)!.isDirty).toEqualTypeOf<{
    (scope: Scope): boolean

    <TResult>(
      scope: Scope,
      select: (
        concise: boolean | { first: boolean; second: boolean },
        verbose: { first: boolean; second: boolean },
      ) => TResult,
    ): TResult
  }>
})

it("returns false for empty list", ({ scope }) => {
  const form = setup([])

  expect(form.isDirty(scope)).toBe(false)
  expect(form.isDirty(scope, arg(0))).toBe(false)
  expect(form.isDirty(scope, arg(1))).toStrictEqual([])
})

it("returns false for pristine list", ({ scope }) => {
  const form = setup([setupElement(), setupElement()])

  expect(form.isDirty(scope)).toBe(false)
  expect(form.isDirty(scope, arg(0))).toBe(false)
  expect(form.isDirty(scope, arg(1))).toStrictEqual([
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
      initialValue: {
        first: 1,
      },
    }),
    setupElement(),
  ])

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, arg(0))).toStrictEqual([
    { first: true, second: false },
    false,
  ])
  expect(form.isDirty(scope, arg(1))).toStrictEqual([
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
      initialValue: {
        first: 1,
      },
    }),
    setupElement({
      initialValue: {
        second: "2",
      },
    }),
  ])

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, arg(0))).toStrictEqual([
    { first: true, second: false },
    { first: false, second: true },
  ])
  expect(form.isDirty(scope, arg(1))).toStrictEqual([
    { first: true, second: false },
    { first: false, second: true },
  ])

  expect(
    form.getElements(scope).map((element) => element.isDirty(scope)),
  ).toStrictEqual([true, true])
})

describe("adding a new element to the list's end", () => {
  it.skip("returns true for a new pristine element and a pristine list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [...elements, setupElement()])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toStrictEqual([false, false, true])
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false])
  })

  it.skip("returns true for a new pristine element and a dirty list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 3, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [...elements, setupElement()])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toStrictEqual([false, true, true])
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: false, second: false },
      { first: true, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, true, false])
  })

  it.skip("returns true for a new dirty element and a pristine list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      ...elements,
      setupElement({
        initialValue: { first: 3 },
      }),
    ])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toStrictEqual([false, false, true])
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, true])
  })

  it.skip("returns true for a new dirty element and a dirty list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "4" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      ...elements,
      setupElement({
        initialValue: { first: 3, second: "3" },
      }),
    ])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toStrictEqual([true, false, true])
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: false, second: true },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([true, false, true])
  })
})

describe("adding a new element to the list's beginning", () => {
  it.skip("returns true for a new pristine element and a pristine list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [setupElement(), ...elements])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toBe(true)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false])
  })

  it.skip("returns true for a new pristine element and a dirty list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 3, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [setupElement(), ...elements])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toBe(true)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, true])
  })

  it.skip("returns true for a new dirty element and a pristine list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        originalValue: { first: 3 },
      }),
      ...elements,
    ])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toBe(true)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([true, false, false])
  })

  it.skip("returns true for a new dirty element and a dirty list", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "4" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        originalValue: { first: 3, second: "3" },
      }),
      ...elements,
    ])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toBe(true)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([true, true, false])
  })
})

describe("removing an initial element from the list's end", () => {
  it.skip("returns true for a pristine list", ({ scope }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
      setupElement({
        originalValue: { first: 3, second: "3" },
        initialValue: { first: 3, second: "3" },
      }),
    ])

    form.setElements((elements) => elements.slice(0, 2))

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toStrictEqual([false, false, true])
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false])
  })

  it.skip("returns true a dirty list", ({ scope }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 3, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
      setupElement({
        originalValue: { first: 3, second: "3" },
        initialValue: { first: 3, second: "3" },
      }),
    ])

    form.setElements((elements) => elements.slice(0, 2))

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toStrictEqual([false, true, true])
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: false, second: false },
      { first: true, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, true])
  })
})

describe("removing an initial element from the list's beginning", () => {
  it.skip("returns true for a pristine list", ({ scope }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
      setupElement({
        originalValue: { first: 3, second: "3" },
        initialValue: { first: 3, second: "3" },
      }),
    ])

    form.setElements((elements) => elements.slice(1))

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toStrictEqual([true, false, false])
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: true, second: true },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false])
  })

  it.skip("returns true a dirty list", ({ scope }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
      setupElement({
        originalValue: { first: 4, second: "3" },
        initialValue: { first: 3, second: "3" },
      }),
    ])

    form.setElements((elements) => elements.slice(1))

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toStrictEqual([true, false, true])
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: true, second: true },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, true])
  })
})

describe("swapping elements", () => {
  it.skip("returns true for two pristine unequal elements", ({ scope }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
      setupElement({
        originalValue: { first: 3, second: "3" },
        initialValue: { first: 3, second: "3" },
      }),
    ])

    form.setElements(([first, second, third]) => [third!, second!, first!])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toStrictEqual([true, false, true])
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: true, second: true },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false])
  })

  it("returns false for two pristine equal elements", ({ scope }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
    ])

    form.setElements(([first, second, third]) => [third!, second!, first!])

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false])
  })
})

describe("after ImpulseFormList#reset()", () => {
  it("resets original to initial values", ({ scope }) => {
    const form = setup([
      setupElement({
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        initialValue: { first: 2, second: "2" },
      }),
      setupElement({
        initialValue: { first: 3, second: "3" },
      }),
    ])

    form.reset()

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
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
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
      setupElement({
        originalValue: { first: 3, second: "3" },
        initialValue: { first: 3, second: "3" },
      }),
    ])

    form.setElements((elements) => elements.slice(0, 2))

    form.reset()

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
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
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
      setupElement({
        originalValue: { first: 3, second: "3" },
        initialValue: { first: 3, second: "3" },
      }),
    ])

    form.setElements([])

    form.reset()

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
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
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement(),
      ...elements,
      setupElement(),
    ])

    form.reset()

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
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
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([])
  })
})

describe("after ImpulseFormList#setInitialValue()", () => {
  it("returns false when dirty elements set as initial", ({ scope }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 3, second: "3" },
        initialValue: { first: 2, second: "2" },
      }),
    ])

    form.setInitialValue((_, originalValue) => originalValue)

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
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
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
    ])

    form.setInitialValue([
      { first: 2, second: "2" },
      { first: 3, second: "3" },
    ])

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toBe(true)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
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
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        originalValue: { first: 0, second: "0" },
        initialValue: { first: 0, second: "0" },
      }),
      ...elements,
      setupElement({
        originalValue: { first: 3, second: "3" },
        initialValue: { first: 3, second: "3" },
      }),
    ])
    form.setInitialValue((_, originalValues) => originalValues)

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false, false])
  })

  it.skip("returns false when initial elements are extended by the new elements' initial values", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        originalValue: { first: 0, second: "0" },
        initialValue: { first: 0, second: "0" },
      }),
      ...elements,
      setupElement({
        originalValue: { first: 3, second: "3" },
        initialValue: { first: 3, second: "3" },
      }),
    ])
    form.setInitialValue((initialValues) => [
      { first: 0, second: "0" },
      ...initialValues,
      { first: 3, second: "3" },
    ])

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
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
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
      setupElement({
        originalValue: { first: 2, second: "2" },
        initialValue: { first: 2, second: "2" },
      }),
      setupElement({
        originalValue: { first: 3, second: "3" },
        initialValue: { first: 3, second: "3" },
      }),
    ])

    form.setElements((elements) => elements.slice(0, 2))
    form.setInitialValue((initialValues) => initialValues.slice(0, 2))

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false])
  })
})

describe("after ImpulseFormList#getElements()#at()#setInitialValue()", () => {
  it("return true after updating pristine element's initial value", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        initialValue: { first: 1, second: "1" },
        originalValue: { first: 1, second: "1" },
      }),
      setupElement({
        initialValue: { first: 2, second: "2" },
        originalValue: { first: 2, second: "2" },
      }),
    ])

    form.getElements(scope).at(0)!.setInitialValue({ first: 2 })

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toStrictEqual([
      { first: true, second: false },
      false,
    ])
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
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
        initialValue: { first: 2, second: "1" },
        originalValue: { first: 1, second: "1" },
      }),
      setupElement({
        initialValue: { first: 2, second: "2" },
        originalValue: { first: 2, second: "2" },
      }),
    ])

    form.getElements(scope).at(0)!.setInitialValue({ first: 1 })

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false])
  })

  it.skip("ignores setting initial value for a new dirty element at the end", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        initialValue: { first: 1, second: "1" },
        originalValue: { first: 1, second: "1" },
      }),
      setupElement({
        initialValue: { first: 2, second: "2" },
        originalValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      ...elements,
      setupElement({
        originalValue: { first: 3, second: "3" },
      }),
    ])

    form.getElements(scope).at(2)!.setInitialValue({ first: 3, second: "3" })

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toStrictEqual([false, false, true])
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false])
  })

  it.skip("updates list element initial value for a new dirty element in the beginning", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        initialValue: { first: 1, second: "1" },
        originalValue: { first: 1, second: "1" },
      }),
      setupElement({
        initialValue: { first: 2, second: "2" },
        originalValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        originalValue: { first: 3, second: "3" },
      }),
      ...elements,
    ])

    form.getElements(scope).at(0)!.setInitialValue({ first: 3, second: "3" })

    expect(form.isDirty(scope)).toBe(true)
    expect(form.isDirty(scope, arg(0))).toStrictEqual([false, true, true])
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: false, second: false },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false, false])
  })

  it.skip("keeps the updated initial value after adding one more element to the beginning", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        initialValue: { first: 1, second: "1" },
        originalValue: { first: 1, second: "1" },
      }),
      setupElement({
        initialValue: { first: 2, second: "2" },
        originalValue: { first: 2, second: "2" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        originalValue: { first: 0, second: "0" },
      }),
      ...elements,
    ])

    form.getElements(scope).at(0)!.setInitialValue({ first: 0, second: "0" })

    form.setElements((elements) => [setupElement(), ...elements])
    form.reset()

    expect(form.isDirty(scope)).toBe(false)
    expect(form.isDirty(scope, arg(0))).toBe(false)
    expect(form.isDirty(scope, arg(1))).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
    ])
    expect(form.getOriginalValue(scope)).toStrictEqual([
      { first: 0, second: "0" },
      { first: 2, second: "2" },
    ])

    expect(
      form.getElements(scope).map((element) => element.isDirty(scope)),
    ).toStrictEqual([false, false])
  })
})
