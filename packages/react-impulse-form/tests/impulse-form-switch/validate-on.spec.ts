import z from "zod"

import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormShape,
  ImpulseFormSwitch,
  ImpulseFormUnit,
  type ValidateStrategy,
} from "../../src"

describe("types", () => {
  const active = ImpulseFormUnit("", {
    schema: z.enum(["_1", "_2", "_5"]),
  })

  const branches = {
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
  }

  const form = ImpulseFormSwitch(active, branches)

  type ValidateOnSchema =
    | ValidateStrategy
    | {
        readonly active: ValidateStrategy
        readonly branch:
          | {
              readonly kind: "_1"
              readonly value: ValidateStrategy
            }
          | {
              readonly kind: "_2"
              readonly value:
                | ValidateStrategy
                | {
                    readonly _3: ValidateStrategy
                    readonly _4: ValidateStrategy
                  }
            }
          | {
              readonly kind: "_5"
              readonly value: ValidateStrategy
            }
      }

  interface ValidateOnVerboseSchema {
    readonly active: ValidateStrategy
    readonly branches: {
      readonly _1: ValidateStrategy
      readonly _2: {
        readonly _3: ValidateStrategy
        readonly _4: ValidateStrategy
      }
      readonly _5: ValidateStrategy
    }
  }

  type ValidateOnSetter = Setter<
    | ValidateStrategy
    | {
        readonly active?: Setter<ValidateStrategy>
        readonly branch?: Setter<
          | ValidateStrategy
          | {
              readonly kind: "_1"
              readonly value: Setter<ValidateStrategy>
            }
          | {
              readonly kind: "_2"
              readonly value: Setter<
                | ValidateStrategy
                | {
                    readonly _3?: Setter<ValidateStrategy>
                    readonly _4?: Setter<ValidateStrategy>
                  },
                [ValidateOnVerboseSchema["branches"]["_2"]]
              >
            }
          | {
              readonly kind: "_5"
              readonly value: Setter<ValidateStrategy>
            },
          [
            | {
                readonly kind: "_1"
                readonly value: ValidateStrategy
              }
            | {
                readonly kind: "_2"
                readonly value: {
                  readonly _3: ValidateStrategy
                  readonly _4: ValidateStrategy
                }
              }
            | {
                readonly kind: "_5"
                readonly value: ValidateStrategy
              },
          ]
        >
      }
    | {
        readonly active?: Setter<ValidateStrategy>
        readonly branches?: Setter<
          | ValidateStrategy
          | {
              readonly _1?: Setter<ValidateStrategy>
              readonly _2?: Setter<
                | ValidateStrategy
                | {
                    readonly _3?: Setter<ValidateStrategy>
                    readonly _4?: Setter<ValidateStrategy>
                  },
                [ValidateOnVerboseSchema["branches"]["_2"]]
              >
              readonly _5?: Setter<ValidateStrategy>
            },
          [ValidateOnVerboseSchema["branches"]]
        >
      },
    [ValidateOnVerboseSchema]
  >

  it("matches schema type for getValidateOn(scope, select?)", ({ scope }) => {
    expectTypeOf(form.getValidateOn(scope)).toEqualTypeOf<ValidateOnSchema>()

    expectTypeOf(
      form.getValidateOn(scope, params._first),
    ).toEqualTypeOf<ValidateOnSchema>()

    expectTypeOf(
      form.getValidateOn(scope, params._second),
    ).toEqualTypeOf<ValidateOnVerboseSchema>()
  })

  it("matches setter type for setValidateOn(setter)", () => {
    expectTypeOf(form.setValidateOn).toEqualTypeOf<
      (setter: ValidateOnSetter) => void
    >()
  })

  it("allows passing concise value to setValidateOn", ({ scope }) => {
    const concise = form.getValidateOn(scope, params._first)

    form.setValidateOn(concise)

    expect(form.getValidateOn(scope, params._first)).toStrictEqual(concise)
  })

  it("allows passing verbose value to setValidateOn", ({ scope }) => {
    const verbose = form.getValidateOn(scope, params._second)

    form.setValidateOn(verbose)

    expect(form.getValidateOn(scope, params._second)).toStrictEqual(verbose)
  })

  it("ensures ImpulseFormSwitchOptions.validateOn type", () => {
    const form = ImpulseFormSwitch(active, branches, {
      validateOn: {
        active: 1,
        branches: {
          _1: 0,
          _2: {
            _3: false,
            _4: "",
          },
        },
      },
    })

    expectTypeOf(form).not.toBeUndefined()
  })

  describe("nested", () => {
    const active = ImpulseFormUnit("", {
      schema: z.enum(["_1", "_2"]),
    })

    const branches = {
      _1: form,
      _2: ImpulseFormUnit("0"),
    }

    const parent = ImpulseFormSwitch(active, branches)

    type ParentValidateOnSchema =
      | ValidateStrategy
      | {
          readonly active: ValidateStrategy
          readonly branch:
            | {
                readonly kind: "_1"
                readonly value: ValidateOnSchema
              }
            | {
                readonly kind: "_2"
                readonly value: ValidateStrategy
              }
        }

    interface ParentValidateOnVerboseSchema {
      readonly active: ValidateStrategy
      readonly branches: {
        readonly _1: ValidateOnVerboseSchema
        readonly _2: ValidateStrategy
      }
    }

    type ParentValidateOnSetter = Setter<
      | ValidateStrategy
      | {
          readonly active?: Setter<ValidateStrategy>
          readonly branch?: Setter<ValidateStrategy, []>
        }
      | {
          readonly active?: Setter<ValidateStrategy>
          readonly branches?: {
            readonly _1?: ValidateOnSetter
            readonly _2?: Setter<ValidateStrategy>
          }
        },
      [ParentValidateOnVerboseSchema]
    >

    it("matches schema type for getValidateOn(scope, select?)", ({ scope }) => {
      expectTypeOf(
        parent.getValidateOn(scope),
      ).toEqualTypeOf<ParentValidateOnSchema>()

      expectTypeOf(
        parent.getValidateOn(scope, params._first),
      ).toEqualTypeOf<ParentValidateOnSchema>()

      expectTypeOf(
        parent.getValidateOn(scope, params._second),
      ).toEqualTypeOf<ParentValidateOnVerboseSchema>()
    })

    it("matches setter type for setValidateOn(setter)", () => {
      expectTypeOf(parent.setValidateOn).toEqualTypeOf<
        (setter: ParentValidateOnSetter) => void
      >()
    })

    it("allows passing concise value to setValidateOn", ({ scope }) => {
      const concise = parent.getValidateOn(scope, params._first)

      parent.setValidateOn(concise)

      expect(parent.getValidateOn(scope, params._first)).toStrictEqual(concise)
    })

    it("allows passing verbose value to setValidateOn", ({ scope }) => {
      const verbose = parent.getValidateOn(scope, params._second)

      parent.setValidateOn(verbose)

      expect(parent.getValidateOn(scope, params._second)).toStrictEqual(verbose)
    })

    it("ensures ImpulseFormSwitchOptions.validateOn type", () => {
      const parent = ImpulseFormSwitch(active, branches, {
        validateOn: {
          active: 1,
          branches: {
            _1: 0,
            _2: {
              _3: false,
              _4: "",
            },
          },
        },
      })

      expectTypeOf(parent).not.toBeUndefined()
    })
  })
})

describe("when branch is initially invalid", () => {
  it.skip("returns false for initially invalid active", ({ scope }) => {
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

  it.skip("returns falsy for initially valid active", ({ scope }) => {
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

  it.skip("returns true after switching to valid branch", ({ scope }) => {
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
  it.skip("returns false for initially invalid active", ({ scope }) => {
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

  it.skip("returns true for a initially valid active", ({ scope }) => {
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

  it.skip("returns falsy after switching to invalid branch", ({ scope }) => {
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

  it.skip("returns false after making active invalid", ({ scope }) => {
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

it.skip("ignores invalid inactive branches", ({ scope }) => {
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
