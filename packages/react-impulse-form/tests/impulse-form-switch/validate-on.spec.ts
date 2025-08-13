import z from "zod"

import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormShape,
  ImpulseFormSwitch,
  type ImpulseFormSwitchOptions,
  type ImpulseFormSwitchValidateOnSetter,
  ImpulseFormUnit,
  VALIDATE_ON_CHANGE,
  VALIDATE_ON_INIT,
  VALIDATE_ON_SUBMIT,
  VALIDATE_ON_TOUCH,
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
    const validateOn_0 = form.getValidateOn(scope)
    const validateOn_0_concise = form.getValidateOn(scope, params._first)
    const validateOn_0_verbose = form.getValidateOn(scope, params._second)

    form.setValidateOn(validateOn_0_concise)

    expect(form.getValidateOn(scope)).toStrictEqual(validateOn_0)
    expect(form.getValidateOn(scope, params._first)).toStrictEqual(
      validateOn_0_concise,
    )
    expect(form.getValidateOn(scope, params._second)).toStrictEqual(
      validateOn_0_verbose,
    )
  })

  it("allows passing verbose value to setValidateOn", ({ scope }) => {
    const validateOn_0 = form.getValidateOn(scope)
    const validateOn_0_concise = form.getValidateOn(scope, params._first)
    const validateOn_0_verbose = form.getValidateOn(scope, params._second)

    form.setValidateOn(validateOn_0_verbose)

    expect(form.getValidateOn(scope)).toStrictEqual(validateOn_0)
    expect(form.getValidateOn(scope, params._first)).toStrictEqual(
      validateOn_0_concise,
    )
    expect(form.getValidateOn(scope, params._second)).toStrictEqual(
      validateOn_0_verbose,
    )
  })

  it("allows passing verbose value in setValidateOn callback", ({ scope }) => {
    const validateOn_0 = form.getValidateOn(scope)
    const validateOn_0_concise = form.getValidateOn(scope, params._first)
    const validateOn_0_verbose = form.getValidateOn(scope, params._second)

    form.setValidateOn((verbose) => {
      return verbose
    })

    expect(form.getValidateOn(scope)).toStrictEqual(validateOn_0)
    expect(form.getValidateOn(scope, params._first)).toStrictEqual(
      validateOn_0_concise,
    )
    expect(form.getValidateOn(scope, params._second)).toStrictEqual(
      validateOn_0_verbose,
    )
  })

  it("ensures ImpulseFormSwitchOptions.validateOn type", () => {
    const form = ImpulseFormSwitch(active, branches, {
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
    const active = ImpulseFormUnit("", {
      schema: z.enum(["_6", "_7"]),
    })

    const branches = {
      _6: form,
      _7: ImpulseFormUnit("0"),
    }

    const parent = ImpulseFormSwitch(active, branches)

    type ParentValidateOnSchema =
      | ValidateStrategy
      | {
          readonly active: ValidateStrategy
          readonly branch:
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
  [VALIDATE_ON_TOUCH, VALIDATE_ON_CHANGE],
  [VALIDATE_ON_CHANGE, VALIDATE_ON_SUBMIT],
  [VALIDATE_ON_SUBMIT, VALIDATE_ON_INIT],
  [VALIDATE_ON_INIT, VALIDATE_ON_TOUCH],
])("when ValidateStrategy=%s", (validateOn, differentValidateOn) => {
  describe("when defining top-level concise ImpulseFormSwitchOptions.validateOn", () => {
    describe("when active is valid", () => {
      it("overrides active branch's validateOn", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("_2", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
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

        expect(form.getValidateOn(scope)).toBe(validateOn)
        expect(form.getValidateOn(scope, params._first)).toBe(validateOn)
        expect(form.getValidateOn(scope, params._second)).toStrictEqual({
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
      it("overrides only the active's validateOn", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
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

        expect(form.getValidateOn(scope)).toBe(validateOn)
        expect(form.getValidateOn(scope, params._first)).toBe(validateOn)
        expect(form.getValidateOn(scope, params._second)).toStrictEqual({
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

  describe("when defining ImpulseFormSwitchOptions.validateOn.active", () => {
    describe("when active is invalid", () => {
      it("overrides only the active's validateOn", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
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

        expect(form.getValidateOn(scope)).toBe(validateOn)
        expect(form.getValidateOn(scope, params._first)).toBe(validateOn)
        expect(form.getValidateOn(scope, params._second)).toStrictEqual({
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
      it("overrides only the active's validateOn", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("_2", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                validateOn: "onSubmit",
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
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
              branch: {
                kind: "_3",
                value: "onTouch",
              },
            },
          },
        }

        expect(form.getValidateOn(scope)).toStrictEqual(concise)
        expect(form.getValidateOn(scope, params._first)).toStrictEqual(concise)
        expect(form.getValidateOn(scope, params._second)).toStrictEqual({
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

  describe("when defining concise ImpulseFormSwitchOptions.validateOn.branch", () => {
    describe("when active is invalid", () => {
      it("does not change anything", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
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

        expect(form.getValidateOn(scope)).toBe("onChange")
        expect(form.getValidateOn(scope, params._first)).toBe("onChange")
        expect(form.getValidateOn(scope, params._second)).toStrictEqual({
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
      it("overrides only the active branch validateOn", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("_2", {
            validateOn: differentValidateOn,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: ImpulseFormShape({
              _3: ImpulseFormUnit("0", {
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
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
          branch: {
            kind: "_2",
            value: validateOn,
          },
        }

        expect(form.getValidateOn(scope)).toStrictEqual(concise)
        expect(form.getValidateOn(scope, params._first)).toStrictEqual(concise)
        expect(form.getValidateOn(scope, params._second)).toStrictEqual({
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

  describe("when defining detailed ImpulseFormSwitchOptions.validateOn.branch", () => {
    describe("when active is invalid", () => {
      it("overrides only the target branch validateOn", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
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

        expect(form.getValidateOn(scope)).toBe("onChange")
        expect(form.getValidateOn(scope, params._first)).toBe("onChange")
        expect(form.getValidateOn(scope, params._second)).toStrictEqual({
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
      it("overrides only the target inactive branch validateOn", ({
        scope,
      }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("_2", {
            validateOn: "onChange",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
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
              branch: {
                kind: "_3",
                value: "onSubmit",
              },
            },
          },
        }

        expect(form.getValidateOn(scope)).toStrictEqual(concise)
        expect(form.getValidateOn(scope, params._first)).toStrictEqual(concise)
        expect(form.getValidateOn(scope, params._second)).toStrictEqual({
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

      it("overrides only the target active branch validateOn", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("_2", {
            validateOn: differentValidateOn,
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
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
          branch: {
            kind: "_2",
            value: validateOn,
          },
        }

        expect(form.getValidateOn(scope)).toStrictEqual(concise)
        expect(form.getValidateOn(scope, params._first)).toStrictEqual(concise)
        expect(form.getValidateOn(scope, params._second)).toStrictEqual({
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

      it("overrides nested switch", ({ scope }) => {
        const form = ImpulseFormSwitch(
          ImpulseFormUnit("_2", {
            validateOn: "onInit",
            schema: z.enum(["_1", "_2"]),
          }),
          {
            _1: ImpulseFormUnit(0, {
              validateOn: "onInit",
              schema: z.number(),
            }),
            _2: ImpulseFormSwitch(
              ImpulseFormUnit("_3", {
                schema: z.enum(["_3", "_4"]),
              }),
              {
                _3: ImpulseFormUnit("0", {
                  validateOn: "onSubmit",
                  schema: z.string(),
                }),
                _4: ImpulseFormUnit(1, {
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
              branch: {
                kind: "_3",
                value: "onSubmit",
              },
            },
          },
        }

        expect(form.getValidateOn(scope)).toStrictEqual(concise)
        expect(form.getValidateOn(scope, params._first)).toStrictEqual(concise)
        expect(form.getValidateOn(scope, params._second)).toStrictEqual({
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

  describe("when defining all active+branch+branches ImpulseFormSwitchOptions.validateOn", () => {
    it("branch takes over branches", ({ scope }) => {
      const form = ImpulseFormSwitch(
        ImpulseFormUnit("_2", {
          validateOn: "onChange",
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            validateOn: "onInit",
            schema: z.number(),
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                validateOn: "onSubmit",
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
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
        branch: {
          kind: "_2",
          value: validateOn,
        },
      }

      expect(form.getValidateOn(scope)).toStrictEqual(concise)
      expect(form.getValidateOn(scope, params._first)).toStrictEqual(concise)
      expect(form.getValidateOn(scope, params._second)).toStrictEqual({
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
    scope,
  }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("", { validateOn, schema: z.enum(["_1", "_2"]) }),
      {
        _1: ImpulseFormUnit(0, { validateOn, schema: z.number() }),
        _2: ImpulseFormSwitch(
          ImpulseFormUnit("", {
            validateOn,
            schema: z.enum(["_3", "_4"]),
          }),
          {
            _3: ImpulseFormUnit("0", { validateOn, schema: z.string() }),
            _4: ImpulseFormUnit(1, { validateOn, schema: z.number() }),
          },
        ),
      },
    )

    expect(form.getValidateOn(scope)).toBe(validateOn)
    expect(form.getValidateOn(scope, params._first)).toBe(validateOn)
    expect(form.getValidateOn(scope, params._second)).toStrictEqual({
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
  it("subsequently selects equal validateOn", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_2", {
        validateOn: "onChange",
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(0, {
          validateOn: "onInit",
          schema: z.number(),
        }),
        _2: ImpulseFormSwitch(
          ImpulseFormUnit("_3", {
            schema: z.enum(["_3", "_4"]),
          }),
          {
            _3: ImpulseFormUnit("0", {
              validateOn: "onSubmit",
              schema: z.string(),
            }),
            _4: ImpulseFormUnit(1, {
              validateOn: "onTouch",
              schema: z.number(),
            }),
          },
        ),
      },
    )

    expect(form.getValidateOn(scope)).toBe(form.getValidateOn(scope))
    expect(form.getValidateOn(scope, params._first)).toBe(
      form.getValidateOn(scope, params._first),
    )
    expect(form.getValidateOn(scope, params._second)).toBe(
      form.getValidateOn(scope, params._second),
    )
  })
})

describe("using recursive setter", () => {
  const active = ImpulseFormUnit("_2", {
    validateOn: "onChange",
    schema: z.enum(["_1", "_2"]),
  })

  const branches = {
    _1: ImpulseFormUnit(0, {
      validateOn: "onInit",
      schema: z.number(),
    }),
    _2: ImpulseFormSwitch(
      ImpulseFormUnit("_3", {
        schema: z.enum(["_3", "_4"]),
      }),
      {
        _3: ImpulseFormUnit("0", {
          validateOn: "onSubmit",
          schema: z.string(),
        }),
        _4: ImpulseFormUnit(1, {
          validateOn: "onTouch",
          schema: z.number(),
        }),
      },
    ),
  }

  function setup(
    options?: ImpulseFormSwitchOptions<typeof active, typeof branches>,
  ) {
    return ImpulseFormSwitch(active, branches, options)
  }

  describe.each<
    [
      string,
      (
        input: ImpulseFormSwitchValidateOnSetter<
          typeof active,
          typeof branches
        >,
      ) => ImpulseFormSwitch<typeof active, typeof branches>,
    ]
  >([
    [
      "ImpulseFormSwitchOptions.validateOn",
      (validateOn) => {
        return setup({ validateOn })
      },
    ],

    [
      "ImpulseFormSwitch.setValidateOn",
      (setter) => {
        const form = setup()

        form.setValidateOn(setter)

        return form
      },
    ],
  ])("in %s", (_, setup) => {
    it("passes initial and input recursively to all setters", ({ scope }) => {
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
              _1: ($_branches_1) => {
                expectTypeOf($_branches_1).toEqualTypeOf<ValidateStrategy>()
                expect($_branches_1).toBe("onInit")

                return "onTouch"
              },

              _2: ($_branches_2) => {
                expectTypeOf($_branches_2).toEqualTypeOf<{
                  readonly active: ValidateStrategy
                  readonly branches: {
                    readonly _3: ValidateStrategy
                    readonly _4: ValidateStrategy
                  }
                }>()

                expect($_branches_2).toStrictEqual({
                  active: "onTouch",
                  branches: {
                    _3: "onSubmit",
                    _4: "onTouch",
                  },
                })

                return {
                  active: ($_branches_2_active) => {
                    expectTypeOf(
                      $_branches_2_active,
                    ).toEqualTypeOf<ValidateStrategy>()
                    expect($_branches_2_active).toBe("onTouch")

                    return "onInit"
                  },

                  branches: ($_branches_2_branches) => {
                    expectTypeOf($_branches_2_branches).toEqualTypeOf<{
                      readonly _3: ValidateStrategy
                      readonly _4: ValidateStrategy
                    }>()

                    expect($_branches_2_branches).toStrictEqual({
                      _3: "onSubmit",
                      _4: "onTouch",
                    })

                    return {
                      _3: ($_branches_2_branches_3) => {
                        expectTypeOf(
                          $_branches_2_branches_3,
                        ).toEqualTypeOf<ValidateStrategy>()
                        expect($_branches_2_branches_3).toBe("onSubmit")

                        return "onTouch"
                      },
                      _4: ($_branches_2_branches_4) => {
                        expectTypeOf(
                          $_branches_2_branches_4,
                        ).toEqualTypeOf<ValidateStrategy>()
                        expect($_branches_2_branches_4).toBe("onTouch")

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
              value: ($_branch_2) => {
                expectTypeOf($_branch_2).toEqualTypeOf<{
                  readonly active: ValidateStrategy
                  readonly branches: {
                    readonly _3: ValidateStrategy
                    readonly _4: ValidateStrategy
                  }
                }>()

                // the value is set in $_branches_2 ^
                expect($_branch_2).toStrictEqual({
                  active: "onInit",
                  branches: {
                    _3: "onTouch",
                    _4: "onChange",
                  },
                })

                return {
                  active: ($_branch_2_active) => {
                    expectTypeOf(
                      $_branch_2_active,
                    ).toEqualTypeOf<ValidateStrategy>()
                    expect($_branch_2_active).toBe("onInit")

                    return "onChange"
                  },

                  branches: ($_branch_2_branches) => {
                    expectTypeOf($_branch_2_branches).toEqualTypeOf<{
                      readonly _3: ValidateStrategy
                      readonly _4: ValidateStrategy
                    }>()

                    expect($_branch_2_branches).toStrictEqual({
                      _3: "onTouch",
                      _4: "onChange",
                    })

                    return {
                      _3: ($_branch_2_branches_3) => {
                        expectTypeOf(
                          $_branch_2_branches_3,
                        ).toEqualTypeOf<ValidateStrategy>()
                        expect($_branch_2_branches_3).toBe("onTouch")

                        return "onChange"
                      },
                      _4: ($_branch_2_branches_4) => {
                        expectTypeOf(
                          $_branch_2_branches_4,
                        ).toEqualTypeOf<ValidateStrategy>()
                        expect($_branch_2_branches_4).toBe("onChange")

                        return "onTouch"
                      },
                    }
                  },

                  branch: ($_branch_2_branch) => {
                    expectTypeOf($_branch_2_branch).toEqualTypeOf<
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
                    expect($_branch_2_branch).toStrictEqual({
                      kind: "_3",
                      value: "onChange",
                    })

                    return {
                      kind: "_4",
                      value: ($_branch_2_branch_4) => {
                        expectTypeOf(
                          $_branch_2_branch_4,
                        ).toEqualTypeOf<ValidateStrategy>()
                        // the value is set in $_branch_2_branches ^
                        expect($_branch_2_branch_4).toBe("onTouch")

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
        branch: {
          kind: "_2",
          value: "onChange",
        },
      }

      expect(form.getValidateOn(scope)).toStrictEqual(concise)
      expect(form.getValidateOn(scope, params._first)).toStrictEqual(concise)
      expect(form.getValidateOn(scope, params._second)).toStrictEqual({
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
