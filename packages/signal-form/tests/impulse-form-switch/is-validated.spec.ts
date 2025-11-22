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
        schema: z.boolean().transform((value): string => (value ? "ok" : "not ok")),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
      _5: ImpulseFormUnit("excluded"),
    },
  )

  type IsValidatedSchema =
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
          | {
              readonly kind: "_5"
              readonly value: boolean
            }
      }

  interface IsValidatedVerboseSchema {
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

  it("matches schema type for isValidated(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isValidated(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(form.isValidated(scope, params._first)).toEqualTypeOf<IsValidatedSchema>()

    expectTypeOf(form.isInvalid(scope, params._second)).toEqualTypeOf<IsValidatedVerboseSchema>()
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

    type ParentIsValidatedSchema =
      | boolean
      | {
          readonly active: boolean
          readonly branch:
            | boolean
            | {
                readonly kind: "_6"
                readonly value: IsValidatedSchema
              }
            | {
                readonly kind: "_7"
                readonly value: boolean
              }
        }

    interface ParentIsValidatedVerboseSchema {
      readonly active: boolean
      readonly branches: {
        readonly _6: IsValidatedVerboseSchema
        readonly _7: boolean
      }
    }

    it("matches schema type for isInvalid(scope, select?)", ({ scope }) => {
      expectTypeOf(parent.isInvalid(scope)).toEqualTypeOf<boolean>()

      expectTypeOf(
        parent.isValidated(scope, params._first),
      ).toEqualTypeOf<ParentIsValidatedSchema>()

      expectTypeOf(
        parent.isValidated(scope, params._second),
      ).toEqualTypeOf<ParentIsValidatedVerboseSchema>()
    })
  })
})

