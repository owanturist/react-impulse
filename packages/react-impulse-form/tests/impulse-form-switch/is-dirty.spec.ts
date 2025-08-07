import z from "zod"

import { params } from "~/tools/params"

import { ImpulseFormShape, ImpulseFormSwitch, ImpulseFormUnit } from "../../src"

describe("types", () => {
  const form = ImpulseFormSwitch(ImpulseFormUnit("first"), {
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

  type IsDirtySchema =
    | boolean
    | {
        readonly active: boolean
        readonly branches:
          | boolean
          | {
              readonly first: boolean
              readonly second:
                | boolean
                | {
                    readonly name: boolean
                    readonly age: boolean
                  }
            }
      }

  interface IsDirtyVerboseSchema {
    readonly active: boolean
    readonly branches: {
      readonly first: boolean
      readonly second: {
        readonly name: boolean
        readonly age: boolean
      }
    }
  }

  it("matches schema type for isDirty(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isDirty(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(
      form.isDirty(scope, params._first),
    ).toEqualTypeOf<IsDirtySchema>()

    expectTypeOf(
      form.isDirty(scope, params._second),
    ).toEqualTypeOf<IsDirtyVerboseSchema>()
  })

  describe("nested", () => {
    const parent = ImpulseFormSwitch(ImpulseFormUnit("_5"), {
      _6: ImpulseFormUnit(0),
      _7: form,
    })

    type ParentIsDirtySchema =
      | boolean
      | {
          readonly active: boolean
          readonly branches:
            | boolean
            | {
                readonly _6: boolean
                readonly _7: IsDirtySchema
              }
        }

    interface ParentIsDirtyVerboseSchema {
      readonly active: boolean
      readonly branches: {
        readonly _6: boolean
        readonly _7: IsDirtyVerboseSchema
      }
    }

    it("matches schema type for isDirty(scope, select?)", ({ scope }) => {
      expectTypeOf(parent.isDirty(scope)).toEqualTypeOf<boolean>()

      expectTypeOf(
        parent.isDirty(scope, params._first),
      ).toEqualTypeOf<ParentIsDirtySchema>()

      expectTypeOf(
        parent.isDirty(scope, params._second),
      ).toEqualTypeOf<ParentIsDirtyVerboseSchema>()
    })
  })
})

it("returns falsy for initially pristine branch", ({ scope }) => {
  const form = ImpulseFormSwitch(ImpulseFormUnit("first"), {
    first: ImpulseFormUnit(0),
    second: ImpulseFormShape({
      name: ImpulseFormUnit("name"),
      age: ImpulseFormUnit(18),
    }),
  })

  expect(form.isDirty(scope)).toBe(false)
  expect(form.isDirty(scope, params._first)).toBe(false)
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: false,
    branches: {
      first: false,
      second: {
        name: false,
        age: false,
      },
    },
  })
})

it("returns truthy for initially dirty active", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("first", {
      initial: "second",
    }),
    {
      first: ImpulseFormUnit(0),
      second: ImpulseFormShape({
        name: ImpulseFormUnit("name"),
        age: ImpulseFormUnit(18),
      }),
    },
  )

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, params._first)).toStrictEqual({
    active: true,
    branches: false,
  })
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: true,
    branches: {
      first: false,
      second: {
        name: false,
        age: false,
      },
    },
  })
})

it("returns truthy after switching from pristine to dirty branch", ({
  scope,
}) => {
  const form = ImpulseFormSwitch(ImpulseFormUnit("first"), {
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

  form.active.setInput("second")

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, params._first)).toStrictEqual({
    active: true,
    branches: {
      first: false,
      second: true,
    },
  })
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: true,
    branches: {
      first: false,
      second: {
        name: true,
        age: true,
      },
    },
  })
})

it("returns truthy after switching from dirty to pristine branch", ({
  scope,
}) => {
  const form = ImpulseFormSwitch(ImpulseFormUnit("second"), {
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

  form.active.setInput("first")

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, params._first)).toStrictEqual({
    active: true,
    branches: {
      first: false,
      second: true,
    },
  })
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: true,
    branches: {
      first: false,
      second: {
        name: true,
        age: true,
      },
    },
  })
})

it("returns truthy for initially dirty branch", ({ scope }) => {
  const form = ImpulseFormSwitch(ImpulseFormUnit("second"), {
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
    active: false,
    branches: {
      first: false,
      second: {
        name: true,
        age: false,
      },
    },
  })
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: false,
    branches: {
      first: false,
      second: {
        name: true,
        age: false,
      },
    },
  })
})

it("returns truthy when an inactive branch is dirty", ({ scope }) => {
  const form = ImpulseFormSwitch(ImpulseFormUnit("second"), {
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

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, params._first)).toStrictEqual({
    active: false,
    branches: {
      first: true,
      second: false,
      third: true,
    },
  })
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: false,
    branches: {
      first: true,
      second: {
        name: false,
        age: false,
      },
      third: true,
    },
  })
})
