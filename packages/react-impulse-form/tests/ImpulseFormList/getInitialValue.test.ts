import {
  ImpulseFormValue,
  ImpulseFormList,
  type ImpulseFormListOptions,
  type ImpulseForm,
  ImpulseFormShape,
  type ImpulseFormShapeOptions,
} from "../../src"

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

it("updates list's initial value from an element's setInitialValue", ({
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

  expect(form.getInitialValue(scope)).toStrictEqual([
    { first: 1, second: "1" },
    { first: 2, second: "2" },
  ])
  expect(
    form.getElements(scope).map((element) => element.getInitialValue(scope)),
  ).toStrictEqual([
    { first: 1, second: "1" },
    { first: 2, second: "2" },
  ])

  form.getElements(scope).at(1)!.setInitialValue({ first: 3, second: "3" })

  expect(form.getInitialValue(scope)).toStrictEqual([
    { first: 1, second: "1" },
    { first: 3, second: "3" },
  ])
  expect(
    form.getElements(scope).map((element) => element.getInitialValue(scope)),
  ).toStrictEqual([
    { first: 1, second: "1" },
    { first: 3, second: "3" },
  ])
})

describe("adding a new element to the list's beginning", () => {
  it.skip("keeps initial values for an initial element", ({ scope }) => {
    const form = setup([
      setupElement({
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
    ])

    form.setElements((elements) => [setupElement(), ...elements])

    expect(form.getInitialValue(scope)).toStrictEqual([
      { first: 1, second: "1" },
      { first: 1, second: "1" },
    ])

    expect(
      form.getElements(scope).map((element) => element.getInitialValue(scope)),
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
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        originalValue: { first: 0, second: "0" },
      }),
      ...elements,
    ])

    expect(form.getInitialValue(scope)).toStrictEqual([
      { first: 1, second: "1" },
      { first: 1, second: "1" },
    ])

    expect(
      form.getElements(scope).map((element) => element.getInitialValue(scope)),
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
        originalValue: { first: 1, second: "1" },
        initialValue: { first: 1, second: "1" },
      }),
    ])

    form.setElements((elements) => [
      setupElement({
        originalValue: { first: 0, second: "0" },
        initialValue: { first: 2, second: "2" },
      }),
      ...elements,
    ])

    expect(form.getInitialValue(scope)).toStrictEqual([
      { first: 2, second: "2" },
      { first: 1, second: "1" },
    ])

    expect(
      form.getElements(scope).map((element) => element.getInitialValue(scope)),
    ).toStrictEqual([
      { first: 2, second: "2" },
      { first: 1, second: "1" },
    ])
  })

  it.skip("updates list's initial value from an element's setInitialValue", ({
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
      }),
      ...elements,
    ])

    expect(form.getInitialValue(scope)).toStrictEqual([
      { first: 1, second: "1" },
      { first: 2, second: "2" },
    ])
    expect(
      form.getElements(scope).map((element) => element.getInitialValue(scope)),
    ).toStrictEqual([
      { first: 0, second: "" },
      { first: 1, second: "1" },
      { first: 2, second: "2" },
    ])

    form.getElements(scope).at(1)!.setInitialValue({ first: 3, second: "3" })

    expect(form.getInitialValue(scope)).toStrictEqual([
      { first: 1, second: "1" },
      { first: 3, second: "3" },
    ])
    expect(
      form.getElements(scope).map((element) => element.getInitialValue(scope)),
    ).toStrictEqual([
      { first: 0, second: "" },
      { first: 3, second: "3" },
      { first: 2, second: "2" },
    ])
  })
})
