import z from "zod"

import { params } from "~/tools/params"

import { FormShape, FormSwitch, FormUnit } from "../../src"

describe("types", () => {
  const form = FormSwitch(
    FormUnit("_1", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: FormUnit(true, {
        schema: z.boolean().transform((value): string => (value ? "ok" : "not ok")),
      }),
      _2: FormShape({
        _3: FormUnit("name"),
        _4: FormUnit(18),
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

  it("matches schema type for isDirty(monitor, select?)", ({ monitor }) => {
    expectTypeOf(form.isDirty(monitor)).toEqualTypeOf<boolean>()

    expectTypeOf(form.isDirty(monitor, params._first)).toEqualTypeOf<IsDirtySchema>()

    expectTypeOf(form.isDirty(monitor, params._second)).toEqualTypeOf<IsDirtyVerboseSchema>()
  })

  describe("nested", () => {
    const parent = FormSwitch(FormUnit<"_6" | "_7">("_6"), {
      _6: FormUnit(0),
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

    it("matches schema type for isDirty(monitor, select?)", ({ monitor }) => {
      expectTypeOf(parent.isDirty(monitor)).toEqualTypeOf<boolean>()

      expectTypeOf(parent.isDirty(monitor, params._first)).toEqualTypeOf<ParentIsDirtySchema>()

      expectTypeOf(
        parent.isDirty(monitor, params._second),
      ).toEqualTypeOf<ParentIsDirtyVerboseSchema>()
    })
  })
})

it("returns false for initially pristine invalid active", ({ monitor }) => {
  const form = FormSwitch(
    FormUnit("", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: FormUnit(0),
      _2: FormShape({
        _3: FormUnit("name"),
        _4: FormUnit(18),
      }),
    },
  )

  expect(form.isDirty(monitor)).toBe(false)
  expect(form.isDirty(monitor, params._first)).toBe(false)
  expect(form.isDirty(monitor, params._second)).toStrictEqual({
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

it("returns true for initially dirty invalid active", ({ monitor }) => {
  const form = FormSwitch(
    FormUnit("", {
      initial: "1",
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: FormUnit(0),
      _2: FormShape({
        _3: FormUnit("name"),
        _4: FormUnit(18),
      }),
    },
  )

  expect(form.isDirty(monitor)).toBe(true)
  expect(form.isDirty(monitor, params._first)).toBe(true)
  expect(form.isDirty(monitor, params._second)).toStrictEqual({
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

it("returns false for initially pristine branch", ({ monitor }) => {
  const form = FormSwitch(FormUnit<"_1" | "_2">("_1"), {
    _1: FormUnit(0),
    _2: FormShape({
      _3: FormUnit("name"),
      _4: FormUnit(18),
    }),
  })

  expect(form.isDirty(monitor)).toBe(false)
  expect(form.isDirty(monitor, params._first)).toBe(false)
  expect(form.isDirty(monitor, params._second)).toStrictEqual({
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

it("returns truthy for initially dirty active", ({ monitor }) => {
  const form = FormSwitch(
    FormUnit<"_1" | "_2">("_1", {
      initial: "_2",
    }),
    {
      _1: FormUnit(0),
      _2: FormShape({
        _3: FormUnit("name"),
        _4: FormUnit(18),
      }),
    },
  )

  expect(form.isDirty(monitor)).toBe(true)
  expect(form.isDirty(monitor, params._first)).toStrictEqual({
    active: true,
    branch: false,
  })
  expect(form.isDirty(monitor, params._second)).toStrictEqual({
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

it("returns true after switching from pristine to dirty branch", ({ monitor }) => {
  const form = FormSwitch(
    FormUnit("_1", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: FormUnit(0),
      _2: FormShape(
        {
          _3: FormUnit("name"),
          _4: FormUnit(18),
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

  expect(form.isDirty(monitor)).toBe(true)
  expect(form.isDirty(monitor, params._first)).toStrictEqual(true)
  expect(form.isDirty(monitor, params._second)).toStrictEqual({
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

it("returns truthy after switching from dirty to pristine branch", ({ monitor }) => {
  const form = FormSwitch(
    FormUnit("_2", {
      schema: z.enum(["_1", "_2"]),
    }),
    {
      _1: FormUnit(0),
      _2: FormShape(
        {
          _3: FormUnit("name"),
          _4: FormUnit(18),
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

  expect(form.isDirty(monitor)).toBe(true)
  expect(form.isDirty(monitor, params._first)).toStrictEqual({
    active: true,
    branch: false,
  })
  expect(form.isDirty(monitor, params._second)).toStrictEqual({
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

it("returns truthy for initially dirty branch", ({ monitor }) => {
  const form = FormSwitch(FormUnit<"_1" | "_2">("_2"), {
    _1: FormUnit(1),
    _2: FormShape({
      _3: FormUnit("name", {
        initial: "",
      }),
      _4: FormUnit(18),
    }),
  })

  expect(form.isDirty(monitor)).toBe(true)
  expect(form.isDirty(monitor, params._first)).toStrictEqual({
    active: false,
    branch: {
      kind: "_2",
      value: {
        _3: true,
        _4: false,
      },
    },
  })
  expect(form.isDirty(monitor, params._second)).toStrictEqual({
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

it("ignores an inactive dirty branch", ({ monitor }) => {
  const form = FormSwitch(FormUnit<"_1" | "_2" | "_5">("_2"), {
    _1: FormUnit(1, {
      initial: 0,
    }),
    _2: FormShape({
      _3: FormUnit("name"),
      _4: FormUnit(18),
    }),
    _5: FormUnit("value", {
      initial: "",
    }),
  })

  expect(form.isDirty(monitor)).toBe(false)
  expect(form.isDirty(monitor, params._first)).toStrictEqual(false)
  expect(form.isDirty(monitor, params._second)).toStrictEqual({
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
  it("subsequently selects equal dirty", ({ monitor }) => {
    const form = FormSwitch(
      FormUnit<"_1" | "_2">("_1", {
        initial: "_2",
      }),
      {
        _1: FormUnit(0),
        _2: FormShape({
          _3: FormUnit("name"),
          _4: FormUnit(18),
        }),
      },
    )

    expect(form.isDirty(monitor)).toBeTypeOf("boolean")
    expect(form.isDirty(monitor)).toBe(form.isDirty(monitor))

    expect(form.isDirty(monitor, params._first)).toBeInstanceOf(Object)
    expect(form.isDirty(monitor, params._first)).toBe(form.isDirty(monitor, params._first))

    expect(form.isDirty(monitor, params._second)).toBeInstanceOf(Object)
    expect(form.isDirty(monitor, params._second)).toBe(form.isDirty(monitor, params._second))
  })
})
