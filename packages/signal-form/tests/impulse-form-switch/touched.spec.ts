import z from "zod"

import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormShape,
  ImpulseFormSwitch,
  type ImpulseFormSwitchFlagSetter,
  type ImpulseFormSwitchOptions,
  ImpulseFormUnit,
} from "../../src"

describe("types", () => {
  const active = ImpulseFormUnit("", {
    schema: z.enum(["_1", "_2", "_5"]),
  })

  const branches = {
    _1: ImpulseFormUnit(true, {
      schema: z.boolean().transform((value): string => (value ? "ok" : "not ok")),
    }),
    _2: ImpulseFormShape({
      _3: ImpulseFormUnit("name"),
      _4: ImpulseFormUnit(18),
    }),
    _5: ImpulseFormUnit("excluded"),
  }

  const form = ImpulseFormSwitch(active, branches)

  type TouchedSchema =
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

  interface TouchedVerboseSchema {
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

  type TouchedSetter = Setter<
    | boolean
    | {
        readonly active?: Setter<boolean>
        readonly branch?: Setter<
          | boolean
          | {
              readonly kind: "_1"
              readonly value: Setter<boolean>
            }
          | {
              readonly kind: "_2"
              readonly value: Setter<
                | boolean
                | {
                    readonly _3?: Setter<boolean>
                    readonly _4?: Setter<boolean>
                  },
                [TouchedVerboseSchema["branches"]["_2"]]
              >
            }
          | {
              readonly kind: "_5"
              readonly value: Setter<boolean>
            },
          [
            | {
                readonly kind: "_1"
                readonly value: boolean
              }
            | {
                readonly kind: "_2"
                readonly value: {
                  readonly _3: boolean
                  readonly _4: boolean
                }
              }
            | {
                readonly kind: "_5"
                readonly value: boolean
              },
          ]
        >
      }
    | {
        readonly active?: Setter<boolean>
        readonly branches?: Setter<
          | boolean
          | {
              readonly _1?: Setter<boolean>
              readonly _2?: Setter<
                | boolean
                | {
                    readonly _3?: Setter<boolean>
                    readonly _4?: Setter<boolean>
                  },
                [TouchedVerboseSchema["branches"]["_2"]]
              >
              readonly _5?: Setter<boolean>
            },
          [TouchedVerboseSchema["branches"]]
        >
      },
    [TouchedVerboseSchema]
  >

  it("matches schema type for isTouched(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isTouched(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(form.isTouched(scope, params._first)).toEqualTypeOf<TouchedSchema>()

    expectTypeOf(form.isTouched(scope, params._second)).toEqualTypeOf<TouchedVerboseSchema>()
  })

  it("matches setter type for setTouched(setter)", () => {
    expectTypeOf(form.setTouched).toEqualTypeOf<(setter: TouchedSetter) => void>()
  })

  it("allows passing concise value to setTouched", ({ scope }) => {
    const touched0 = form.isTouched(scope)
    const touched0Concise = form.isTouched(scope, params._first)
    const touched0Verbose = form.isTouched(scope, params._second)

    form.setTouched(touched0Concise)

    expect(form.isTouched(scope)).toStrictEqual(touched0)
    expect(form.isTouched(scope, params._first)).toStrictEqual(touched0Concise)
    expect(form.isTouched(scope, params._second)).toStrictEqual(touched0Verbose)
  })

  it("allows passing verbose value to setTouched", ({ scope }) => {
    const touched0 = form.isTouched(scope)
    const touched0Concise = form.isTouched(scope, params._first)
    const touched0Verbose = form.isTouched(scope, params._second)

    form.setTouched(touched0Verbose)

    expect(form.isTouched(scope)).toStrictEqual(touched0)
    expect(form.isTouched(scope, params._first)).toStrictEqual(touched0Concise)
    expect(form.isTouched(scope, params._second)).toStrictEqual(touched0Verbose)
  })

  it("allows passing verbose value in setTouched callback", ({ scope }) => {
    const touched0 = form.isTouched(scope)
    const touched0Concise = form.isTouched(scope, params._first)
    const touched0Verbose = form.isTouched(scope, params._second)

    form.setTouched((verbose) => verbose)

    expect(form.isTouched(scope)).toStrictEqual(touched0)
    expect(form.isTouched(scope, params._first)).toStrictEqual(touched0Concise)
    expect(form.isTouched(scope, params._second)).toStrictEqual(touched0Verbose)
  })

  it("ensures ImpulseFormSwitchOptions.touched type", () => {
    const form = ImpulseFormSwitch(active, branches, {
      touched: {
        // @ts-expect-error should be boolean
        active: "",
        branches: {
          // @ts-expect-error should be boolean
          _1: 0,
          _2: {
            // @ts-expect-error should be boolean
            _3: [],
            // @ts-expect-error should be boolean
            _4: "",
          },
        },
      },
    })

    expectTypeOf(form).not.toBeUndefined()
  })

  describe("nested", () => {
    const active = ImpulseFormUnit("", {
      schema: z.enum(["_6", "_7"]),
    })

    const branches = {
      _6: form,
      _7: ImpulseFormUnit("0"),
    }

    const parent = ImpulseFormSwitch(active, branches)

    type ParentTouchedSchema =
      | boolean
      | {
          readonly active: boolean
          readonly branch:
            | boolean
            | {
                readonly kind: "_6"
                readonly value: TouchedSchema
              }
            | {
                readonly kind: "_7"
                readonly value: boolean
              }
        }

    interface ParentTouchedVerboseSchema {
      readonly active: boolean
      readonly branches: {
        readonly _6: TouchedVerboseSchema
        readonly _7: boolean
      }
    }

    type ParentTouchedSetter = Setter<
      | boolean
      | {
          readonly active?: Setter<boolean>
          readonly branch?: Setter<
            | boolean
            | {
                readonly kind: "_6"
                readonly value: TouchedSetter
              }
            | {
                readonly kind: "_7"
                readonly value: Setter<boolean>
              },
            [
              | {
                  readonly kind: "_6"
                  readonly value: TouchedVerboseSchema
                }
              | {
                  readonly kind: "_7"
                  readonly value: boolean
                },
            ]
          >
        }
      | {
          readonly active?: Setter<boolean>
          readonly branches?: Setter<
            | boolean
            | {
                readonly _6?: TouchedSetter
                readonly _7?: Setter<boolean>
              },
            [ParentTouchedVerboseSchema["branches"]]
          >
        },
      [ParentTouchedVerboseSchema]
    >

    it("matches schema type for isTouched(scope, select?)", ({ scope }) => {
      expectTypeOf(parent.isTouched(scope)).toEqualTypeOf<boolean>()

      expectTypeOf(parent.isTouched(scope, params._first)).toEqualTypeOf<ParentTouchedSchema>()

      expectTypeOf(
        parent.isTouched(scope, params._second),
      ).toEqualTypeOf<ParentTouchedVerboseSchema>()
    })

    it("matches setter type for setTouched(setter)", () => {
      expectTypeOf(parent.setTouched).toEqualTypeOf<(setter: ParentTouchedSetter) => void>()
    })

    it("allows passing concise value to setTouched", ({ scope }) => {
      const concise = parent.isTouched(scope, params._first)

      parent.setTouched(concise)

      expect(parent.isTouched(scope, params._first)).toStrictEqual(concise)
    })

    it("allows passing verbose value to setTouched", ({ scope }) => {
      const verbose = parent.isTouched(scope, params._second)

      parent.setTouched(verbose)

      expect(parent.isTouched(scope, params._second)).toStrictEqual(verbose)
    })

    it("ensures ImpulseFormSwitchOptions.touched type", () => {
      const parent = ImpulseFormSwitch(active, branches, {
        touched: {
          // @ts-expect-error should be boolean
          active: 1,
          branches: {
            // @ts-expect-error should be boolean
            _6: 0,
          },
        },
      })

      expectTypeOf(parent).not.toBeUndefined()
    })
  })
})

