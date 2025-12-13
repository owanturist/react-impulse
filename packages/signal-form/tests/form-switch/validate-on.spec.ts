import z from "zod"

import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  FormShape,
  FormSwitch,
  type FormSwitchOptions,
  type FormSwitchValidateOnSetter,
  FormUnit,
  type ValidateStrategy,
} from "../../src"

describe("types", () => {
  const active = FormUnit("", {
    schema: z.enum(["_1", "_2", "_5"]),
  })

  const branches = {
    _1: FormUnit(true, {
      schema: z.boolean().transform((value): string => (value ? "ok" : "not ok")),
    }),
    _2: FormShape({
      _3: FormUnit("name"),
      _4: FormUnit(18),
    }),
    _5: FormUnit("excluded"),
  }

  const form = FormSwitch(active, branches)

  type ValidateOnSchema =
    | ValidateStrategy
    | {
        readonly active: ValidateStrategy
        readonly branch:
          | ValidateStrategy
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

  it("matches schema type for getValidateOn(monitor, select?)", ({ monitor }) => {
    expectTypeOf(form.getValidateOn(monitor)).toEqualTypeOf<ValidateOnSchema>()

    expectTypeOf(form.getValidateOn(monitor, params._first)).toEqualTypeOf<ValidateOnSchema>()

    expectTypeOf(
      form.getValidateOn(monitor, params._second),
    ).toEqualTypeOf<ValidateOnVerboseSchema>()
  })

  it("matches setter type for setValidateOn(setter)", () => {
    expectTypeOf(form.setValidateOn).toEqualTypeOf<(setter: ValidateOnSetter) => void>()
  })

  it("allows passing concise value to setValidateOn", ({ monitor }) => {
    const validateOn0 = form.getValidateOn(monitor)
    const validateOn0Concise = form.getValidateOn(monitor, params._first)
    const validateOn0Verbose = form.getValidateOn(monitor, params._second)

    form.setValidateOn(validateOn0Concise)

    expect(form.getValidateOn(monitor)).toStrictEqual(validateOn0)
    expect(form.getValidateOn(monitor, params._first)).toStrictEqual(validateOn0Concise)
    expect(form.getValidateOn(monitor, params._second)).toStrictEqual(validateOn0Verbose)
  })

  it("allows passing verbose value to setValidateOn", ({ monitor }) => {
    const validateOn0 = form.getValidateOn(monitor)
    const validateOn0Concise = form.getValidateOn(monitor, params._first)
    const validateOn0Verbose = form.getValidateOn(monitor, params._second)

    form.setValidateOn(validateOn0Verbose)

    expect(form.getValidateOn(monitor)).toStrictEqual(validateOn0)
    expect(form.getValidateOn(monitor, params._first)).toStrictEqual(validateOn0Concise)
    expect(form.getValidateOn(monitor, params._second)).toStrictEqual(validateOn0Verbose)
  })

  it("allows passing verbose value in setValidateOn callback", ({ monitor }) => {
    const validateOn0 = form.getValidateOn(monitor)
    const validateOn0Concise = form.getValidateOn(monitor, params._first)
    const validateOn0Verbose = form.getValidateOn(monitor, params._second)

    form.setValidateOn((verbose) => verbose)

    expect(form.getValidateOn(monitor)).toStrictEqual(validateOn0)
    expect(form.getValidateOn(monitor, params._first)).toStrictEqual(validateOn0Concise)
    expect(form.getValidateOn(monitor, params._second)).toStrictEqual(validateOn0Verbose)
  })

  it("ensures FormSwitchOptions.validateOn type", () => {
    const form = FormSwitch(active, branches, {
      validateOn: {
        // @ts-expect-error should be ValidateStrategy
        active: "",
        branches: {
          // @ts-expect-error should be ValidateStrategy
          _1: 0,
          _2: {
            // @ts-expect-error should be ValidateStrategy
            _3: false,
            // @ts-expect-error should be ValidateStrategy
            _4: "",
          },
        },
      },
    })

    expectTypeOf(form).not.toBeUndefined()
  })

  describe("nested", () => {
    const active = FormUnit("", {
      schema: z.enum(["_6", "_7"]),
    })

    const branches = {
      _6: form,
      _7: FormUnit("0"),
    }

    const parent = FormSwitch(active, branches)

    type ParentValidateOnSchema =
      | ValidateStrategy
      | {
          readonly active: ValidateStrategy
          readonly branch:
            | ValidateStrategy
            | {
                readonly kind: "_6"
                readonly value: ValidateOnSchema
              }
            | {
                readonly kind: "_7"
                readonly value: ValidateStrategy
              }
        }

    interface ParentValidateOnVerboseSchema {
      readonly active: ValidateStrategy
      readonly branches: {
        readonly _6: ValidateOnVerboseSchema
        readonly _7: ValidateStrategy
      }
    }

    type ParentValidateOnSetter = Setter<
      | ValidateStrategy
      | {
          readonly active?: Setter<ValidateStrategy>
          readonly branch?: Setter<
            | ValidateStrategy
            | {
                readonly kind: "_6"
                readonly value: ValidateOnSetter
              }
            | {
                readonly kind: "_7"
                readonly value: Setter<ValidateStrategy>
              },
            [
              | {
                  readonly kind: "_6"
                  readonly value: ValidateOnVerboseSchema
                }
              | {
                  readonly kind: "_7"
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
                readonly _6?: ValidateOnSetter
                readonly _7?: Setter<ValidateStrategy>
              },
            [ParentValidateOnVerboseSchema["branches"]]
          >
        },
      [ParentValidateOnVerboseSchema]
    >

    it("matches schema type for getValidateOn(monitor, select?)", ({ monitor }) => {
      expectTypeOf(parent.getValidateOn(monitor)).toEqualTypeOf<ParentValidateOnSchema>()

      expectTypeOf(
        parent.getValidateOn(monitor, params._first),
      ).toEqualTypeOf<ParentValidateOnSchema>()

      expectTypeOf(
        parent.getValidateOn(monitor, params._second),
      ).toEqualTypeOf<ParentValidateOnVerboseSchema>()
    })

    it("matches setter type for setValidateOn(setter)", () => {
      expectTypeOf(parent.setValidateOn).toEqualTypeOf<(setter: ParentValidateOnSetter) => void>()
    })

    it("allows passing concise value to setValidateOn", ({ monitor }) => {
      const concise = parent.getValidateOn(monitor, params._first)

      parent.setValidateOn(concise)

      expect(parent.getValidateOn(monitor, params._first)).toStrictEqual(concise)
    })

    it("allows passing verbose value to setValidateOn", ({ monitor }) => {
      const verbose = parent.getValidateOn(monitor, params._second)

      parent.setValidateOn(verbose)

      expect(parent.getValidateOn(monitor, params._second)).toStrictEqual(verbose)
    })

    it("ensures FormSwitchOptions.validateOn type", () => {
      const parent = FormSwitch(active, branches, {
        validateOn: {
          // @ts-expect-error should be ValidateStrategy
          active: 1,
          branches: {
            // @ts-expect-error should be ValidateStrategy
            _6: 0,
          },
        },
      })

      expectTypeOf(parent).not.toBeUndefined()
    })
  })
})

describe.each([
  ["onTouch" as const, "onChange" as const],
  ["onChange" as const, "onSubmit" as const],
  ["onSubmit" as const, "onInit" as const],
  ["onInit" as const, "onTouch" as const],
])("when ValidateStrategy=%s", (validateOn, differentValidateOn) => {
  describe("when defining top-level concise FormSwitchOptions.validateOn", () => {
    describe("when active is valid", () => {
      it("overrides active branch's validateOn", ({ monitor }) => {
        const form = FormSwitch(
          FormUnit("_2", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: FormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: FormSwitch(
              FormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: FormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: FormUnit(1, {
                  validateOn: "onTouch",
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            validateOn,
          },
        )

        expect(form.getValidateOn(monitor)).toBe(validateOn)
        expect(form.getValidateOn(monitor, params._first)).toBe(validateOn)
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          active: validateOn,
          branches: {
            _1: "onInit",
            _2: {
              active: validateOn,
              branches: {
                _3: validateOn,
                _4: "onTouch",
              },
            },
          },
        })
      })
    })

    describe("when active is invalid", () => {
      it("overrides only the active's validateOn", ({ monitor }) => {
        const form = FormSwitch(
          FormUnit("", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: FormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: FormSwitch(
              FormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: FormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: FormUnit(1, {
                  validateOn: "onTouch",
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            validateOn,
          },
        )

        expect(form.getValidateOn(monitor)).toBe(validateOn)
        expect(form.getValidateOn(monitor, params._first)).toBe(validateOn)
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          active: validateOn,
          branches: {
            _1: "onInit",
            _2: {
              active: "onTouch",
              branches: {
                _3: "onSubmit",
                _4: "onTouch",
              },
            },
          },
        })
      })
    })
  })

  describe("when defining FormSwitchOptions.validateOn.active", () => {
    describe("when active is invalid", () => {
      it("overrides only the active's validateOn", ({ monitor }) => {
        const form = FormSwitch(
          FormUnit("", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: FormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: FormSwitch(
              FormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: FormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: FormUnit(1, {
                  validateOn: "onTouch",
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            validateOn: {
              active: validateOn,
            },
          },
        )

        expect(form.getValidateOn(monitor)).toBe(validateOn)
        expect(form.getValidateOn(monitor, params._first)).toBe(validateOn)
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          active: validateOn,
          branches: {
            _1: "onInit",
            _2: {
              active: "onTouch",
              branches: {
                _3: "onSubmit",
                _4: "onTouch",
              },
            },
          },
        })
      })
    })

    describe("when active is valid", () => {
      it("overrides only the active's validateOn", ({ monitor }) => {
        const form = FormSwitch(
          FormUnit("_2", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: FormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: FormSwitch(
              FormUnit("_3", {
                validateOn: "onSubmit",
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: FormUnit("0", {
                  schema: z.string(),
                }),
                _4: FormUnit(1, {
                  validateOn: "onTouch",
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            validateOn: {
              active: validateOn,
            },
          },
        )

        const concise = {
          active: validateOn,
          branch: {
            kind: "_2",
            value: {
              active: "onSubmit",
              branch: "onTouch",
            },
          },
        }

        expect(form.getValidateOn(monitor)).toStrictEqual(concise)
        expect(form.getValidateOn(monitor, params._first)).toStrictEqual(concise)
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          active: validateOn,
          branches: {
            _1: "onInit",
            _2: {
              active: "onSubmit",
              branches: {
                _3: "onTouch",
                _4: "onTouch",
              },
            },
          },
        })
      })
    })
  })

  describe("when defining concise FormSwitchOptions.validateOn.branch", () => {
    describe("when active is invalid", () => {
      it("does not change anything", ({ monitor }) => {
        const form = FormSwitch(
          FormUnit("", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: FormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: FormSwitch(
              FormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: FormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: FormUnit(1, {
                  validateOn: "onTouch",
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            validateOn: {
              branch: validateOn,
            },
          },
        )

        expect(form.getValidateOn(monitor)).toBe("onChange")
        expect(form.getValidateOn(monitor, params._first)).toBe("onChange")
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          active: "onChange",
          branches: {
            _1: "onInit",
            _2: {
              active: "onTouch",
              branches: {
                _3: "onSubmit",
                _4: "onTouch",
              },
            },
          },
        })
      })
    })

    describe("when active is valid", () => {
      it("overrides only the active branch validateOn", ({ monitor }) => {
        const form = FormSwitch(
          FormUnit("_2", {
            validateOn: differentValidateOn,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: FormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: FormShape({
              _3: FormUnit("0", {
                schema: z.string(),
              }),
              _4: FormUnit(1, {
                validateOn: "onTouch",
                schema: z.number(),
              }),
            }),
          },
          {
            validateOn: {
              branch: validateOn,
            },
          },
        )

        const concise = {
          active: differentValidateOn,
          branch: validateOn,
        }

        expect(form.getValidateOn(monitor)).toStrictEqual(concise)
        expect(form.getValidateOn(monitor, params._first)).toStrictEqual(concise)
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          active: differentValidateOn,
          branches: {
            _1: "onInit",
            _2: {
              _3: validateOn,
              _4: validateOn,
            },
          },
        })
      })
    })
  })

  describe("when defining detailed FormSwitchOptions.validateOn.branch.value", () => {
    describe("when active is invalid", () => {
      it("overrides only the target branch validateOn", ({ monitor }) => {
        const form = FormSwitch(
          FormUnit("", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: FormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: FormSwitch(
              FormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: FormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: FormUnit(1, {
                  validateOn: "onTouch",
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            validateOn: {
              branch: {
                kind: "_1",
                value: validateOn,
              },
            },
          },
        )

        expect(form.getValidateOn(monitor)).toBe("onChange")
        expect(form.getValidateOn(monitor, params._first)).toBe("onChange")
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          active: "onChange",
          branches: {
            _1: validateOn,
            _2: {
              active: "onTouch",
              branches: {
                _3: "onSubmit",
                _4: "onTouch",
              },
            },
          },
        })
      })
    })

    describe("when active is valid", () => {
      it("overrides only the target inactive branch validateOn", ({ monitor }) => {
        const form = FormSwitch(
          FormUnit("_2", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: FormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: FormSwitch(
              FormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: FormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: FormUnit(1, {
                  validateOn: "onTouch",
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            validateOn: {
              branch: {
                kind: "_1",
                value: validateOn,
              },
            },
          },
        )

        const concise = {
          active: "onChange",
          branch: {
            kind: "_2",
            value: {
              active: "onTouch",
              branch: "onSubmit",
            },
          },
        }

        expect(form.getValidateOn(monitor)).toStrictEqual(concise)
        expect(form.getValidateOn(monitor, params._first)).toStrictEqual(concise)
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          active: "onChange",
          branches: {
            _1: validateOn,
            _2: {
              active: "onTouch",
              branches: {
                _3: "onSubmit",
                _4: "onTouch",
              },
            },
          },
        })
      })

      it("overrides only the target active branch validateOn", ({ monitor }) => {
        const form = FormSwitch(
          FormUnit("_2", {
            validateOn: differentValidateOn,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: FormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: FormSwitch(
              FormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: FormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: FormUnit(1, {
                  validateOn: "onTouch",
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            validateOn: {
              branch: {
                kind: "_2",
                value: validateOn,
              },
            },
          },
        )

        const concise = {
          active: differentValidateOn,
          branch: validateOn,
        }

        expect(form.getValidateOn(monitor)).toStrictEqual(concise)
        expect(form.getValidateOn(monitor, params._first)).toStrictEqual(concise)
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          active: differentValidateOn,
          branches: {
            _1: "onInit",
            _2: {
              active: validateOn,
              branches: {
                _3: validateOn,
                _4: "onTouch",
              },
            },
          },
        })
      })

      it("overrides nested switch", ({ monitor }) => {
        const form = FormSwitch(
          FormUnit("_2", {
            validateOn: "onInit",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: FormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: FormSwitch(
              FormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: FormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: FormUnit(1, {
                  validateOn: "onTouch",
                  schema: z.number(),
                }),
              },
            ),
          },
          {
            validateOn: {
              branch: {
                kind: "_2",
                value: {
                  branch: {
                    kind: "_4",
                    value: validateOn,
                  },
                },
              },
            },
          },
        )

        const concise = {
          active: "onInit",
          branch: {
            kind: "_2",
            value: {
              active: "onTouch",
              branch: "onSubmit",
            },
          },
        }

        expect(form.getValidateOn(monitor)).toStrictEqual(concise)
        expect(form.getValidateOn(monitor, params._first)).toStrictEqual(concise)
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          active: "onInit",
          branches: {
            _1: "onInit",
            _2: {
              active: "onTouch",
              branches: {
                _3: "onSubmit",
                _4: validateOn,
              },
            },
          },
        })
      })
    })
  })

  describe("when defining all active+branch+branches FormSwitchOptions.validateOn", () => {
    it("branch takes over branches", ({ monitor }) => {
      const form = FormSwitch(
        FormUnit("_2", {
          validateOn: "onChange",
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: FormUnit(0, {
            validateOn: "onInit",
            schema: z.number(),
          }),
          _2: FormSwitch(
            FormUnit("_3", {
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: FormUnit("0", {
                validateOn: "onSubmit",
                schema: z.string(),
              }),
              _4: FormUnit(1, {
                validateOn: "onTouch",
                schema: z.number(),
              }),
            },
          ),
        },
        {
          validateOn: {
            active: differentValidateOn,
            branch: {
              kind: "_2",
              value: validateOn,
            },
            branches: {
              _1: differentValidateOn,
              _2: differentValidateOn,
            },
          },
        },
      )

      const concise = {
        active: differentValidateOn,
        branch: validateOn,
      }

      expect(form.getValidateOn(monitor)).toStrictEqual(concise)
      expect(form.getValidateOn(monitor, params._first)).toStrictEqual(concise)
      expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
        active: differentValidateOn,
        branches: {
          _1: differentValidateOn,
          _2: {
            active: validateOn,
            branches: {
              _3: validateOn,
              _4: "onTouch",
            },
          },
        },
      })
    })
  })

  it("returns the ValidateStrategy as concise result when everything has the same ValidateStrategy", ({
    monitor,
  }) => {
    const form = FormSwitch(FormUnit("", { validateOn, schema: z.enum(["_1", "_2"]) }), {
      _1: FormUnit(0, { validateOn, schema: z.number() }),
      _2: FormSwitch(
        FormUnit("", {
          validateOn,
          schema: z.enum(["_3", "_4"]),
        }),
        {
          _3: FormUnit("0", { validateOn, schema: z.string() }),
          _4: FormUnit(1, { validateOn, schema: z.number() }),
        },
      ),
    })

    expect(form.getValidateOn(monitor)).toBe(validateOn)
    expect(form.getValidateOn(monitor, params._first)).toBe(validateOn)
    expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
      active: validateOn,
      branches: {
        _1: validateOn,
        _2: {
          active: validateOn,
          branches: {
            _3: validateOn,
            _4: validateOn,
          },
        },
      },
    })
  })
})

describe("stable validateOn value", () => {
  it("subsequently selects equal validateOn", ({ monitor }) => {
    const form = FormSwitch(
      FormUnit("_2", {
        validateOn: "onChange",
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: FormUnit(0, {
          validateOn: "onInit",
          schema: z.number(),
        }),
        _2: FormSwitch(
          FormUnit("_3", {
            schema: z.enum(["_3", "_4"]),
          }),
          {
            _3: FormUnit("0", {
              validateOn: "onSubmit",
              schema: z.string(),
            }),
            _4: FormUnit(1, {
              validateOn: "onTouch",
              schema: z.number(),
            }),
          },
        ),
      },
    )

    expect(form.getValidateOn(monitor)).toBe(form.getValidateOn(monitor))
    expect(form.getValidateOn(monitor, params._first)).toBe(
      form.getValidateOn(monitor, params._first),
    )
    expect(form.getValidateOn(monitor, params._second)).toBe(
      form.getValidateOn(monitor, params._second),
    )
  })
})

describe("using recursive setter", () => {
  const active = FormUnit("_2", {
    validateOn: "onChange",
    schema: z.enum(["_1", "_2"]),
  })

  const branches = {
    _1: FormUnit(0, {
      validateOn: "onInit",
      schema: z.number(),
    }),
    _2: FormSwitch(
      FormUnit("_3", {
        schema: z.enum(["_3", "_4"]),
      }),
      {
        _3: FormUnit("0", {
          validateOn: "onSubmit",
          schema: z.string(),
        }),
        _4: FormUnit(1, {
          validateOn: "onTouch",
          schema: z.number(),
        }),
      },
    ),
  }

  function setup(options?: FormSwitchOptions<typeof active, typeof branches>) {
    return FormSwitch(active, branches, options)
  }

  describe.each<
    [
      string,
      (
        input: FormSwitchValidateOnSetter<typeof active, typeof branches>,
      ) => FormSwitch<typeof active, typeof branches>,
    ]
  >([
    ["FormSwitchOptions.validateOn", (validateOn) => setup({ validateOn })],

    [
      "FormSwitch.setValidateOn",
      (setter) => {
        const form = setup()

        form.setValidateOn(setter)

        return form
      },
    ],
  ])("in %s", (_, setup) => {
    it("passes initial and input recursively to all setters", ({ monitor }) => {
      expect.assertions(20)

      const form = setup(($) => {
        expectTypeOf($).toEqualTypeOf<{
          readonly active: ValidateStrategy
          readonly branches: {
            readonly _1: ValidateStrategy
            readonly _2: {
              readonly active: ValidateStrategy
              readonly branches: {
                readonly _3: ValidateStrategy
                readonly _4: ValidateStrategy
              }
            }
          }
        }>()

        expect($).toStrictEqual({
          active: "onChange",
          branches: {
            _1: "onInit",
            _2: {
              active: "onTouch",
              branches: {
                _3: "onSubmit",
                _4: "onTouch",
              },
            },
          },
        })

        return {
          active: ($_active) => {
            expectTypeOf($_active).toEqualTypeOf<ValidateStrategy>()
            expect($_active).toBe("onChange")

            return "onInit"
          },

          branches: ($_branches) => {
            expectTypeOf($_branches).toEqualTypeOf<{
              readonly _1: ValidateStrategy
              readonly _2: {
                readonly active: ValidateStrategy
                readonly branches: {
                  readonly _3: ValidateStrategy
                  readonly _4: ValidateStrategy
                }
              }
            }>()

            expect($_branches).toStrictEqual({
              _1: "onInit",
              _2: {
                active: "onTouch",
                branches: {
                  _3: "onSubmit",
                  _4: "onTouch",
                },
              },
            })

            return {
              _1: ($_branches1) => {
                expectTypeOf($_branches1).toEqualTypeOf<ValidateStrategy>()
                expect($_branches1).toBe("onInit")

                return "onTouch"
              },

              _2: ($_branches2) => {
                expectTypeOf($_branches2).toEqualTypeOf<{
                  readonly active: ValidateStrategy
                  readonly branches: {
                    readonly _3: ValidateStrategy
                    readonly _4: ValidateStrategy
                  }
                }>()

                expect($_branches2).toStrictEqual({
                  active: "onTouch",
                  branches: {
                    _3: "onSubmit",
                    _4: "onTouch",
                  },
                })

                return {
                  active: ($_branches2Active) => {
                    expectTypeOf($_branches2Active).toEqualTypeOf<ValidateStrategy>()
                    expect($_branches2Active).toBe("onTouch")

                    return "onInit"
                  },

                  branches: ($_branches2Branches) => {
                    expectTypeOf($_branches2Branches).toEqualTypeOf<{
                      readonly _3: ValidateStrategy
                      readonly _4: ValidateStrategy
                    }>()

                    expect($_branches2Branches).toStrictEqual({
                      _3: "onSubmit",
                      _4: "onTouch",
                    })

                    return {
                      _3: ($_branches2Branches3) => {
                        expectTypeOf($_branches2Branches3).toEqualTypeOf<ValidateStrategy>()
                        expect($_branches2Branches3).toBe("onSubmit")

                        return "onTouch"
                      },
                      _4: ($_branches2Branches4) => {
                        expectTypeOf($_branches2Branches4).toEqualTypeOf<ValidateStrategy>()
                        expect($_branches2Branches4).toBe("onTouch")

                        return "onChange"
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
                  readonly value: ValidateStrategy
                }
              | {
                  readonly kind: "_2"
                  readonly value: {
                    readonly active: ValidateStrategy
                    readonly branches: {
                      readonly _3: ValidateStrategy
                      readonly _4: ValidateStrategy
                    }
                  }
                }
            >()

            expect($_branch).toStrictEqual({
              kind: "_2",
              value: {
                active: "onInit",
                branches: {
                  _3: "onTouch",
                  _4: "onChange",
                },
              },
            })

            return {
              kind: "_2",
              value: ($_branch2) => {
                expectTypeOf($_branch2).toEqualTypeOf<{
                  readonly active: ValidateStrategy
                  readonly branches: {
                    readonly _3: ValidateStrategy
                    readonly _4: ValidateStrategy
                  }
                }>()

                // the value is set in $_branches_2 ^
                expect($_branch2).toStrictEqual({
                  active: "onInit",
                  branches: {
                    _3: "onTouch",
                    _4: "onChange",
                  },
                })

                return {
                  active: ($_branch2Active) => {
                    expectTypeOf($_branch2Active).toEqualTypeOf<ValidateStrategy>()
                    expect($_branch2Active).toBe("onInit")

                    return "onChange"
                  },

                  branches: ($_branch2Branches) => {
                    expectTypeOf($_branch2Branches).toEqualTypeOf<{
                      readonly _3: ValidateStrategy
                      readonly _4: ValidateStrategy
                    }>()

                    expect($_branch2Branches).toStrictEqual({
                      _3: "onTouch",
                      _4: "onChange",
                    })

                    return {
                      _3: ($_branch2Branches3) => {
                        expectTypeOf($_branch2Branches3).toEqualTypeOf<ValidateStrategy>()
                        expect($_branch2Branches3).toBe("onTouch")

                        return "onChange"
                      },
                      _4: ($_branch2Branches4) => {
                        expectTypeOf($_branch2Branches4).toEqualTypeOf<ValidateStrategy>()
                        expect($_branch2Branches4).toBe("onChange")

                        return "onTouch"
                      },
                    }
                  },

                  branch: ($_branch2Branch) => {
                    expectTypeOf($_branch2Branch).toEqualTypeOf<
                      | {
                          readonly kind: "_3"
                          readonly value: ValidateStrategy
                        }
                      | {
                          readonly kind: "_4"
                          readonly value: ValidateStrategy
                        }
                    >()
                    // the value is set in $_branch_2_branches_3 ^
                    expect($_branch2Branch).toStrictEqual({
                      kind: "_3",
                      value: "onChange",
                    })

                    return {
                      kind: "_4",
                      value: ($_branch2Branch4) => {
                        expectTypeOf($_branch2Branch4).toEqualTypeOf<ValidateStrategy>()
                        // the value is set in $_branch_2_branches ^
                        expect($_branch2Branch4).toBe("onTouch")

                        return "onInit"
                      },
                    }
                  },
                }
              },
            }
          },
        }
      })

      const concise = {
        active: "onInit",
        branch: "onChange",
      }

      expect(form.getValidateOn(monitor)).toStrictEqual(concise)
      expect(form.getValidateOn(monitor, params._first)).toStrictEqual(concise)
      expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
        active: "onInit",
        branches: {
          _1: "onTouch",
          _2: {
            active: "onChange",
            branches: {
              _3: "onChange",
              _4: "onInit",
            },
          },
        },
      })
    })
  })
})
