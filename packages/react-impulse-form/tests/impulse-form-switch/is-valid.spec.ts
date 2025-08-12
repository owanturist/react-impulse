import z from "zod"

import { params } from "~/tools/params"

import { ImpulseFormShape, ImpulseFormSwitch, ImpulseFormUnit } from "../../src"

describe("types", () => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["_1", "_2", "_5"]),
    }),
    {
      _1: ImpulseFormUnit(true, {
        schema: z
          .boolean()
          .transform((value): string => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
      _5: ImpulseFormUnit("excluded"),
    },
  )

  type IsValidSchema =
    | boolean
    | {
        readonly active: boolean
        readonly branch:
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
          | {
              readonly kind: "_5"
              readonly value: boolean
            }
      }

  interface IsValidVerboseSchema {
    readonly active: boolean
    readonly branches: {
      readonly _1: boolean
      readonly _2: {
        readonly _3: boolean
        readonly _4: boolean
      }
      readonly _5: boolean
    }
  }

  it("matches schema type for isValid(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isValid(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(
      form.isValid(scope, params._first),
    ).toEqualTypeOf<IsValidSchema>()

    expectTypeOf(
      form.isValid(scope, params._second),
    ).toEqualTypeOf<IsValidVerboseSchema>()
  })

  describe("nested", () => {
    const parent = ImpulseFormSwitch(
      ImpulseFormUnit("", {
        schema: z.enum(["_6", "_7"]),
      }),
      {
        _6: form,
        _7: ImpulseFormUnit("0"),
      },
    )

    type ParentIsValidSchema =
      | boolean
      | {
          readonly active: boolean
          readonly branch:
            | {
                readonly kind: "_6"
                readonly value: IsValidSchema
              }
            | {
                readonly kind: "_7"
                readonly value: boolean
              }
        }

    interface ParentIsValidVerboseSchema {
      readonly active: boolean
      readonly branches: {
        readonly _6: IsValidVerboseSchema
        readonly _7: boolean
      }
    }

    it("matches schema type for isValid(scope, select?)", ({ scope }) => {
      expectTypeOf(parent.isValid(scope)).toEqualTypeOf<boolean>()

      expectTypeOf(
        parent.isValid(scope, params._first),
      ).toEqualTypeOf<ParentIsValidSchema>()

      expectTypeOf(
        parent.isValid(scope, params._second),
      ).toEqualTypeOf<ParentIsValidVerboseSchema>()
    })
  })
})

describe("when branch is initially invalid", () => {
  it("returns false for initially invalid active", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("", {
        schema: z.enum(["_1", "_2", "_5"]),
      }),
      {
        _1: ImpulseFormUnit(0, {
          schema: z.number().min(1),
        }),
        _2: ImpulseFormShape({
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18),
        }),
        _5: ImpulseFormUnit(false),
      },
    )

    expect(form.isValid(scope)).toBe(false)
    expect(form.isValid(scope, params._first)).toBe(false)
    expect(form.isValid(scope, params._second)).toStrictEqual({
      active: false,
      branches: {
        _1: false,
        _2: {
          _3: true,
          _4: true,
        },
        _5: true,
      },
    })
  })

  it("returns falsy for initially valid active", ({ scope }) => {
    const form = ImpulseFormSwitch(ImpulseFormUnit<"_1" | "_2" | "_5">("_1"), {
      _1: ImpulseFormUnit(0, {
        schema: z.number().min(1),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
      _5: ImpulseFormUnit(false),
    })

    expect(form.isValid(scope)).toBe(false)
    expect(form.isValid(scope, params._first)).toStrictEqual({
      active: true,
      branch: {
        kind: "_1",
        value: false,
      },
    })
    expect(form.isValid(scope, params._second)).toStrictEqual({
      active: true,
      branches: {
        _1: false,
        _2: {
          _3: true,
          _4: true,
        },
        _5: true,
      },
    })
  })

  it("returns true after switching to valid branch", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_1", {
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(0, {
          schema: z.number().min(1),
        }),
        _2: ImpulseFormShape({
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18),
        }),
      },
    )

    form.active.setInput("_2")

    expect(form.active.isValid(scope)).toBe(true)
    expect(form.branches._2.isValid(scope)).toBe(true)
    expect(form.isValid(scope)).toStrictEqual(true)
    expect(form.isValid(scope, params._first)).toBe(true)
    expect(form.isValid(scope, params._second)).toStrictEqual({
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
})

describe("when branch is initially valid", () => {
  it("returns false for initially invalid active", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("", {
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(1, {
          schema: z.number().min(1),
        }),
        _2: ImpulseFormShape({
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18),
        }),
      },
    )

    expect(form.isValid(scope)).toBe(false)
    expect(form.isValid(scope, params._first)).toBe(false)
    expect(form.isValid(scope, params._second)).toStrictEqual({
      active: false,
      branches: {
        _1: true,
        _2: {
          _3: true,
          _4: true,
        },
      },
    })
  })

  it("returns true for a initially valid active", ({ scope }) => {
    const form = ImpulseFormSwitch(ImpulseFormUnit<"_1" | "_2">("_1"), {
      _1: ImpulseFormUnit(1, {
        schema: z.number().min(1),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    })

    expect(form.active.isValid(scope)).toBe(true)

    expect(form.isValid(scope)).toBe(true)
    expect(form.isValid(scope, params._first)).toBe(true)
    expect(form.isValid(scope, params._second)).toStrictEqual({
      active: true,
      branches: {
        _1: true,
        _2: {
          _3: true,
          _4: true,
        },
      },
    })
  })

  it("returns falsy after switching to invalid branch", ({ scope }) => {
    const form = ImpulseFormSwitch(ImpulseFormUnit<"_1" | "_2">("_2"), {
      _1: ImpulseFormUnit(0, {
        schema: z.number().min(1),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    })

    form.active.setInput("_1")

    expect(form.isValid(scope)).toBe(false)
    expect(form.isValid(scope, params._first)).toStrictEqual({
      active: true,
      branch: {
        kind: "_1",
        value: false,
      },
    })
    expect(form.isValid(scope, params._second)).toStrictEqual({
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

  it("returns false after making active invalid", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_1", {
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(1, {
          schema: z.number().min(1),
        }),
        _2: ImpulseFormShape({
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18),
        }),
      },
    )

    form.active.setInput("")

    expect(form.active.isValid(scope)).toBe(false)

    expect(form.isValid(scope)).toBe(false)
    expect(form.isValid(scope, params._first)).toBe(false)
    expect(form.isValid(scope, params._second)).toStrictEqual({
      active: false,
      branches: {
        _1: true,
        _2: {
          _3: true,
          _4: true,
        },
      },
    })
  })
})

it("ignores invalid inactive branches", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("_2", {
      schema: z.enum(["_1", "_2", "_5"]),
    }),
    {
      _1: ImpulseFormUnit(0, {
        schema: z.number().min(1),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
      _5: ImpulseFormUnit("", {
        schema: z.string().min(1),
      }),
    },
  )

  expect(form.active.isValid(scope)).toBe(true)

  expect(form.isValid(scope)).toBe(true)
  expect(form.isValid(scope, params._first)).toBe(true)
  expect(form.isValid(scope, params._second)).toStrictEqual({
    active: true,
    branches: {
      _1: false,
      _2: {
        _3: true,
        _4: true,
      },
      _5: false,
    },
  })
})
