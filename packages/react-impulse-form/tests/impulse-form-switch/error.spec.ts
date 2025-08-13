import z from "zod"

import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormShape,
  ImpulseFormSwitch,
  type ImpulseFormSwitchOptions,
  type ImpulseFormSwitchValidateOnSetter,
  ImpulseFormUnit,
  type Result,
  VALIDATE_ON_CHANGE,
  VALIDATE_ON_INIT,
  VALIDATE_ON_SUBMIT,
  VALIDATE_ON_TOUCH,
} from "../../src"

describe("types", () => {
  const active = ImpulseFormUnit("", {
    schema: z.enum(["_1", "_2", "_5"]),
  })

  const branches = {
    _1: ImpulseFormUnit(true, {
      validate: (input): Result<string, number> => {
        if (input) {
          return [null, 18]
        }

        return ["Invalid input", null]
      },
    }),
    _2: ImpulseFormShape({
      _3: ImpulseFormUnit("name", {
        error: 123,
      }),
      _4: ImpulseFormUnit(18),
    }),
    _5: ImpulseFormUnit("excluded", {
      transform: (input) => input.trim(),
    }),
  }

  const form = ImpulseFormSwitch(active, branches)

  type ErrorSchema = null | {
    readonly active: null | ReadonlyArray<string>
    readonly branch:
      | {
          readonly kind: "_1"
          readonly value: null | string
        }
      | {
          readonly kind: "_2"
          readonly value: null | {
            readonly _3: null | number
            readonly _4: null
          }
        }
      | {
          readonly kind: "_5"
          readonly value: null
        }
  }

  interface ErrorVerboseSchema {
    readonly active: null | ReadonlyArray<string>
    readonly branches: {
      readonly _1: null | string
      readonly _2: {
        readonly _3: null | number
        readonly _4: null
      }
      readonly _5: null
    }
  }

  type ErrorOnSetter = Setter<
    | null
    | {
        readonly active?: Setter<null | ReadonlyArray<string>>
        readonly branch?: Setter<
          | null
          | {
              readonly kind: "_1"
              readonly value: Setter<null | string>
            }
          | {
              readonly kind: "_2"
              readonly value: Setter<
                null | {
                  readonly _3?: Setter<null | number>
                  readonly _4?: Setter<null>
                },
                [ErrorVerboseSchema["branches"]["_2"]]
              >
            }
          | {
              readonly kind: "_5"
              readonly value: Setter<null>
            },
          [
            | {
                readonly kind: "_1"
                readonly value: null | string
              }
            | {
                readonly kind: "_2"
                readonly value: {
                  readonly _3: null | number
                  readonly _4: null
                }
              }
            | {
                readonly kind: "_5"
                readonly value: null
              },
          ]
        >
      }
    | {
        readonly active?: Setter<null | ReadonlyArray<string>>
        readonly branches?: Setter<
          null | {
            readonly _1?: Setter<null | string>
            readonly _2?: Setter<
              null | {
                readonly _3?: Setter<null | number>
                readonly _4?: Setter<null>
              },
              [ErrorVerboseSchema["branches"]["_2"]]
            >
            readonly _5?: Setter<null>
          },
          [ErrorVerboseSchema["branches"]]
        >
      },
    [ErrorVerboseSchema]
  >

  it("matches schema type for getError(scope, select?)", ({ scope }) => {
    expectTypeOf(form.getError(scope)).toEqualTypeOf<ErrorSchema>()

    expectTypeOf(
      form.getError(scope, params._first),
    ).toEqualTypeOf<ErrorSchema>()

    expectTypeOf(
      form.getError(scope, params._second),
    ).toEqualTypeOf<ErrorVerboseSchema>()
  })

  it("matches setter type for setError(setter)", () => {
    expectTypeOf(form.setError).toEqualTypeOf<(setter: ErrorOnSetter) => void>()
  })

  it("allows passing concise value to setError", ({ scope }) => {
    const error_0 = form.getError(scope)
    const error_0_concise = form.getError(scope, params._first)
    const error_0_verbose = form.getError(scope, params._second)

    form.setError(error_0_concise)

    expect(form.getError(scope)).toStrictEqual(error_0)
    expect(form.getError(scope, params._first)).toStrictEqual(error_0_concise)
    expect(form.getError(scope, params._second)).toStrictEqual(error_0_verbose)
  })

  it("allows passing verbose value to setError", ({ scope }) => {
    const error_0 = form.getError(scope)
    const error_0_concise = form.getError(scope, params._first)
    const error_0_verbose = form.getError(scope, params._second)

    form.setError(error_0_verbose)

    expect(form.getError(scope)).toStrictEqual(error_0)
    expect(form.getError(scope, params._first)).toStrictEqual(error_0_concise)
    expect(form.getError(scope, params._second)).toStrictEqual(error_0_verbose)
  })

  it("allows passing verbose value in setError callback", ({ scope }) => {
    const error_0 = form.getError(scope)
    const error_0_concise = form.getError(scope, params._first)
    const error_0_verbose = form.getError(scope, params._second)

    form.setError((verbose) => {
      return verbose
    })

    expect(form.getError(scope)).toStrictEqual(error_0)
    expect(form.getError(scope, params._first)).toStrictEqual(error_0_concise)
    expect(form.getError(scope, params._second)).toStrictEqual(error_0_verbose)
  })

  it("ensures ImpulseFormSwitchOptions.error type", () => {
    const form = ImpulseFormSwitch(active, branches, {
      error: {
        // @ts-expect-error should be ReadonlyArray<string>
        active: "",
        branches: {
          // @ts-expect-error should be string
          _1: 0,
          _2: {
            // @ts-expect-error should be number
            _3: false,
            // @ts-expect-error should be null
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
      _7: ImpulseFormUnit("0", {
        error: 0,
      }),
    }

    const parent = ImpulseFormSwitch(active, branches)

    type ParentErrorSchema = null | {
      readonly active: null | ReadonlyArray<string>
      readonly branch:
        | {
            readonly kind: "_6"
            readonly value: ErrorSchema
          }
        | {
            readonly kind: "_7"
            readonly value: null | number
          }
    }

    interface ParentErrorVerboseSchema {
      readonly active: null | ReadonlyArray<string>
      readonly branches: {
        readonly _6: ErrorVerboseSchema
        readonly _7: null | number
      }
    }

    type ParentErrorSetter = Setter<
      | null
      | {
          readonly active?: Setter<null | ReadonlyArray<string>>
          readonly branch?: Setter<
            | null
            | {
                readonly kind: "_6"
                readonly value: ErrorOnSetter
              }
            | {
                readonly kind: "_7"
                readonly value: Setter<null | number>
              },
            [
              | {
                  readonly kind: "_6"
                  readonly value: ErrorVerboseSchema
                }
              | {
                  readonly kind: "_7"
                  readonly value: null | number
                },
            ]
          >
        }
      | {
          readonly active?: Setter<null | ReadonlyArray<string>>
          readonly branches?: Setter<
            null | {
              readonly _6?: ErrorOnSetter
              readonly _7?: Setter<null | number>
            },
            [ParentErrorVerboseSchema["branches"]]
          >
        },
      [ParentErrorVerboseSchema]
    >

    it("matches schema type for getError(scope, select?)", ({ scope }) => {
      expectTypeOf(parent.getError(scope)).toEqualTypeOf<ParentErrorSchema>()

      expectTypeOf(
        parent.getError(scope, params._first),
      ).toEqualTypeOf<ParentErrorSchema>()

      expectTypeOf(
        parent.getError(scope, params._second),
      ).toEqualTypeOf<ParentErrorVerboseSchema>()
    })

    it("matches setter type for setError(setter)", () => {
      expectTypeOf(parent.setError).toEqualTypeOf<
        (setter: ParentErrorSetter) => void
      >()
    })

    it("allows passing concise value to setError", ({ scope }) => {
      const concise = parent.getError(scope, params._first)

      parent.setError(concise)

      expect(parent.getError(scope, params._first)).toStrictEqual(concise)
    })

    it("allows passing verbose value to setError", ({ scope }) => {
      const verbose = parent.getError(scope, params._second)

      parent.setError(verbose)

      expect(parent.getError(scope, params._second)).toStrictEqual(verbose)
    })

    it("ensures ImpulseFormSwitchOptions.error type", () => {
      const parent = ImpulseFormSwitch(active, branches, {
        error: {
          // @ts-expect-error should be ReadonlyArray<string>
          active: 1,
          branches: {
            // @ts-expect-error should be number
            _7: "",
          },
        },
      })

      expectTypeOf(parent).not.toBeUndefined()
    })
  })
})

describe.each([
  VALIDATE_ON_TOUCH,
  VALIDATE_ON_CHANGE,
  VALIDATE_ON_SUBMIT,
  VALIDATE_ON_INIT,
])("when any validateOn (%s)", (validateOn) => {
  it("selects the active's error only when it has an error", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_1", {
        schema: z.enum(["_1"]),
        error: ["custom"],
      }),
      {
        _1: ImpulseFormUnit(0, {
          error: 123,
        }),
      },
      {
        validateOn,
      },
    )

    const concise = ["custom"]

    expect(form.getError(scope)).toStrictEqual(concise)
    expect(form.getError(scope, params._first)).toStrictEqual(concise)
    expect(form.getError(scope, params._second)).toStrictEqual({
      active: ["custom"],
      branches: {
        _1: 123,
      },
    })
  })

  it("selects the custom error regardless of the validate strategy", ({
    scope,
  }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_2", {
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(0, {
          error: 123,
        }),
        _2: ImpulseFormSwitch(
          ImpulseFormUnit("_3", {
            schema: z.enum(["_3", "_4"]),
          }),
          {
            _3: ImpulseFormUnit("0", {
              error: true,
            }),
            _4: ImpulseFormUnit(1, {
              error: ["one", "two"],
            }),
          },
        ),
      },
      {
        validateOn,
      },
    )

    const concise = {
      active: null,
      branch: {
        kind: "_2",
        value: {
          active: null,
          branch: {
            kind: "_3",
            value: true,
          },
        },
      },
    }

    expect(form.getError(scope)).toStrictEqual(concise)
    expect(form.getError(scope, params._first)).toStrictEqual(concise)
    expect(form.getError(scope, params._second)).toStrictEqual({
      active: null,
      branches: {
        _1: 123,
        _2: {
          active: null,
          branches: {
            _3: true,
            _4: ["one", "two"],
          },
        },
      },
    })
  })
})

