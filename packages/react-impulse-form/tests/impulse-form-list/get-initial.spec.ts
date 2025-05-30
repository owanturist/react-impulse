import {
  type ImpulseForm,
  ImpulseFormList,
  type ImpulseFormListOptions,
  ImpulseFormShape,
  type ImpulseFormShapeOptions,
  ImpulseFormUnit,
} from "../../src"

const setup = <T extends ImpulseForm>(
  elements: ReadonlyArray<T>,
  options?: ImpulseFormListOptions<T>,
) => {
  return ImpulseFormList.of(elements, options)
}

interface Element {
  first: ImpulseFormUnit<number>
  second: ImpulseFormUnit<string>
}

const setupElement = (options?: ImpulseFormShapeOptions<Element>) => {
  return ImpulseFormShape.of(
    {
      first: ImpulseFormUnit.of(0),
      second: ImpulseFormUnit.of(""),
    },
    options,
  )
}

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
  it("keeps initial values for an initial element", ({ scope }) => {
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

  it("inherits initial value for a new element by default", ({ scope }) => {
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

  it("overrides initial value for a list by a new element", ({ scope }) => {
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
      ImpulseFormShape.of({
        first: ImpulseFormUnit.of(0, { initial: 20 }),
        second: ImpulseFormUnit.of("", { initial: "20" }),
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

  it("updates list's initial value from an element's setInitial", ({
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
    const form = ImpulseFormList.of([
      ImpulseFormShape.of({
        first: ImpulseFormList.of([
          ImpulseFormShape.of({
            one: ImpulseFormUnit.of("1"),
            two: ImpulseFormUnit.of(2),
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
    const form = ImpulseFormList.of([
      ImpulseFormShape.of({
        first: ImpulseFormList.of([
          ImpulseFormShape.of({
            one: ImpulseFormUnit.of("1"),
            two: ImpulseFormUnit.of(2),
          }),
          ImpulseFormShape.of({
            one: ImpulseFormUnit.of("10"),
            two: ImpulseFormUnit.of(20),
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
