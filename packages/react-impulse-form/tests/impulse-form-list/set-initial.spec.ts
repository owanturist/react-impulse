import type { Setter } from "~/tools/setter"

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

it("matches the type definition", ({ scope }) => {
  const form = ImpulseFormList([ImpulseFormUnit(0)])

  expectTypeOf(form.setInitial).toEqualTypeOf<
    (
      setter: Setter<
        ReadonlyArray<undefined | Setter<number, [number, number]>>,
        [ReadonlyArray<number>, ReadonlyArray<number>]
      >,
    ) => void
  >()

  expectTypeOf(form.getElements(scope).at(0)!.setInitial).toEqualTypeOf<
    (setter: Setter<number, [number, number]>) => void
  >()
})

it("changes all items", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0),
    ImpulseFormUnit(1),
    ImpulseFormUnit(2),
  ])

  form.setInitial([3, 4, 5])
  expect(form.getInitial(scope)).toStrictEqual([3, 4, 5])
  expect(
    form.getElements(scope).map((element) => element.getInitial(scope)),
  ).toStrictEqual([3, 4, 5])
})

it("adds an added element's initial", ({ scope }) => {
  const form = ImpulseFormList([ImpulseFormUnit(0), ImpulseFormUnit(1)])

  form.setElements((elements) => [...elements, ImpulseFormUnit(2)])

  expect(form.getInitial(scope)).toStrictEqual([0, 1])
  expect(
    form.getElements(scope).map((element) => element.getInitial(scope)),
  ).toStrictEqual([0, 1, 2])

  form.setInitial([3, 4, 5])
  expect(form.getInitial(scope)).toStrictEqual([3, 4, 5])
  expect(
    form.getElements(scope).map((element) => element.getInitial(scope)),
  ).toStrictEqual([3, 4, 5])
})

it("keeps a removed element's initial", ({ scope }) => {
  const form = ImpulseFormList([ImpulseFormUnit(0), ImpulseFormUnit(1)])

  form.setElements((elements) => elements.slice(0, 1))
  expect(form.getOutput(scope)).toStrictEqual([0])

  expect(form.getInitial(scope)).toStrictEqual([0, 1])
  form.setInitial([3, 4])
  expect(form.getInitial(scope)).toStrictEqual([3, 4])
  expect(
    form.getElements(scope).map((element) => element.getInitial(scope)),
  ).toStrictEqual([3])
})

it("does not add initial when neither initial nor current value exist", ({
  scope,
}) => {
  const form = ImpulseFormList([ImpulseFormUnit(0), ImpulseFormUnit(1)])

  form.setInitial([3, 4, 5])
  expect(form.getInitial(scope)).toStrictEqual([3, 4])

  expect(
    form.getElements(scope).map((element) => element.getInitial(scope)),
  ).toStrictEqual([3, 4])
})

it("removes initials by shorter list", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { initial: 1 }),
    ImpulseFormUnit(1, { initial: 2 }),
    ImpulseFormUnit(2, { initial: 3 }),
  ])

  form.setInitial([3, 4])
  expect(form.getInitial(scope)).toStrictEqual([3, 4])
  expect(
    form.getElements(scope).map((element) => element.getInitial(scope)),
  ).toStrictEqual([3, 4, 3])
})

it('do not remove initials by "undefined" in the list', ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { initial: 1 }),
    ImpulseFormUnit(1, { initial: 2 }),
    ImpulseFormUnit(2, { initial: 3 }),
  ])

  form.setInitial([undefined, 4, undefined])
  expect(form.getInitial(scope)).toStrictEqual([1, 4, 3])
  expect(
    form.getElements(scope).map((element) => element.getInitial(scope)),
  ).toStrictEqual([1, 4, 3])
})

it("remove all initials by empty list", ({ scope }) => {
  const form = ImpulseFormList([
    ImpulseFormUnit(0, { initial: 1 }),
    ImpulseFormUnit(1, { initial: 2 }),
    ImpulseFormUnit(2, { initial: 3 }),
  ])

  form.setInitial([])
  expect(form.getInitial(scope)).toStrictEqual([])
  expect(
    form.getElements(scope).map((element) => element.getInitial(scope)),
  ).toStrictEqual([1, 2, 3])
})

it("overrides initial values on init", ({ scope }) => {
  const form = ImpulseFormList(
    [
      ImpulseFormUnit(0, { initial: 1 }),
      ImpulseFormUnit(1, { initial: 2 }),
      ImpulseFormUnit(2, { initial: 3 }),
    ],
    {
      initial: [4, 5, 6],
    },
  )

  expect(form.getInitial(scope)).toStrictEqual([4, 5, 6])
  expect(
    form.getElements(scope).map((element) => element.getInitial(scope)),
  ).toStrictEqual([4, 5, 6])
})

it("changed list's initial values when element's initial is changed", ({
  scope,
}) => {
  const form = ImpulseFormList(
    [ImpulseFormUnit(0), ImpulseFormUnit(1), ImpulseFormUnit(2)],
    {
      initial: [3, 4, 5],
    },
  )

  form.getElements(scope).at(1)!.setInitial(6)
  expect(form.getInitial(scope)).toStrictEqual([3, 6, 5])
  expect(
    form.getElements(scope).map((element) => element.getInitial(scope)),
  ).toStrictEqual([3, 6, 5])
})