describe.each([VALIDATE_ON_TOUCH, VALIDATE_ON_CHANGE, VALIDATE_ON_SUBMIT])(
  "when runtime validateOn (%s)",
  (validateOn) => {
    it("selects null for validating error", ({ scope }) => {
      const form = ImpulseFormSwitch(
        ImpulseFormUnit("_2", {
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            validate: (input): Result<string, number> => {
              if (input <= 0) {
                return ["Too small", null]
              }

              return [null, input]
            },
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                schema: z.number(),
              }),
            },
          ),
        },
        {
          validateOn,
        },
      )

      expect(form.getError(scope)).toBeNull()
      expect(form.getError(scope, params._first)).toBeNull()
      expect(form.getError(scope, params._second)).toStrictEqual({
        active: null,
        branches: {
          _1: null,
          _2: {
            active: null,
            branches: {
              _3: null,
              _4: null,
            },
          },
        },
      })
    })
  },
)

describe("when validateOn=onInit", () => {
  it("selects validating errors", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_2", {
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(-10, {
          validate: (input): Result<string, number> => {
            if (input <= 0) {
              return ["Too small", null]
            }

            return [null, input]
          },
        }),
        _2: ImpulseFormSwitch(
          ImpulseFormUnit("_3", {
            schema: z.enum(["_3", "_4"]),
          }),
          {
            _3: ImpulseFormUnit("0", {
              schema: z.number(),
            }),
            _4: ImpulseFormUnit(1, {
              schema: z.string(),
            }),
          },
        ),
      },
      {
        validateOn: "onInit",
      },
    )

    const concise = {
      active: null,
      branch: {
        kind: "_2",
        value: {
          active: null,
          branch: {
            kind: "_3",
            value: [expect.any(String)],
          },
        },
      },
    }

    expect(form.getError(scope)).toStrictEqual(concise)
    expect(form.getError(scope, params._first)).toStrictEqual(concise)
    expect(form.getError(scope, params._second)).toStrictEqual({
      active: null,
      branches: {
        _1: "Too small",
        _2: {
          active: null,
          branches: {
            _3: [expect.any(String)],
            _4: [expect.any(String)],
          },
        },
      },
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
      it.skip("overrides active branch's validateOn", ({ scope }) => {
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

        expect(form.getError(scope)).toBe(validateOn)
        expect(form.getError(scope, params._first)).toBe(validateOn)
        expect(form.getError(scope, params._second)).toStrictEqual({
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
      it.skip("overrides only the active's validateOn", ({ scope }) => {
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

        expect(form.getError(scope)).toBe(validateOn)
        expect(form.getError(scope, params._first)).toBe(validateOn)
        expect(form.getError(scope, params._second)).toStrictEqual({
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
      it.skip("overrides only the active's validateOn", ({ scope }) => {
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

        expect(form.getError(scope)).toBe(validateOn)
        expect(form.getError(scope, params._first)).toBe(validateOn)
        expect(form.getError(scope, params._second)).toStrictEqual({
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
      it.skip("overrides only the active's validateOn", ({ scope }) => {
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

        expect(form.getError(scope)).toStrictEqual(concise)
        expect(form.getError(scope, params._first)).toStrictEqual(concise)
        expect(form.getError(scope, params._second)).toStrictEqual({
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
      it.skip("does not change anything", ({ scope }) => {
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

        expect(form.getError(scope)).toBe("onChange")
        expect(form.getError(scope, params._first)).toBe("onChange")
        expect(form.getError(scope, params._second)).toStrictEqual({
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
      it.skip("overrides only the active branch validateOn", ({ scope }) => {
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

        expect(form.getError(scope)).toStrictEqual(concise)
        expect(form.getError(scope, params._first)).toStrictEqual(concise)
        expect(form.getError(scope, params._second)).toStrictEqual({
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
      it.skip("overrides only the target branch validateOn", ({ scope }) => {
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

        expect(form.getError(scope)).toBe("onChange")
        expect(form.getError(scope, params._first)).toBe("onChange")
        expect(form.getError(scope, params._second)).toStrictEqual({
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
      it.skip("overrides only the target inactive branch validateOn", ({
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

        expect(form.getError(scope)).toStrictEqual(concise)
        expect(form.getError(scope, params._first)).toStrictEqual(concise)
        expect(form.getError(scope, params._second)).toStrictEqual({
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

      it.skip("overrides only the target active branch validateOn", ({
        scope,
      }) => {
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

        expect(form.getError(scope)).toStrictEqual(concise)
        expect(form.getError(scope, params._first)).toStrictEqual(concise)
        expect(form.getError(scope, params._second)).toStrictEqual({
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

      it.skip("overrides nested switch", ({ scope }) => {
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

        expect(form.getError(scope)).toStrictEqual(concise)
        expect(form.getError(scope, params._first)).toStrictEqual(concise)
        expect(form.getError(scope, params._second)).toStrictEqual({
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
    it.skip("branch takes over branches", ({ scope }) => {
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

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
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

  it.skip("returns the ValidateStrategy as concise result when everything has the same ValidateStrategy", ({
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

    expect(form.getError(scope)).toBe(validateOn)
    expect(form.getError(scope, params._first)).toBe(validateOn)
    expect(form.getError(scope, params._second)).toStrictEqual({
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
  it.skip("subsequently selects equal validateOn", ({ scope }) => {
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

    expect(form.getError(scope)).toBe(form.getError(scope))
    expect(form.getError(scope, params._first)).toBe(
      form.getError(scope, params._first),
    )
    expect(form.getError(scope, params._second)).toBe(
      form.getError(scope, params._second),
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
      "ImpulseFormSwitch.setError",
      (setter) => {
        const form = setup()

        form.setError(setter)

        return form
      },
    ],
  ])("in %s", (_, setup) => {
    it.skip("passes initial and input recursively to all setters", ({
      scope,
    }) => {
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

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
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