describe.each([true, false])("when touched=%s", (touched) => {
  const differentTouched = !touched

  describe("when defining top-level concise ImpulseFormSwitchOptions.touched", () => {
    describe("when active is valid", () => {
      it("overrides active branch's touched", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("_2", {
            touched: true,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              touched: false,
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  touched: true,
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            touched,
          },
        )

        expect(form.isTouched(scope)).toBe(touched)
        expect(form.isTouched(scope, params._first)).toBe(touched)
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          active: touched,
          branches: {
            _1: false,
            _2: {
              active: touched,
              branches: {
                _3: touched,
                _4: false,
              },
            },
          },
        })
      })
    })

    describe("when active is invalid", () => {
      it("overrides only the active's touched", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("", {
            touched: true,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              touched: false,
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  touched: true,
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            touched,
          },
        )

        expect(form.isTouched(scope)).toBe(touched)
        expect(form.isTouched(scope, params._first)).toBe(touched)
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          active: touched,
          branches: {
            _1: false,
            _2: {
              active: false,
              branches: {
                _3: true,
                _4: false,
              },
            },
          },
        })
      })
    })
  })

  describe("when defining ImpulseFormSwitchOptions.touched.active", () => {
    describe("when active is invalid", () => {
      it("overrides only the active's touched", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("", {
            touched: true,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              touched: false,
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  touched: true,
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            touched: {
              active: touched,
            },
          },
        )

        expect(form.isTouched(scope)).toBe(touched)
        expect(form.isTouched(scope, params._first)).toBe(touched)
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          active: touched,
          branches: {
            _1: false,
            _2: {
              active: false,
              branches: {
                _3: true,
                _4: false,
              },
            },
          },
        })
      })
    })

    describe("when active is valid", () => {
      it("overrides only the active's touched", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("_2", {
            touched: true,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              touched: false,
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                touched: true,
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
                  touched: false,
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            touched: {
              active: touched,
            },
          },
        )

        expect(form.isTouched(scope)).toBe(true)
        expect(form.isTouched(scope, params._first)).toStrictEqual({
          active: touched,
          branch: {
            kind: "_2",
            value: {
              active: true,
              branch: false,
            },
          },
        })
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          active: touched,
          branches: {
            _1: false,
            _2: {
              active: true,
              branches: {
                _3: false,
                _4: false,
              },
            },
          },
        })
      })
    })
  })

  describe("when defining concise ImpulseFormSwitchOptions.touched.branch", () => {
    describe("when active is invalid", () => {
      it("does not change anything", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("", {
            touched: differentTouched,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              touched: false,
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                touched: true,
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  touched: true,
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            touched: {
              branch: touched,
            },
          },
        )

        expect(form.isTouched(scope)).toBe(differentTouched)
        expect(form.isTouched(scope, params._first)).toBe(differentTouched)
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          active: differentTouched,
          branches: {
            _1: false,
            _2: {
              active: true,
              branches: {
                _3: true,
                _4: false,
              },
            },
          },
        })
      })
    })

    describe("when active is valid", () => {
      it("overrides only the active branch touched", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("_2", {
            touched: differentTouched,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              touched: false,
              schema: z.number(),
            }),
            _2: ImpulseFormShape({
              _3: ImpulseFormUnit("0", {
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                touched: true,
                schema: z.number(),
              }),
            }),
          },
          {
            touched: {
              branch: touched,
            },
          },
        )

        expect(form.isTouched(scope)).toBe(true)
        expect(form.isTouched(scope, params._first)).toStrictEqual({
          active: differentTouched,
          branch: touched,
        })
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          active: differentTouched,
          branches: {
            _1: false,
            _2: {
              _3: touched,
              _4: touched,
            },
          },
        })
      })
    })
  })

  describe("when defining detailed ImpulseFormSwitchOptions.touched.branch", () => {
    describe("when active is invalid", () => {
      it("overrides only the target branch touched", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("", {
            touched: differentTouched,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              touched: true,
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  touched: true,
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
                  touched: false,
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            touched: {
              branch: {
                kind: "_1",
                value: touched,
              },
            },
          },
        )

        expect(form.isTouched(scope)).toBe(differentTouched)
        expect(form.isTouched(scope, params._first)).toBe(differentTouched)
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          active: differentTouched,
          branches: {
            _1: touched,
            _2: {
              active: false,
              branches: {
                _3: true,
                _4: false,
              },
            },
          },
        })
      })
    })

    describe("when active is valid", () => {
      it("overrides only the target inactive branch touched", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("_2", {
            touched: false,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              touched: true,
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  touched: true,
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
                  touched: false,
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            touched: {
              branch: {
                kind: "_1",
                value: touched,
              },
            },
          },
        )

        expect(form.isTouched(scope)).toBe(true)
        expect(form.isTouched(scope, params._first)).toStrictEqual({
          active: false,
          branch: {
            kind: "_2",
            value: {
              active: false,
              branch: true,
            },
          },
        })
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          active: false,
          branches: {
            _1: touched,
            _2: {
              active: false,
              branches: {
                _3: true,
                _4: false,
              },
            },
          },
        })
      })

      it("overrides only the target active branch touched", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("_2", {
            touched: differentTouched,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              touched: true,
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  touched: true,
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
                  touched: false,
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            touched: {
              branch: {
                kind: "_2",
                value: touched,
              },
            },
          },
        )

        expect(form.isTouched(scope)).toBe(true)
        expect(form.isTouched(scope, params._first)).toStrictEqual({
          active: differentTouched,
          branch: touched,
        })
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          active: differentTouched,
          branches: {
            _1: true,
            _2: {
              active: touched,
              branches: {
                _3: touched,
                _4: false,
              },
            },
          },
        })
      })

      it("overrides nested switch", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("_2", {
            touched: true,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              touched: false,
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  touched: true,
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
                  touched: false,
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            touched: {
              branch: {
                kind: "_2",
                value: {
                  branch: {
                    kind: "_4",
                    value: touched,
                  },
                },
              },
            },
          },
        )

        expect(form.isTouched(scope)).toBe(true)
        expect(form.isTouched(scope, params._first)).toStrictEqual({
          active: true,
          branch: {
            kind: "_2",
            value: {
              active: false,
              branch: true,
            },
          },
        })
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          active: true,
          branches: {
            _1: false,
            _2: {
              active: false,
              branches: {
                _3: true,
                _4: touched,
              },
            },
          },
        })
      })
    })
  })

  describe("when defining all active+branch+branches ImpulseFormSwitchOptions.touched", () => {
    it("branch takes over branches", ({ scope }) => {
      const form = ImpulseFormSwitch(
        ImpulseFormUnit("_2", {
          touched: true,
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            touched: true,
            schema: z.number(),
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                touched: true,
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                touched: false,
                schema: z.number(),
              }),
            },
          ),
        },
        {
          touched: {
            active: differentTouched,
            branch: {
              kind: "_2",
              value: touched,
            },
            branches: {
              _1: differentTouched,
              _2: differentTouched,
            },
          },
        },
      )

      expect(form.isTouched(scope)).toBe(true)
      expect(form.isTouched(scope, params._first)).toStrictEqual({
        active: differentTouched,
        branch: touched,
      })
      expect(form.isTouched(scope, params._second)).toStrictEqual({
        active: differentTouched,
        branches: {
          _1: differentTouched,
          _2: {
            active: touched,
            branches: {
              _3: touched,
              _4: false,
            },
          },
        },
      })
    })
  })

  it("returns the boolean as concise result when everything has the same boolean", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("", {
        touched,
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(0, { touched, schema: z.number() }),
        _2: ImpulseFormSwitch(
          ImpulseFormUnit("", {
            touched,
            schema: z.enum(["_3", "_4"]),
          }),
          {
            _3: ImpulseFormUnit("0", {
              touched,
              schema: z.string(),
            }),
            _4: ImpulseFormUnit(1, { touched, schema: z.number() }),
          },
        ),
      },
    )

    expect(form.isTouched(scope)).toBe(touched)
    expect(form.isTouched(scope, params._first)).toBe(touched)
    expect(form.isTouched(scope, params._second)).toStrictEqual({
      active: touched,
      branches: {
        _1: touched,
        _2: {
          active: touched,
          branches: {
            _3: touched,
            _4: touched,
          },
        },
      },
    })
  })
})