it("updates list's initial value from an element's setInitial", ({ scope }) => {
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

  expect(form.getInitial(scope)).toStrictEqual([
    { first: 1, second: "1" },
    { first: 2, second: "2" },
  ])
  expect(
    form.getElements(scope).map((element) => element.getInitial(scope)),
  ).toStrictEqual([
    { first: 1, second: "1" },
    { first: 2, second: "2" },
  ])

  form.getElements(scope).at(1)!.setInitial({ first: 3, second: "3" })

  expect(form.getInitial(scope)).toStrictEqual([
    { first: 1, second: "1" },
    { first: 3, second: "3" },
  ])
  expect(
    form.getElements(scope).map((element) => element.getInitial(scope)),
  ).toStrictEqual([
    { first: 1, second: "1" },
    { first: 3, second: "3" },
  ])
})

describe("adding a new element to the list's beginning", () => {
  it.skip("keeps initial values for an initial element", ({ scope }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
    ])

    form.setElements((elements) => [setupElement(), ...elements])

    expect(form.getInitial(scope)).toStrictEqual([{ first: 1, second: "1" }])

    expect(
      form.getElements(scope).map((element) => element.getInitial(scope)),
    ).toStrictEqual([
      { first: 1, second: "1" },
      { first: 1, second: "1" },
    ])
  })

  it.skip("inherits initial value for a new element by default", ({
    scope,
  }) => {
    const form = setup([
      setupElement({
        input: { first: 1, second: "1" },
        initial: { first: 1, second: "1" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        input: { first: 0, second: "0" },
      }),
      ...elements,
    ])

    expect(form.getInitial(scope)).toStrictEqual([{ first: 1, second: "1" }])

    expect(
      form.getElements(scope).map((element) => element.getInitial(scope)),
    ).toStrictEqual([
      { first: 1, second: "1" },
      { first: 1, second: "1" },
    ])
  })

  it.skip("overrides initial value for a list by a new element", ({
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
        initial: { first: 10, second: "10" },
      }),
      ImpulseFormShape({
        first: ImpulseFormUnit(0, { initial: 20 }),
        second: ImpulseFormUnit("", { initial: "20" }),
      }),
      ...elements,
    ])

    expect(form.getInitial(scope)).toStrictEqual([
      { first: 10, second: "10" },
      { first: 20, second: "20" },
    ])

    expect(
      form.getElements(scope).map((element) => element.getInitial(scope)),
    ).toStrictEqual([
      { first: 10, second: "10" },
      { first: 20, second: "20" },
      { first: 1, second: "1" },
      { first: 2, second: "2" },
    ])
  })

  it.skip("updates list's initial value from an element's setInitial", ({
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
      }),
      ...elements,
    ])

    expect(form.getInitial(scope)).toStrictEqual([
      { first: 1, second: "1" },
      { first: 2, second: "2" },
    ])
    expect(
      form.getElements(scope).map((element) => element.getInitial(scope)),
    ).toStrictEqual([
      { first: 1, second: "1" },
      { first: 2, second: "2" },
      { first: 2, second: "2" },
    ])

    form.getElements(scope).at(1)!.setInitial({ first: 3, second: "3" })

    expect(form.getInitial(scope)).toStrictEqual([
      { first: 1, second: "1" },
      { first: 3, second: "3" },
    ])
    expect(
      form.getElements(scope).map((element) => element.getInitial(scope)),
    ).toStrictEqual([
      { first: 1, second: "1" },
      { first: 3, second: "3" },
      { first: 2, second: "2" },
    ])
  })
})

describe("nested list", () => {
  it("returns initial value", ({ scope }) => {
    const form = ImpulseFormList([
      ImpulseFormShape({
        first: ImpulseFormList([
          ImpulseFormShape({
            one: ImpulseFormUnit("1"),
            two: ImpulseFormUnit(2),
          }),
        ]),
      }),
    ])

    expect(form.getInitial(scope)).toStrictEqual([
      {
        first: [{ one: "1", two: 2 }],
      },
    ])
  })

  it("updates initial value", ({ scope }) => {
    const form = ImpulseFormList([
      ImpulseFormShape({
        first: ImpulseFormList([
          ImpulseFormShape({
            one: ImpulseFormUnit("1"),
            two: ImpulseFormUnit(2),
          }),
          ImpulseFormShape({
            one: ImpulseFormUnit("10"),
            two: ImpulseFormUnit(20),
          }),
        ]),
      }),
    ])

    form
      .getElements(scope)
      .at(0)
      ?.fields.first.getElements(scope)
      .at(0)
      ?.fields.one.setInitial("10")

    expect(form.getInitial(scope)).toStrictEqual([
      {
        first: [
          { one: "10", two: 2 },
          { one: "10", two: 20 },
        ],
      },
    ])

    form
      .getElements(scope)
      .at(0)
      ?.fields.first.setInitial([
        { one: "100", two: 200 },
        { one: "1000", two: 2000 },
      ])

    expect(form.getInitial(scope)).toStrictEqual([
      {
        first: [
          { one: "100", two: 200 },
          { one: "1000", two: 2000 },
        ],
      },
    ])
  })
})
