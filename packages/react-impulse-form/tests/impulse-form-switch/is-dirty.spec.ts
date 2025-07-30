import z from "zod"

import { params } from "~/tools/params"

import { ImpulseFormShape, ImpulseFormSwitch, ImpulseFormUnit } from "../../src"

describe("types", () => {
  const form = ImpulseFormSwitch("first", {
    first: ImpulseFormUnit(true, {
      schema: z
        .boolean()
        .transform((value): string => (value ? "ok" : "not ok")),
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  interface IsDirtySchema {
    readonly first: boolean
    readonly second:
      | boolean
      | {
          readonly name: boolean
          readonly age: boolean
        }
  }

  interface IsDirtyVerboseSchema {
    readonly first: boolean
    readonly second: {
      readonly name: boolean
      readonly age: boolean
    }
  }

  it("matches schema type for isDirty(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isDirty(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(form.isDirty(scope, params._first)).toEqualTypeOf<
      boolean | IsDirtySchema
    >()

    expectTypeOf(
      form.isDirty(scope, params._second),
    ).toEqualTypeOf<IsDirtyVerboseSchema>()
  })
})

it("returns falsy for initially pristine active branch", ({ scope }) => {
  const form = ImpulseFormSwitch("first", {
    first: ImpulseFormUnit(0),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  expect(form.isDirty(scope)).toBe(false)
  expect(form.isDirty(scope, params._first)).toBe(false)
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    first: false,
    second: {
      name: false,
      age: false,
    },
  })
})

it("returns truthy after switching from pristine to dirty branch", ({
  scope,
}) => {
  const form = ImpulseFormSwitch("first", {
    first: ImpulseFormUnit(0),
    second: ImpulseFormShape(
      {
        name: ImpulseFormUnit("name"),
        age: ImpulseFormUnit(18),
      },
      {
        initial: {
          name: "",
          age: 0,
        },
      },
    ),
  })

  form.setActive("second")

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, params._first)).toStrictEqual({
    first: false,
    second: true,
  })
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    first: false,
    second: {
      name: true,
      age: true,
    },
  })
})

it("returns falsy after switching from dirty to pristine branch", ({
  scope,
}) => {
  const form = ImpulseFormSwitch("second", {
    first: ImpulseFormUnit(0),
    second: ImpulseFormShape(
      {
        name: ImpulseFormUnit("name"),
        age: ImpulseFormUnit(18),
      },
      {
        initial: {
          name: "",
          age: 0,
        },
      },
    ),
  })

  form.setActive("first")

  expect(form.isDirty(scope)).toBe(false)
  expect(form.isDirty(scope, params._first)).toStrictEqual({
    first: false,
    second: true,
  })
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    first: false,
    second: {
      name: true,
      age: true,
    },
  })
})

it("returns true for initially dirty branch", ({ scope }) => {
  const form = ImpulseFormSwitch("second", {
    first: ImpulseFormUnit(1),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name", {
        initial: "",
      }),
      age: ImpulseFormUnit(18),
    }),
  })

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, params._first)).toStrictEqual({
    first: false,
    second: {
      name: true,
      age: false,
    },
  })
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    first: false,
    second: {
      name: true,
      age: false,
    },
  })
})

it("ignores dirty inactive branches when no select is provided", ({
  scope,
}) => {
  const form = ImpulseFormSwitch("second", {
    first: ImpulseFormUnit(1, {
      initial: 0,
    }),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
    third: ImpulseFormUnit("value", {
      initial: "",
    }),
  })

  expect(form.isDirty(scope)).toBe(false)
  expect(form.isDirty(scope, params._first)).toStrictEqual({
    first: true,
    second: false,
    third: true,
  })
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    first: true,
    second: {
      name: false,
      age: false,
    },
    third: true,
  })
})
