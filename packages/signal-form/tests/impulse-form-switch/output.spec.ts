import z from "zod"

import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
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

  type OutputSchema =
    | {
        readonly kind: "_1"
        readonly value: string
      }
    | {
        readonly kind: "_2"
        readonly value: {
          readonly _3: string
          readonly _4: number
        }
      }
    | {
        readonly kind: "_5"
        readonly value: string
      }

  interface OutputVerboseSchema {
    readonly active: null | "_1" | "_2" | "_5"
    readonly branches: {
      readonly _1: null | string
      readonly _2: {
        readonly _3: null | string
        readonly _4: null | number
      }
      readonly _5: null | string
    }
  }

  it("matches schema type for getOutput(monitor, select?)", ({ monitor }) => {
    expectTypeOf(form.getOutput(monitor)).toEqualTypeOf<null | OutputSchema>()

    expectTypeOf(form.getOutput(monitor, params._first)).toEqualTypeOf<null | OutputSchema>()

    expectTypeOf(form.getOutput(monitor, params._second)).toEqualTypeOf<OutputVerboseSchema>()
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

    type ParentOutputSchema =
      | {
          readonly kind: "_6"
          readonly value: OutputSchema
        }
      | {
          readonly kind: "_7"
          readonly value: string
        }

    interface ParentOutputVerboseSchema {
      readonly active: null | "_6" | "_7"
      readonly branches: {
        readonly _6: OutputVerboseSchema
        readonly _7: null | string
      }
    }

    it("matches schema type for getOutput(monitor, select?)", ({ monitor }) => {
      expectTypeOf(parent.getOutput(monitor)).toEqualTypeOf<null | ParentOutputSchema>()

      expectTypeOf(
        parent.getOutput(monitor, params._first),
      ).toEqualTypeOf<null | ParentOutputSchema>()

      expectTypeOf(
        parent.getOutput(monitor, params._second),
      ).toEqualTypeOf<ParentOutputVerboseSchema>()
    })
  })
})

describe("when branch is initially invalid", () => {
  it("returns null for initially invalid active", ({ monitor }) => {
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

    expect(form.getOutput(monitor)).toBeNull()
    expect(form.getOutput(monitor, params._first)).toBeNull()
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      active: null,
      branches: {
        _1: null,
        _2: {
          _3: "name",
          _4: 18,
        },
        _5: false,
      },
    })
  })

  it("returns null for initially valid active", ({ monitor }) => {
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

    expect(form.getOutput(monitor)).toBeNull()
    expect(form.getOutput(monitor, params._first)).toBeNull()
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      active: "_1",
      branches: {
        _1: null,
        _2: {
          _3: "name",
          _4: 18,
        },
        _5: false,
      },
    })
  })

  it("returns output after switching to valid branch", ({ monitor }) => {
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

    expect(form.active.getOutput(monitor)).toBe("_2")
    expect(form.branches._2.getOutput(monitor)).toStrictEqual({
      _3: "name",
      _4: 18,
    })
    expect(form.getOutput(monitor)).toStrictEqual({
      kind: "_2",
      value: {
        _3: "name",
        _4: 18,
      },
    })
    expect(form.getOutput(monitor, params._first)).toStrictEqual({
      kind: "_2",
      value: {
        _3: "name",
        _4: 18,
      },
    })
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      active: "_2",
      branches: {
        _1: null,
        _2: {
          _3: "name",
          _4: 18,
        },
      },
    })
  })
})

describe("when branch is initially valid", () => {
  it("returns null for initially invalid active", ({ monitor }) => {
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

    expect(form.getOutput(monitor)).toBeNull()
    expect(form.getOutput(monitor, params._first)).toBeNull()
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      active: null,
      branches: {
        _1: 1,
        _2: {
          _3: "name",
          _4: 18,
        },
      },
    })
  })

  it("returns output for a initially valid active", ({ monitor }) => {
    const form = ImpulseFormSwitch(ImpulseFormUnit<"_1" | "_2">("_1"), {
      _1: ImpulseFormUnit(1, {
        schema: z.number().min(1),
      }),
      _2: ImpulseFormShape({
        _3: ImpulseFormUnit("name"),
        _4: ImpulseFormUnit(18),
      }),
    })

    expect(form.active.getOutput(monitor)).toBe("_1")

    const concise = {
      kind: "_1",
      value: 1,
    }

    expect(form.getOutput(monitor)).toStrictEqual(concise)
    expect(form.getOutput(monitor, params._first)).toStrictEqual(concise)
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      active: "_1",
      branches: {
        _1: 1,
        _2: {
          _3: "name",
          _4: 18,
        },
      },
    })
  })

  it("returns null after switching to invalid branch", ({ monitor }) => {
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

    expect(form.getOutput(monitor)).toBeNull()
    expect(form.getOutput(monitor, params._first)).toBeNull()
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      active: "_1",
      branches: {
        _1: null,
        _2: {
          _3: "name",
          _4: 18,
        },
      },
    })
  })

  it("returns null after making active invalid", ({ monitor }) => {
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

    expect(form.active.getOutput(monitor)).toBeNull()

    expect(form.getOutput(monitor)).toBeNull()
    expect(form.getOutput(monitor, params._first)).toBeNull()
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      active: null,
      branches: {
        _1: 1,
        _2: {
          _3: "name",
          _4: 18,
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
  )

  expect(form.active.getOutput(monitor)).toBe("_2")

  const concise = {
    kind: "_2",
    value: {
      _3: "name",
      _4: 18,
    },
  }

  expect(form.getOutput(monitor)).toStrictEqual(concise)
  expect(form.getOutput(monitor, params._first)).toStrictEqual(concise)
  expect(form.getOutput(monitor, params._second)).toStrictEqual({
    active: "_2",
    branches: {
      _1: null,
      _2: {
        _3: "name",
        _4: 18,
      },
      _5: null,
    },
  })
})

describe("stable output value", () => {
  it("subsequently selects equal output", ({ monitor }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_2", {
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

    expect(form.getOutput(monitor)).toBeInstanceOf(Object)
    expect(form.getOutput(monitor)).toBe(form.getOutput(monitor))
  })

  it("selects unequal output values when isOutputEqual is not specified", ({ monitor }) => {
    const form = ImpulseFormSwitch(ImpulseFormUnit<"_1">("_1"), {
      _1: ImpulseFormUnit(1, {
        transform: (size) => Array.from({ length: Math.max(1, size) }, (_, index) => index),
      }),
    })

    const output0 = form.getOutput(monitor)

    form.setInput({
      branches: {
        _1: 0,
      },
    })
    const output1 = form.getOutput(monitor)

    expect(output0).not.toBe(output1)
    expect(output0).toStrictEqual(output1)
  })

  it("selects equal output values when isOutputEqual is specified", ({ monitor }) => {
    const form = ImpulseFormSwitch(ImpulseFormUnit<"_1">("_1"), {
      _1: ImpulseFormUnit(1 as number, {
        isOutputEqual: isShallowArrayEqual,
        transform: (size) => Array.from({ length: Math.max(1, size) }, (_, index) => index),
      }),
    })

    const output0 = form.getOutput(monitor)

    form.setInput({
      branches: {
        _1: 0,
      },
    })
    const output1 = form.getOutput(monitor)

    expect(output0).toBe(output1)
    expect(output0).toStrictEqual(output1)
  })
})