describe("stable touched value", () => {
  it("subsequently selects equal touched", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_2", {
        touched: true,
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(0, {
          touched: false,
          schema: z.number(),
        }),
        _2: ImpulseFormSwitch(
          ImpulseFormUnit("_3", {
            schema: z.enum(["_3", "_4"]),
          }),
          {
            _3: ImpulseFormUnit("0", {
              touched: true,
              schema: z.string(),
            }),
            _4: ImpulseFormUnit(1, {
              touched: false,
              schema: z.number(),
            }),
          },
        ),
      },
    )

    expect(form.isTouched(scope)).toBeTypeOf("boolean")
    expect(form.isTouched(scope)).toBe(form.isTouched(scope))

    expect(form.isTouched(scope, params._first)).toBeInstanceOf(Object)
    expect(form.isTouched(scope, params._first)).toBe(form.isTouched(scope, params._first))

    expect(form.isTouched(scope, params._second)).toBeInstanceOf(Object)
    expect(form.isTouched(scope, params._second)).toBe(form.isTouched(scope, params._second))
  })
})

describe("using recursive setter", () => {
  const active = ImpulseFormUnit("_2", {
    touched: true,
    schema: z.enum(["_1", "_2"]),
  })

  const branches = {
    _1: ImpulseFormUnit(0, {
      touched: false,
      schema: z.number(),
    }),
    _2: ImpulseFormSwitch(
      ImpulseFormUnit("_3", {
        schema: z.enum(["_3", "_4"]),
      }),
      {
        _3: ImpulseFormUnit("0", {
          touched: true,
          schema: z.string(),
        }),
        _4: ImpulseFormUnit(1, {
          touched: false,
          schema: z.number(),
        }),
      },
    ),
  }

  function setup(options?: ImpulseFormSwitchOptions<typeof active, typeof branches>) {
    return ImpulseFormSwitch(active, branches, options)
  }

  describe.each<
    [
      string,
      (
        input: ImpulseFormSwitchFlagSetter<typeof active, typeof branches>,
      ) => ImpulseFormSwitch<typeof active, typeof branches>,
    ]
  >([
    ["ImpulseFormSwitchOptions.touched", (touched) => setup({ touched })],

    [
      "ImpulseFormSwitch.setTouched",
      (setter) => {
        const form = setup()

        form.setTouched(setter)

        return form
      },
    ],
  ])("in %s", (_, setup) => {
    it("passes initial and input recursively to all setters", ({ scope }) => {
      expect.assertions(20)

      const form = setup(($) => {
        expectTypeOf($).toEqualTypeOf<{
          readonly active: boolean
          readonly branches: {
            readonly _1: boolean
            readonly _2: {
              readonly active: boolean
              readonly branches: {
                readonly _3: boolean
                readonly _4: boolean
              }
            }
          }
        }>()

        expect($).toStrictEqual({
          active: true,
          branches: {
            _1: false,
            _2: {
              active: false,
              branches: {
                _3: true,
                _4: false,
              },
            },
          },
        })

        return {
          active: ($_active) => {
            expectTypeOf($_active).toEqualTypeOf<boolean>()
            expect($_active).toBe(true)

            return false
          },

          branches: ($_branches) => {
            expectTypeOf($_branches).toEqualTypeOf<{
              readonly _1: boolean
              readonly _2: {
                readonly active: boolean
                readonly branches: {
                  readonly _3: boolean
                  readonly _4: boolean
                }
              }
            }>()

            expect($_branches).toStrictEqual({
              _1: false,
              _2: {
                active: false,
                branches: {
                  _3: true,
                  _4: false,
                },
              },
            })

            return {
              _1: ($_branches1) => {
                expectTypeOf($_branches1).toEqualTypeOf<boolean>()
                expect($_branches1).toBe(false)

                return true
              },

              _2: ($_branches2) => {
                expectTypeOf($_branches2).toEqualTypeOf<{
                  readonly active: boolean
                  readonly branches: {
                    readonly _3: boolean
                    readonly _4: boolean
                  }
                }>()

                expect($_branches2).toStrictEqual({
                  active: false,
                  branches: {
                    _3: true,
                    _4: false,
                  },
                })

                return {
                  active: ($_branches2Active) => {
                    expectTypeOf($_branches2Active).toEqualTypeOf<boolean>()
                    expect($_branches2Active).toBe(false)

                    return true
                  },

                  branches: ($_branches2Branches) => {
                    expectTypeOf($_branches2Branches).toEqualTypeOf<{
                      readonly _3: boolean
                      readonly _4: boolean
                    }>()

                    expect($_branches2Branches).toStrictEqual({
                      _3: true,
                      _4: false,
                    })

                    return {
                      _3: ($_branches2Branches3) => {
                        expectTypeOf($_branches2Branches3).toEqualTypeOf<boolean>()
                        expect($_branches2Branches3).toBe(true)

                        return false
                      },
                      _4: ($_branches2Branches4) => {
                        expectTypeOf($_branches2Branches4).toEqualTypeOf<boolean>()
                        expect($_branches2Branches4).toBe(false)

                        return true
                      },
                    }
                  },
                }
              },
            }
          },

          branch: ($_branch) => {
            expectTypeOf($_branch).toEqualTypeOf<
              | {
                  readonly kind: "_1"
                  readonly value: boolean
                }
              | {
                  readonly kind: "_2"
                  readonly value: {
                    readonly active: boolean
                    readonly branches: {
                      readonly _3: boolean
                      readonly _4: boolean
                    }
                  }
                }
            >()

            // the value is set in $_branches_2 ^
            expect($_branch).toStrictEqual({
              kind: "_2",
              value: {
                active: true,
                branches: {
                  _3: false,
                  _4: true,
                },
              },
            })

            return {
              kind: "_2",
              value: ($_branch2) => {
                expectTypeOf($_branch2).toEqualTypeOf<{
                  readonly active: boolean
                  readonly branches: {
                    readonly _3: boolean
                    readonly _4: boolean
                  }
                }>()

                // the value is set in $_branches_2 ^
                expect($_branch2).toStrictEqual({
                  active: true,
                  branches: {
                    _3: false,
                    _4: true,
                  },
                })

                return {
                  active: ($_branch2Active) => {
                    expectTypeOf($_branch2Active).toEqualTypeOf<boolean>()
                    expect($_branch2Active).toBe(true)

                    return false
                  },

                  branches: ($_branch2Branches) => {
                    expectTypeOf($_branch2Branches).toEqualTypeOf<{
                      readonly _3: boolean
                      readonly _4: boolean
                    }>()

                    expect($_branch2Branches).toStrictEqual({
                      _3: false,
                      _4: true,
                    })

                    return {
                      _3: ($_branch2Branches3) => {
                        expectTypeOf($_branch2Branches3).toEqualTypeOf<boolean>()
                        expect($_branch2Branches3).toBe(false)

                        return true
                      },
                      _4: ($_branch2Branches4) => {
                        expectTypeOf($_branch2Branches4).toEqualTypeOf<boolean>()
                        expect($_branch2Branches4).toBe(true)

                        return false
                      },
                    }
                  },

                  branch: ($_branch2Branch) => {
                    expectTypeOf($_branch2Branch).toEqualTypeOf<
                      | {
                          readonly kind: "_3"
                          readonly value: boolean
                        }
                      | {
                          readonly kind: "_4"
                          readonly value: boolean
                        }
                    >()
                    // the value is set in $_branch_2_branches_3 ^
                    expect($_branch2Branch).toStrictEqual({
                      kind: "_3",
                      value: true,
                    })

                    return {
                      kind: "_4",
                      value: ($_branch2Branch4) => {
                        expectTypeOf($_branch2Branch4).toEqualTypeOf<boolean>()
                        // the value is set in $_branch_2_branches ^
                        expect($_branch2Branch4).toBe(false)

                        return true
                      },
                    }
                  },
                }
              },
            }
          },
        }
      })

      expect(form.isTouched(scope)).toStrictEqual(true)
      expect(form.isTouched(scope, params._first)).toStrictEqual({
        active: false,
        branch: {
          kind: "_2",
          value: {
            active: false,
            branch: true,
          },
        },
      })
      expect(form.isTouched(scope, params._second)).toStrictEqual({
        active: false,
        branches: {
          _1: true,
          _2: {
            active: false,
            branches: {
              _3: true,
              _4: true,
            },
          },
        },
      })
    })
  })
})
