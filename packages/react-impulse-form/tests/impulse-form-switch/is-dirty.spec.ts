import z from "zod"

import { params } from "~/tools/params"

import { ImpulseFormShape, ImpulseFormSwitch, ImpulseFormUnit } from "../../src"

describe("types", () => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("_1", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        schema: z.boolean().transform((value): string => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    },
  )

  type IsDirtySchema =
    | boolean
    | {
        readonly active: boolean
        readonly branch:
          | boolean
          | {
              readonly kind: "_1"
              readonly value: boolean
            }
          | {
              readonly kind: "_2"
              readonly value:
                | boolean
                | {
                    readonly _3: boolean
                    readonly _4: boolean
                  }
            }
      }

  interface IsDirtyVerboseSchema {
    readonly active: boolean
    readonly branches: {
      readonly _1: boolean
      readonly _2: {
        readonly _3: boolean
        readonly _4: boolean
      }
    }
  }

  it("matches schema type for isDirty(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isDirty(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(form.isDirty(scope, params._first)).toEqualTypeOf<IsDirtySchema>()

    expectTypeOf(form.isDirty(scope, params._second)).toEqualTypeOf<IsDirtyVerboseSchema>()
  })

  describe("nested", () => {
    const parent = ImpulseFormSwitch(ImpulseFormUnit<"_6" | "_7">("_6"), {
      _6: ImpulseFormUnit(0),
      _7: form,
    })

    type ParentIsDirtySchema =
      | boolean
      | {
          readonly active: boolean
          readonly branch:
            | boolean
            | {
                readonly kind: "_6"
                readonly value: boolean
              }
            | {
                readonly kind: "_7"
                readonly value: IsDirtySchema
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

      expectTypeOf(parent.isDirty(scope, params._first)).toEqualTypeOf<ParentIsDirtySchema>()

      expectTypeOf(
        parent.isDirty(scope, params._second),
      ).toEqualTypeOf<ParentIsDirtyVerboseSchema>()
    })
  })
})

it("returns false for initially pristine invalid active", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(0),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    },
  )

  expect(form.isDirty(scope)).toBe(false)
  expect(form.isDirty(scope, params._first)).toBe(false)
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: false,
    branches: {
      _1: false,
      _2: {
        _3: false,
        _4: false,
      },
    },
  })
})

it("returns true for initially dirty invalid active", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      initial: "1",
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(0),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    },
  )

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, params._first)).toBe(true)
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: true,
    branches: {
      _1: false,
      _2: {
        _3: false,
        _4: false,
      },
    },
  })
})

it("returns false for initially pristine branch", ({ scope }) => {
  const form = ImpulseFormSwitch(ImpulseFormUnit<"_1" | "_2">("_1"), {
    _1: ImpulseFormUnit(0),
    _2: ImpulseFormShape({
      _3: ImpulseFormUnit("name"),
      _4: ImpulseFormUnit(18),
    }),
  })

  expect(form.isDirty(scope)).toBe(false)
  expect(form.isDirty(scope, params._first)).toBe(false)
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: false,
    branches: {
      _1: false,
      _2: {
        _3: false,
        _4: false,
      },
    },
  })
})

it("returns truthy for initially dirty active", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit<"_1" | "_2">("_1", {
      initial: "_2",
    }),
    {
      _1: ImpulseFormUnit(0),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    },
  )

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, params._first)).toStrictEqual({
    active: true,
    branch: false,
  })
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: true,
    branches: {
      _1: false,
      _2: {
        _3: false,
        _4: false,
      },
    },
  })
})

it("returns true after switching from pristine to dirty branch", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("_1", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(0),
      _2: ImpulseFormShape(
        {
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18),
        },
        {
          initial: {
            _3: "",
            _4: 0,
          },
        },
      ),
    },
  )

  form.active.setInput("_2")

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, params._first)).toStrictEqual(true)
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: true,
    branches: {
      _1: false,
      _2: {
        _3: true,
        _4: true,
      },
    },
  })
})

it("returns truthy after switching from dirty to pristine branch", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("_2", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: ImpulseFormUnit(0),
      _2: ImpulseFormShape(
        {
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18),
        },
        {
          initial: {
            _3: "",
            _4: 0,
          },
        },
      ),
    },
  )

  form.active.setInput("_1")

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, params._first)).toStrictEqual({
    active: true,
    branch: false,
  })
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: true,
    branches: {
      _1: false,
      _2: {
        _3: true,
        _4: true,
      },
    },
  })
})

it("returns truthy for initially dirty branch", ({ scope }) => {
  const form = ImpulseFormSwitch(ImpulseFormUnit<"_1" | "_2">("_2"), {
    _1: ImpulseFormUnit(1),
    _2: ImpulseFormShape({
      _3: ImpulseFormUnit("name", {
        initial: "",
      }),
      _4: ImpulseFormUnit(18),
    }),
  })

  expect(form.isDirty(scope)).toBe(true)
  expect(form.isDirty(scope, params._first)).toStrictEqual({
    active: false,
    branch: {
      kind: "_2",
      value: {
        _3: true,
        _4: false,
      },
    },
  })
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: false,
    branches: {
      _1: false,
      _2: {
        _3: true,
        _4: false,
      },
    },
  })
})

it("ignores an inactive dirty branch", ({ scope }) => {
  const form = ImpulseFormSwitch(ImpulseFormUnit<"_1" | "_2" | "_5">("_2"), {
    _1: ImpulseFormUnit(1, {
      initial: 0,
    }),
    _2: ImpulseFormShape({
      _3: ImpulseFormUnit("name"),
      _4: ImpulseFormUnit(18),
    }),
    _5: ImpulseFormUnit("value", {
      initial: "",
    }),
  })

  expect(form.isDirty(scope)).toBe(false)
  expect(form.isDirty(scope, params._first)).toStrictEqual(false)
  expect(form.isDirty(scope, params._second)).toStrictEqual({
    active: false,
    branches: {
      _1: true,
      _2: {
        _3: false,
        _4: false,
      },
      _5: true,
    },
  })
})

describe("stable dirty value", () => {
  it("subsequently selects equal dirty", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit<"_1" | "_2">("_1", {
        initial: "_2",
      }),
      {
        _1: ImpulseFormUnit(0),
        _2: ImpulseFormShape({
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18),
        }),
      },
    )

    expect(form.isDirty(scope)).toBeTypeOf("boolean")
    expect(form.isDirty(scope)).toBe(form.isDirty(scope))

    expect(form.isDirty(scope, params._first)).toBeInstanceOf(Object)
    expect(form.isDirty(scope, params._first)).toBe(form.isDirty(scope, params._first))

    expect(form.isDirty(scope, params._second)).toBeInstanceOf(Object)
    expect(form.isDirty(scope, params._second)).toBe(form.isDirty(scope, params._second))
  })
})
