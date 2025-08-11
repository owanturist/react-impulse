import z from "zod"

import { params } from "~/tools/params"

import {
  ImpulseFormShape,
  ImpulseFormSwitch,
  type ImpulseFormSwitchBranch,
  ImpulseFormUnit,
} from "../../src"

describe("types", () => {
  const form = ImpulseFormSwitch(
    ImpulseFormUnit("", {
      schema: z.enum(["_1", "_2"]),
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

  type OutputSchema =
    | ImpulseFormSwitchBranch<"_1", string>
    | ImpulseFormSwitchBranch<
        "_2",
        {
          readonly _3: string
          readonly _4: number
        }
      >

  interface OutputVerboseSchema {
    readonly active: null | "_1" | "_2"
    readonly branches: {
      readonly _1: null | string
      readonly _2: {
        readonly _3: null | string
        readonly _4: null | number
      }
      readonly _5: null | string
    }
  }

  it("matches schema type for getOutput(scope, select?)", ({ scope }) => {
    expectTypeOf(form.getOutput(scope)).toEqualTypeOf<null | OutputSchema>()

    expectTypeOf(
      form.getOutput(scope, params._first),
    ).toEqualTypeOf<null | OutputSchema>()

    expectTypeOf(
      form.getOutput(scope, params._second),
    ).toEqualTypeOf<OutputVerboseSchema>()
  })

  describe("nested", () => {
    const parent = ImpulseFormSwitch(
      ImpulseFormUnit("", {
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: form,
        _2: ImpulseFormUnit("0"),
      },
    )

    type ParentOutputSchema =
      | ImpulseFormSwitchBranch<"_1", OutputSchema>
      | ImpulseFormSwitchBranch<"_2", string>

    interface ParentOutputVerboseSchema {
      readonly active: null | "_1" | "_2"
      readonly branches: {
        readonly _1: OutputVerboseSchema
        readonly _2: null | string
      }
    }

    it("matches schema type for getOutput(scope, select?)", ({ scope }) => {
      expectTypeOf(
        parent.getOutput(scope),
      ).toEqualTypeOf<null | ParentOutputSchema>()

      expectTypeOf(
        parent.getOutput(scope, params._first),
      ).toEqualTypeOf<null | ParentOutputSchema>()

      expectTypeOf(
        parent.getOutput(scope, params._second),
      ).toEqualTypeOf<ParentOutputVerboseSchema>()
    })
  })
})

describe("when branch is initially invalid", () => {
  it("returns null for initially invalid active", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("", {
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
        _5: ImpulseFormUnit(false),
      },
    )

    expect(form.getOutput(scope)).toBeNull()
    expect(form.getOutput(scope, params._first)).toBeNull()
    expect(form.getOutput(scope, params._second)).toStrictEqual({
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

  it("returns null for initially valid active", ({ scope }) => {
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
        _5: ImpulseFormUnit(false),
      },
    )

    expect(form.getOutput(scope)).toBeNull()
    expect(form.getOutput(scope, params._first)).toBeNull()
    expect(form.getOutput(scope, params._second)).toStrictEqual({
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

  it("returns output after switching to valid branch", ({ scope }) => {
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

    expect(form.active.getOutput(scope)).toBe("_2")
    expect(form.branches._2.getOutput(scope)).toStrictEqual({
      _3: "name",
      _4: 18,
    })
    expect(form.getOutput(scope)).toStrictEqual({
      kind: "_2",
      value: {
        _3: "name",
        _4: 18,
      },
    })
    expect(form.getOutput(scope, params._first)).toStrictEqual({
      kind: "_2",
      value: {
        _3: "name",
        _4: 18,
      },
    })
    expect(form.getOutput(scope, params._second)).toStrictEqual({
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

it("returns null after switching from valid to invalid branch", ({ scope }) => {
  const form = ImpulseFormSwitch(ImpulseFormUnit("_2"), {
    _1: ImpulseFormUnit(0, {
      schema: z.number().min(1),
    }),
    _2: ImpulseFormShape({
      _3: ImpulseFormUnit("name"),
      _4: ImpulseFormUnit(18),
    }),
  })

  form.active.setInput("_1")

  expect(form.getOutput(scope)).toBeNull()
  expect(form.getOutput(scope, params._first)).toBeNull()
  expect(form.getOutput(scope, params._second)).toStrictEqual({
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

it("returns output for initially valid branch", ({ scope }) => {
  const form = ImpulseFormSwitch(ImpulseFormUnit("_1"), {
    _1: ImpulseFormUnit(1, {
      schema: z.number().min(1),
    }),
    _2: ImpulseFormShape({
      _3: ImpulseFormUnit("name"),
      _4: ImpulseFormUnit(18),
    }),
  })

  expect(form.active.getOutput(scope)).toBe("_1")

  const concise = {
    kind: "_1",
    value: 1,
  }

  expect(form.getOutput(scope)).toStrictEqual(concise)
  expect(form.getOutput(scope, params._first)).toStrictEqual(concise)
  expect(form.getOutput(scope, params._second)).toStrictEqual({
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

it("ignores invalid inactive branches", ({ scope }) => {
  const form = ImpulseFormSwitch(ImpulseFormUnit("_2"), {
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
  })

  expect(form.active.getOutput(scope)).toBe("_2")

  const concise = {
    kind: "_2",
    value: {
      _3: "name",
      _4: 18,
    },
  }

  expect(form.getOutput(scope)).toStrictEqual(concise)
  expect(form.getOutput(scope, params._first)).toStrictEqual(concise)
  expect(form.getOutput(scope, params._second)).toStrictEqual({
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
