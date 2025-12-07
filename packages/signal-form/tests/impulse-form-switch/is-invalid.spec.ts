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

  type IsInvalidSchema =
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

  interface IsInvalidVerboseSchema {
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

  it("matches schema type for isInvalid(monitor, select?)", ({ monitor }) => {
    expectTypeOf(form.isInvalid(monitor)).toEqualTypeOf<boolean>()

    expectTypeOf(form.isInvalid(monitor, params._first)).toEqualTypeOf<IsInvalidSchema>()

    expectTypeOf(form.isInvalid(monitor, params._second)).toEqualTypeOf<IsInvalidVerboseSchema>()
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

    type ParentIsInvalidSchema =
      | boolean
      | {
          readonly active: boolean
          readonly branch:
            | boolean
            | {
                readonly kind: "_6"
                readonly value: IsInvalidSchema
              }
            | {
                readonly kind: "_7"
                readonly value: boolean
              }
        }

    interface ParentIsInvalidVerboseSchema {
      readonly active: boolean
      readonly branches: {
        readonly _6: IsInvalidVerboseSchema
        readonly _7: boolean
      }
    }

    it("matches schema type for isInvalid(monitor, select?)", ({ monitor }) => {
      expectTypeOf(parent.isInvalid(monitor)).toEqualTypeOf<boolean>()

      expectTypeOf(parent.isInvalid(monitor, params._first)).toEqualTypeOf<ParentIsInvalidSchema>()

      expectTypeOf(
        parent.isInvalid(monitor, params._second),
      ).toEqualTypeOf<ParentIsInvalidVerboseSchema>()
    })
  })
})

describe("when branch is initially invalid", () => {
  it("returns false for initially invalid but not validated active", ({ monitor }) => {
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

    expect(form.isInvalid(monitor)).toBe(false)
    expect(form.isInvalid(monitor, params._first)).toBe(false)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
      active: false,
      branches: {
        _1: false,
        _2: {
          _3: false,
          _4: false,
        },
        _5: false,
      },
    })
  })

  it("returns true for initially invalid validated active", ({ monitor }) => {
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
          _4: ImpulseFormUnit(18),
        }),
        _5: ImpulseFormUnit(false),
      },
    )

    expect(form.isInvalid(monitor)).toBe(true)
    expect(form.isInvalid(monitor, params._first)).toBe(true)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
      active: true,
      branches: {
        _1: false,
        _2: {
          _3: false,
          _4: false,
        },
        _5: false,
      },
    })
  })

  it("returns false for initially valid but not validated active", ({ monitor }) => {
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
          _4: ImpulseFormUnit(18),
        }),
        _5: ImpulseFormUnit(false),
      },
    )

    expect(form.isInvalid(monitor)).toBe(false)
    expect(form.isInvalid(monitor, params._first)).toBe(false)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
      active: false,
      branches: {
        _1: false,
        _2: {
          _3: false,
          _4: false,
        },
        _5: false,
      },
    })
  })

  it("returns false for initially valid validated active", ({ monitor }) => {
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
          _4: ImpulseFormUnit(18),
        }),
        _5: ImpulseFormUnit(false),
      },
    )

    expect(form.isInvalid(monitor)).toBe(false)
    expect(form.isInvalid(monitor, params._first)).toBe(false)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
      active: false,
      branches: {
        _1: false,
        _2: {
          _3: false,
          _4: false,
        },
        _5: false,
      },
    })
  })

  it("returns false after switching to valid validated branch", ({ monitor }) => {
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
      {
        validateOn: {
          branches: "onInit",
        },
      },
    )

    form.active.setInput("_2")

    expect(form.active.isInvalid(monitor)).toBe(false)
    expect(form.branches._1.isInvalid(monitor)).toBe(true)
    expect(form.branches._2.isInvalid(monitor)).toBe(false)
    expect(form.isInvalid(monitor)).toStrictEqual(false)
    expect(form.isInvalid(monitor, params._first)).toBe(false)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
      active: false,
      branches: {
        _1: true,
        _2: {
          _3: false,
          _4: false,
        },
      },
    })
  })
})

describe("when branch is initially valid", () => {
  it("returns false for initially invalid but not validated active", ({ monitor }) => {
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

    expect(form.isInvalid(monitor)).toBe(false)
    expect(form.isInvalid(monitor, params._first)).toBe(false)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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

  it("returns true for initially invalid validated active", ({ monitor }) => {
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
          _4: ImpulseFormUnit(18),
        }),
      },
    )

    expect(form.isInvalid(monitor)).toBe(true)
    expect(form.isInvalid(monitor, params._first)).toBe(true)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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

  it("returns false for a initially valid but not validated active", ({ monitor }) => {
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

    expect(form.active.isInvalid(monitor)).toBe(false)

    expect(form.isInvalid(monitor)).toBe(false)
    expect(form.isInvalid(monitor, params._first)).toBe(false)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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

  it("returns false for a initially valid validated active", ({ monitor }) => {
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
          _4: ImpulseFormUnit(18),
        }),
      },
    )

    expect(form.active.isInvalid(monitor)).toBe(false)

    expect(form.isInvalid(monitor)).toBe(false)
    expect(form.isInvalid(monitor, params._first)).toBe(false)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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

  it("returns truthy after switching to invalid branch", ({ monitor }) => {
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
          _4: ImpulseFormUnit(18),
        }),
      },
      {
        validateOn: {
          branches: "onInit",
        },
      },
    )

    form.active.setInput("_1")

    expect(form.isInvalid(monitor)).toBe(true)
    expect(form.isInvalid(monitor, params._first)).toStrictEqual({
      active: false,
      branch: true,
    })
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
      active: false,
      branches: {
        _1: true,
        _2: {
          _3: false,
          _4: false,
        },
      },
    })
  })

  it("returns true after making active invalid", ({ monitor }) => {
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
      {
        validateOn: {
          active: "onInit",
          branches: "onInit",
        },
      },
    )

    form.active.setInput("")

    expect(form.active.isInvalid(monitor)).toBe(true)

    expect(form.isInvalid(monitor)).toBe(true)
    expect(form.isInvalid(monitor, params._first)).toBe(true)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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
})

it("ignores invalid inactive branches", ({ monitor }) => {
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
    {
      validateOn: {
        active: "onInit",
        branches: "onInit",
      },
    },
  )

  expect(form.active.isInvalid(monitor)).toBe(false)

  expect(form.isInvalid(monitor)).toBe(false)
  expect(form.isInvalid(monitor, params._first)).toBe(false)
  expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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

describe("stable invalid value", () => {
  it("subsequently selects equal invalid", ({ monitor }) => {
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
          _4: ImpulseFormUnit(18),
        }),
        _5: ImpulseFormUnit(false),
      },
      {
        validateOn: {
          active: "onInit",
          branches: "onInit",
        },
      },
    )

    expect(form.isInvalid(monitor)).toBeTypeOf("boolean")
    expect(form.isInvalid(monitor)).toBe(form.isInvalid(monitor))

    expect(form.isInvalid(monitor, params._first)).toBeInstanceOf(Object)
    expect(form.isInvalid(monitor, params._first)).toBe(form.isInvalid(monitor, params._first))

    expect(form.isInvalid(monitor, params._second)).toBeInstanceOf(Object)
    expect(form.isInvalid(monitor, params._second)).toBe(form.isInvalid(monitor, params._second))
  })
})