describe("when branch is initially invalid", () => {
  it("returns false for initially invalid but not validated active", ({ scope }) => {
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
          _4: ImpulseFormUnit(18, {
            schema: z.number(),
          }),
        }),
        _5: ImpulseFormUnit(false),
      },
    )

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, params._first)).toBe(false)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
      active: false,
      branches: {
        _1: false,
        _2: {
          _3: true,
          _4: false,
        },
        _5: true,
      },
    })
  })

  it("returns true for initially invalid validated active", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("", {
        validateOn: "onInit",
        schema: z.enum(["_1", "_2", "_5"]),
      }),
      {
        _1: ImpulseFormUnit(0, {
          schema: z.number().min(1),
        }),
        _2: ImpulseFormShape({
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18, {
            schema: z.number(),
          }),
        }),
        _5: ImpulseFormUnit(false),
      },
    )

    expect(form.isValidated(scope)).toBe(true)
    expect(form.isValidated(scope, params._first)).toBe(true)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
      active: true,
      branches: {
        _1: false,
        _2: {
          _3: true,
          _4: false,
        },
        _5: true,
      },
    })
  })

  it("returns false for initially valid but not validated active", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_1", {
        schema: z.enum(["_1", "_2", "_5"]),
      }),
      {
        _1: ImpulseFormUnit(0, {
          schema: z.number().min(1),
        }),
        _2: ImpulseFormShape({
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18, {
            schema: z.number(),
          }),
        }),
        _5: ImpulseFormUnit(false),
      },
    )

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, params._first)).toBe(false)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
      active: false,
      branches: {
        _1: false,
        _2: {
          _3: true,
          _4: false,
        },
        _5: true,
      },
    })
  })

  it("returns false for initially valid validated active", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_1", {
        validateOn: "onInit",
        schema: z.enum(["_1", "_2", "_5"]),
      }),
      {
        _1: ImpulseFormUnit(1, {
          schema: z.number().min(1),
        }),
        _2: ImpulseFormShape({
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18, {
            schema: z.number(),
          }),
        }),
        _5: ImpulseFormUnit(false),
      },
    )

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, params._first)).toStrictEqual({
      active: true,
      branch: false,
    })
    expect(form.isValidated(scope, params._second)).toStrictEqual({
      active: true,
      branches: {
        _1: false,
        _2: {
          _3: true,
          _4: false,
        },
        _5: true,
      },
    })
  })

  it("returns false after switching to valid not validated branch", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_2", {
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(0, {
          schema: z.number().min(1),
        }),
        _2: ImpulseFormShape({
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18, {
            schema: z.number(),
          }),
        }),
      },
      {
        validateOn: {
          active: "onInit",
          branch: "onInit",
        },
      },
    )
    expect(form.isValidated(scope)).toBe(true)

    form.active.setInput("_1")

    expect(form.active.isValidated(scope)).toBe(true)
    expect(form.branches._1.isValidated(scope)).toBe(false)
    expect(form.branches._2.isValidated(scope)).toBe(true)
    expect(form.isValidated(scope)).toStrictEqual(false)
    expect(form.isValidated(scope, params._first)).toStrictEqual({
      active: true,
      branch: false,
    })
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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
  it("returns false for initially invalid but not validated active", ({ scope }) => {
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
          _4: ImpulseFormUnit(18, {
            schema: z.number(),
          }),
        }),
      },
    )

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, params._first)).toBe(false)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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

  it("returns true for initially invalid validated active", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("", {
        validateOn: "onInit",
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(1, {
          schema: z.number().min(1),
        }),
        _2: ImpulseFormShape({
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18, {
            schema: z.number(),
          }),
        }),
      },
    )

    expect(form.isValidated(scope)).toBe(true)
    expect(form.isValidated(scope, params._first)).toBe(true)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
      active: true,
      branches: {
        _1: false,
        _2: {
          _3: true,
          _4: false,
        },
      },
    })
  })

  it("returns false for a initially valid but not validated active", ({ scope }) => {
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
          _4: ImpulseFormUnit(18, {
            schema: z.number(),
          }),
        }),
      },
    )

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, params._first)).toBe(false)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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

  it("returns false for a initially valid validated active", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_1", {
        validateOn: "onInit",
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(0, {
          schema: z.number().min(1),
        }),
        _2: ImpulseFormShape({
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18, {
            schema: z.number(),
          }),
        }),
      },
    )

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, params._first)).toStrictEqual({
      active: true,
      branch: false,
    })
    expect(form.isValidated(scope, params._second)).toStrictEqual({
      active: true,
      branches: {
        _1: false,
        _2: {
          _3: true,
          _4: false,
        },
      },
    })
  })

  it("returns false after switching to not validated branch", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_2", {
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(0, {
          schema: z.number().min(1),
        }),
        _2: ImpulseFormShape({
          _3: ImpulseFormUnit("name"),
          _4: ImpulseFormUnit(18, {
            schema: z.number(),
          }),
        }),
      },
      {
        validateOn: {
          active: "onInit",
          branch: "onInit",
        },
      },
    )

    form.active.setInput("_1")

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, params._first)).toStrictEqual({
      active: true,
      branch: false,
    })
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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

it("ignores not validated inactive branches", ({ scope }) => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("_2", {
      schema: z.enum(["_1", "_2", "_5"]),
    }),
    {
      _1: ImpulseFormUnit(0, {
        schema: z.number().min(1),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name", {
          schema: z.string().min(2),
        }),
        _4: ImpulseFormUnit(18, {
          schema: z.number(),
        }),
      }),
      _5: ImpulseFormUnit("", {
        schema: z.string().min(1),
      }),
    },
    {
      validateOn: {
        branches: {
          _1: "onInit",
          _5: "onInit",
        },
      },
    },
  )

  expect(form.isValidated(scope)).toBe(false)
  expect(form.isValidated(scope, params._first)).toBe(false)
  expect(form.isValidated(scope, params._second)).toStrictEqual({
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

describe("stable validated value", () => {
  it("subsequently selects equal validated", ({ scope }) => {
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
          _4: ImpulseFormUnit(18, {
            schema: z.number(),
          }),
        }),
        _5: ImpulseFormUnit(false),
      },
    )

    expect(form.isValidated(scope)).toBeTypeOf("boolean")
    expect(form.isValidated(scope)).toBe(form.isValidated(scope))

    expect(form.isValidated(scope, params._first)).toBeInstanceOf(Object)
    expect(form.isValidated(scope, params._first)).toBe(form.isValidated(scope, params._first))

    expect(form.isValidated(scope, params._second)).toBeInstanceOf(Object)
    expect(form.isValidated(scope, params._second)).toBe(form.isValidated(scope, params._second))
  })
})
