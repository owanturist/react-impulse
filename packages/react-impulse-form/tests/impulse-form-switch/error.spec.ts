import z from "zod"

import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormShape,
  ImpulseFormSwitch,
  type ImpulseFormSwitchErrorSetter,
  type ImpulseFormSwitchOptions,
  type ImpulseFormSwitchValidateOnSetter,
  ImpulseFormUnit,
  type Result,
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
      | null
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

    form.setError(error_0_concise)

    expect(form.getError(scope)).toStrictEqual(error_0)
    expect(form.getError(scope, params._first)).toStrictEqual(error_0_concise)
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
        | null
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

    const concise = {
      active: ["custom"],
      branch: null,
    }

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
          validateOn,
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            validateOn,
            validate: (input): Result<string, number> => {
              if (input <= 0) {
                return ["Too small", null]
              }

              return [null, input]
            },
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              validateOn,
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                validateOn,
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                validateOn,
                schema: z.number(),
              }),
            },
          ),
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

describe("when after trigger", () => {
  function setup(validateOn: ValidateStrategy) {
    return ImpulseFormSwitch(
      ImpulseFormUnit("_2", {
        validateOn,
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(-10, {
          validateOn,
          validate: (input): Result<string, number> => {
            if (input <= 0) {
              return ["Too small", null]
            }

            return [null, input]
          },
        }),
        _2: ImpulseFormSwitch(
          ImpulseFormUnit("_3", {
            validateOn,
            schema: z.enum(["_3", "_4"]),
          }),
          {
            _3: ImpulseFormUnit("0", {
              validateOn,
              schema: z.number(),
            }),
            _4: ImpulseFormUnit(1, {
              validateOn,
              schema: z.string(),
            }),
          },
        ),
      },
    )
  }

  describe.each<
    [
      ValidateStrategy,
      verbose: unknown,
      trigger?: (form: ReturnType<typeof setup>) => void | Promise<void>,
    ]
  >([
    [
      VALIDATE_ON_INIT,
      {
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
      },
    ],

    [
      VALIDATE_ON_CHANGE,
      {
        active: null,
        branches: {
          _1: "Too small",
          _2: {
            active: null,
            branches: {
              _3: [expect.any(String)],
              _4: null,
            },
          },
        },
      },
      (form) => {
        form.setInput({
          branches: {
            _1: -1,
            _2: {
              branches: {
                _3: "123",
              },
            },
          },
        })
      },
    ],

    [
      VALIDATE_ON_TOUCH,
      {
        active: null,
        branches: {
          _1: "Too small",
          _2: {
            active: null,
            branches: {
              _3: [expect.any(String)],
              _4: null,
            },
          },
        },
      },
      (form) => {
        form.setTouched({
          branches: {
            _1: true,
            _2: {
              branches: {
                _3: true,
              },
            },
          },
        })
      },
    ],

    [
      VALIDATE_ON_SUBMIT,
      {
        active: null,
        branches: {
          _1: null,
          _2: {
            active: null,
            branches: {
              _3: [expect.any(String)],
              _4: null,
            },
          },
        },
      },
      async (form) => {
        await form.submit()
      },
    ],
  ])("when validateOn=%s", (validateOn, verbose, trigger) => {
    describe("when active is valid", () => {
      it("selects active's branch validating errors when units become dirty", async ({
        scope,
      }) => {
        const form = setup(validateOn)

        await trigger?.(form)

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
        expect(form.getError(scope, params._second)).toStrictEqual(verbose)
      })
    })
  })
})

describe("when defining top-level concise ImpulseFormSwitchOptions.error", () => {
  const validateOn = VALIDATE_ON_INIT

  describe("when active is valid", () => {
    it("overrides active branch's validateOn", ({ scope }) => {
      const form = ImpulseFormSwitch(
        ImpulseFormUnit("_2", {
          validateOn,
          error: ["custom"],
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            validateOn,
            error: ["custom_1"],
            schema: z.number(),
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              validateOn,
              error: ["custom_2"],
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                validateOn,
                error: ["custom_3"],
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                validateOn,
                error: ["custom_4"],
                schema: z.string(),
              }),
            },
          ),
        },
        {
          error: null,
        },
      )

      expect(form.getError(scope)).toBeNull()
      expect(form.getError(scope, params._first)).toBeNull()
      expect(form.getError(scope, params._second)).toStrictEqual({
        active: null,
        branches: {
          _1: ["custom_1"],
          _2: {
            active: null,
            branches: {
              _3: null,
              _4: ["custom_4"],
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
          validateOn,
          error: ["custom"],
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            validateOn,
            error: ["custom_1"],
            schema: z.number(),
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              validateOn,
              error: ["custom_2"],
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                validateOn,
                error: ["custom_3"],
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                validateOn,
                error: ["custom_4"],
                schema: z.string(),
              }),
            },
          ),
        },
        {
          error: null,
        },
      )

      const concise = {
        active: [expect.stringContaining("Invalid option")],
        branch: null,
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        active: [expect.stringContaining("Invalid option")],
        branches: {
          _1: ["custom_1"],
          _2: {
            active: ["custom_2"],
            branches: {
              _3: ["custom_3"],
              _4: ["custom_4"],
            },
          },
        },
      })
    })
  })
})

describe("when defining ImpulseFormSwitchOptions.error.active", () => {
  const validateOn = VALIDATE_ON_INIT

  describe("when active is invalid", () => {
    it("overrides only the active's error", ({ scope }) => {
      const form = ImpulseFormSwitch(
        ImpulseFormUnit("", {
          validateOn,
          error: ["custom"],
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            validateOn,
            error: ["custom_1"],
            schema: z.number(),
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              validateOn,
              error: ["custom_2"],
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                validateOn,
                error: ["custom_3"],
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                validateOn,
                error: ["custom_4"],
                schema: z.string(),
              }),
            },
          ),
        },
        {
          error: {
            active: null,
          },
        },
      )

      const concise = {
        active: [expect.stringContaining("Invalid option")],
        branch: null,
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        active: [expect.stringContaining("Invalid option")],
        branches: {
          _1: ["custom_1"],
          _2: {
            active: ["custom_2"],
            branches: {
              _3: ["custom_3"],
              _4: ["custom_4"],
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
          validateOn,
          error: ["custom"],
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            validateOn,
            error: ["custom_1"],
            schema: z.number(),
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              validateOn,
              error: ["custom_2"],
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                validateOn,
                error: ["custom_3"],
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                validateOn,
                error: ["custom_4"],
                schema: z.string(),
              }),
            },
          ),
        },
        {
          error: {
            active: null,
          },
        },
      )

      const concise = {
        active: null,
        branch: {
          kind: "_2",
          value: {
            active: ["custom_2"],
            branch: null,
          },
        },
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        active: null,
        branches: {
          _1: ["custom_1"],
          _2: {
            active: ["custom_2"],
            branches: {
              _3: ["custom_3"],
              _4: ["custom_4"],
            },
          },
        },
      })
    })
  })
})

describe("when defining concise ImpulseFormSwitchOptions.error.branch", () => {
  const validateOn = VALIDATE_ON_INIT

  describe("when active is invalid", () => {
    it("does not change anything", ({ scope }) => {
      const form = ImpulseFormSwitch(
        ImpulseFormUnit("", {
          validateOn,
          error: ["custom"],
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            validateOn,
            error: ["custom_1"],
            schema: z.number(),
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              validateOn,
              error: ["custom_2"],
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                validateOn,
                error: ["custom_3"],
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                validateOn,
                error: ["custom_4"],
                schema: z.string(),
              }),
            },
          ),
        },
        {
          error: {
            branch: null,
          },
        },
      )

      const concise = {
        active: ["custom"],
        branch: null,
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        active: ["custom"],
        branches: {
          _1: ["custom_1"],
          _2: {
            active: ["custom_2"],
            branches: {
              _3: ["custom_3"],
              _4: ["custom_4"],
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
          validateOn,
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            validateOn,
            error: ["custom_1"],
            schema: z.number(),
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              validateOn,
              error: ["custom_2"],
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                validateOn,
                error: ["custom_3"],
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                validateOn,
                error: ["custom_4"],
                schema: z.string(),
              }),
            },
          ),
        },
        {
          error: {
            branch: null,
          },
        },
      )

      expect(form.getError(scope)).toBeNull()
      expect(form.getError(scope, params._first)).toBeNull()
      expect(form.getError(scope, params._second)).toStrictEqual({
        active: null,
        branches: {
          _1: ["custom_1"],
          _2: {
            active: null,
            branches: {
              _3: null,
              _4: ["custom_4"],
            },
          },
        },
      })
    })
  })
})

describe("when defining detailed ImpulseFormSwitchOptions.error.branch", () => {
  const validateOn = VALIDATE_ON_INIT

  describe("when active is invalid", () => {
    it("overrides only the target branch error", ({ scope }) => {
      const form = ImpulseFormSwitch(
        ImpulseFormUnit("", {
          validateOn,
          error: ["custom"],
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            validateOn,
            error: ["custom_1"],
            schema: z.number(),
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              validateOn,
              error: ["custom_2"],
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                validateOn,
                error: ["custom_3"],
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                validateOn,
                error: ["custom_4"],
                schema: z.string(),
              }),
            },
          ),
        },
        {
          error: {
            branch: {
              kind: "_1",
              value: null,
            },
          },
        },
      )

      const concise = {
        active: ["custom"],
        branch: null,
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        active: ["custom"],
        branches: {
          _1: null,
          _2: {
            active: ["custom_2"],
            branches: {
              _3: ["custom_3"],
              _4: ["custom_4"],
            },
          },
        },
      })
    })
  })

  describe("when active is valid", () => {
    it("overrides only the target inactive branch error", ({ scope }) => {
      const form = ImpulseFormSwitch(
        ImpulseFormUnit("_2", {
          validateOn,
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            validateOn,
            error: ["custom_1"],
            schema: z.number(),
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              validateOn,
              error: ["custom_2"],
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                validateOn,
                error: ["custom_3"],
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                validateOn,
                error: ["custom_4"],
                schema: z.string(),
              }),
            },
          ),
        },
        {
          error: {
            branch: {
              kind: "_1",
              value: null,
            },
          },
        },
      )

      const concise = {
        active: null,
        branch: {
          kind: "_2",
          value: {
            active: ["custom_2"],
            branch: null,
          },
        },
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        active: null,
        branches: {
          _1: null,
          _2: {
            active: ["custom_2"],
            branches: {
              _3: ["custom_3"],
              _4: ["custom_4"],
            },
          },
        },
      })
    })

    it("overrides only the target active branch error", ({ scope }) => {
      const form = ImpulseFormSwitch(
        ImpulseFormUnit("_2", {
          validateOn,
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            validateOn,
            error: ["custom_1"],
            schema: z.number(),
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              validateOn,
              error: ["custom_2"],
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                validateOn,
                error: ["custom_3"],
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                validateOn,
                error: ["custom_4"],
                schema: z.string(),
              }),
            },
          ),
        },
        {
          error: {
            branch: {
              kind: "_2",
              value: null,
            },
          },
        },
      )

      expect(form.getError(scope)).toBeNull()
      expect(form.getError(scope, params._first)).toBeNull()
      expect(form.getError(scope, params._second)).toStrictEqual({
        active: null,
        branches: {
          _1: ["custom_1"],
          _2: {
            active: null,
            branches: {
              _3: null,
              _4: ["custom_4"],
            },
          },
        },
      })
    })

    it("overrides nested switch", ({ scope }) => {
      const form = ImpulseFormSwitch(
        ImpulseFormUnit("_2", {
          validateOn,
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: ImpulseFormUnit(0, {
            validateOn,
            error: ["custom_1"],
            schema: z.number(),
          }),
          _2: ImpulseFormSwitch(
            ImpulseFormUnit("_3", {
              validateOn,
              error: ["custom_2"],
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: ImpulseFormUnit("0", {
                validateOn,
                error: ["custom_3"],
                schema: z.string(),
              }),
              _4: ImpulseFormUnit(1, {
                validateOn,
                error: ["custom_4"],
                schema: z.string(),
              }),
            },
          ),
        },
        {
          error: {
            branch: {
              kind: "_2",
              value: {
                active: null,
                branch: {
                  kind: "_4",
                  value: null,
                },
              },
            },
          },
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
              value: ["custom_3"],
            },
          },
        },
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        active: null,
        branches: {
          _1: ["custom_1"],
          _2: {
            active: null,
            branches: {
              _3: ["custom_3"],
              _4: [expect.stringContaining("Invalid input")],
            },
          },
        },
      })
    })
  })
})

describe("when defining all active+branch+branches ImpulseFormSwitchOptions.error", () => {
  const validateOn = VALIDATE_ON_INIT

  it("branch takes over branches", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_1", {
        validateOn,
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(0, {
          validateOn,
          error: ["custom_1"],
          schema: z.number(),
        }),
        _2: ImpulseFormSwitch(
          ImpulseFormUnit("_3", {
            validateOn,
            error: ["custom_2"],
            schema: z.enum(["_3", "_4"]),
          }),
          {
            _3: ImpulseFormUnit("0", {
              validateOn,
              error: ["custom_3"],
              schema: z.string(),
            }),
            _4: ImpulseFormUnit(1, {
              validateOn,
              error: ["custom_4"],
              schema: z.string(),
            }),
          },
        ),
      },
      {
        error: {
          active: null,
          branch: {
            kind: "_1",
            value: ["new_1"],
          },
          branches: {
            _1: null,
            _2: null,
          },
        },
      },
    )

    const concise = {
      active: null,
      branch: {
        kind: "_1",
        value: ["new_1"],
      },
    }

    expect(form.getError(scope)).toStrictEqual(concise)
    expect(form.getError(scope, params._first)).toStrictEqual(concise)
    expect(form.getError(scope, params._second)).toStrictEqual({
      active: null,
      branches: {
        _1: ["new_1"],
        _2: {
          active: null,
          branches: {
            _3: null,
            _4: ["custom_4"],
          },
        },
      },
    })
  })
})

describe("stable error value", () => {
  const validateOn = VALIDATE_ON_INIT

  it("subsequently selects equal error", ({ scope }) => {
    const form = ImpulseFormSwitch(
      ImpulseFormUnit("_1", {
        validateOn,
        schema: z.enum(["_1", "_2"]),
      }),
      {
        _1: ImpulseFormUnit(0, {
          validateOn,
          error: ["custom_1"],
          schema: z.number(),
        }),
        _2: ImpulseFormSwitch(
          ImpulseFormUnit("_3", {
            validateOn,
            schema: z.enum(["_3", "_4"]),
          }),
          {
            _3: ImpulseFormUnit("0", {
              validateOn,
              error: ["custom_3"],
              schema: z.string(),
            }),
            _4: ImpulseFormUnit(1, {
              validateOn,
              error: ["custom_4"],
              schema: z.string(),
            }),
          },
        ),
      },
    )

    expect(form.getError(scope)).toBeInstanceOf(Object)
    expect(form.getError(scope)).toBe(form.getError(scope))

    expect(form.getError(scope, params._first)).toBeInstanceOf(Object)
    expect(form.getError(scope, params._first)).toBe(
      form.getError(scope, params._first),
    )

    expect(form.getError(scope, params._second)).toBeInstanceOf(Object)
    expect(form.getError(scope, params._second)).toBe(
      form.getError(scope, params._second),
    )
  })
})

describe("using recursive setter", () => {
  const validateOn = VALIDATE_ON_INIT

  const active = ImpulseFormUnit("_2", {
    validateOn,
    schema: z.enum(["_1", "_2"]),
  })

  const branches = {
    _1: ImpulseFormUnit(0, {
      validateOn,
      validate: (input): Result<string, number> => {
        if (input <= 0) {
          return ["Too small", null]
        }

        return [null, input]
      },
    }),
    _2: ImpulseFormSwitch(
      ImpulseFormUnit("_3", {
        validateOn,
        schema: z.enum(["_3", "_4"]),
      }),
      {
        _3: ImpulseFormUnit("0", {
          error: true,
        }),
        _4: ImpulseFormUnit<number, number>(1),
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
        input: ImpulseFormSwitchErrorSetter<typeof active, typeof branches>,
      ) => ImpulseFormSwitch<typeof active, typeof branches>,
    ]
  >([
    [
      "ImpulseFormSwitchOptions.error",
      (error) => {
        return setup({ error })
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
    it("passes initial and input recursively to all setters", ({ scope }) => {
      expect.assertions(20)

      const form = setup(($) => {
        expectTypeOf($).toEqualTypeOf<{
          readonly active: null | ReadonlyArray<string>
          readonly branches: {
            readonly _1: null | string
            readonly _2: {
              readonly active: null | ReadonlyArray<string>
              readonly branches: {
                readonly _3: null | boolean
                readonly _4: null | number
              }
            }
          }
        }>()

        expect($).toStrictEqual({
          active: null,
          branches: {
            _1: "Too small",
            _2: {
              active: null,
              branches: {
                _3: true,
                _4: null,
              },
            },
          },
        })

        return {
          active: ($_active) => {
            expectTypeOf($_active).toEqualTypeOf<null | ReadonlyArray<string>>()
            expect($_active).toBeNull()

            return null
          },

          branches: ($_branches) => {
            expectTypeOf($_branches).toEqualTypeOf<{
              readonly _1: null | string
              readonly _2: {
                readonly active: null | ReadonlyArray<string>
                readonly branches: {
                  readonly _3: null | boolean
                  readonly _4: null | number
                }
              }
            }>()

            expect($_branches).toStrictEqual({
              _1: "Too small",
              _2: {
                active: null,
                branches: {
                  _3: true,
                  _4: null,
                },
              },
            })

            return {
              _1: ($_branches_1) => {
                expectTypeOf($_branches_1).toEqualTypeOf<null | string>()
                expect($_branches_1).toBeNull()

                return "Too short"
              },

              _2: ($_branches_2) => {
                expectTypeOf($_branches_2).toEqualTypeOf<{
                  readonly active: null | ReadonlyArray<string>
                  readonly branches: {
                    readonly _3: null | boolean
                    readonly _4: null | number
                  }
                }>()

                expect($_branches_2).toStrictEqual({
                  active: null,
                  branches: {
                    _3: true,
                    _4: null,
                  },
                })

                return {
                  active: ($_branches_2_active) => {
                    expectTypeOf(
                      $_branches_2_active,
                    ).toEqualTypeOf<null | ReadonlyArray<string>>()
                    expect($_branches_2_active).toBeNull()

                    return null
                  },

                  branches: ($_branches_2_branches) => {
                    expectTypeOf($_branches_2_branches).toEqualTypeOf<{
                      readonly _3: null | boolean
                      readonly _4: null | number
                    }>()

                    expect($_branches_2_branches).toStrictEqual({
                      _3: true,
                      _4: null,
                    })

                    return {
                      _3: ($_branches_2_branches_3) => {
                        expectTypeOf($_branches_2_branches_3).toEqualTypeOf<
                          null | boolean
                        >()
                        expect($_branches_2_branches_3).toBe(true)

                        return false
                      },
                      _4: ($_branches_2_branches_4) => {
                        expectTypeOf($_branches_2_branches_4).toEqualTypeOf<
                          null | number
                        >()
                        expect($_branches_2_branches_4).toBeNull()

                        return 0
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
                  readonly value: null | string
                }
              | {
                  readonly kind: "_2"
                  readonly value: {
                    readonly active: null | ReadonlyArray<string>
                    readonly branches: {
                      readonly _3: null | boolean
                      readonly _4: null | number
                    }
                  }
                }
            >()

            expect($_branch).toStrictEqual({
              kind: "_2",
              value: {
                active: null,
                branches: {
                  _3: false, // the value is set in $_branches_2_branches_3 ^
                  _4: 0, // the value is set in $_branches_2_branches_4 ^
                },
              },
            })

            return {
              kind: "_2",
              value: ($_branch_2) => {
                expectTypeOf($_branch_2).toEqualTypeOf<{
                  readonly active: null | ReadonlyArray<string>
                  readonly branches: {
                    readonly _3: null | boolean
                    readonly _4: null | number
                  }
                }>()

                expect($_branch_2).toStrictEqual({
                  active: null,
                  branches: {
                    _3: false,
                    _4: 0,
                  },
                })

                return {
                  active: ($_branch_2_active) => {
                    expectTypeOf(
                      $_branch_2_active,
                    ).toEqualTypeOf<null | ReadonlyArray<string>>()
                    expect($_branch_2_active).toBeNull()

                    return null
                  },

                  branches: ($_branch_2_branches) => {
                    expectTypeOf($_branch_2_branches).toEqualTypeOf<{
                      readonly _3: null | boolean
                      readonly _4: null | number
                    }>()

                    expect($_branch_2_branches).toStrictEqual({
                      _3: false,
                      _4: 0,
                    })

                    return {
                      _3: ($_branch_2_branches_3) => {
                        expectTypeOf($_branch_2_branches_3).toEqualTypeOf<
                          null | boolean
                        >()
                        expect($_branch_2_branches_3).toBe(false)

                        return true
                      },
                      _4: ($_branch_2_branches_4) => {
                        expectTypeOf($_branch_2_branches_4).toEqualTypeOf<
                          null | number
                        >()
                        expect($_branch_2_branches_4).toBe(0)

                        return 1
                      },
                    }
                  },

                  branch: ($_branch_2_branch) => {
                    expectTypeOf($_branch_2_branch).toEqualTypeOf<
                      | {
                          readonly kind: "_3"
                          readonly value: null | boolean
                        }
                      | {
                          readonly kind: "_4"
                          readonly value: null | number
                        }
                    >()
                    // the value is set in $_branch_2_branches_3 ^
                    expect($_branch_2_branch).toStrictEqual({
                      kind: "_3",
                      value: true,
                    })

                    return {
                      kind: "_4",
                      value: ($_branch_2_branch_4) => {
                        expectTypeOf($_branch_2_branch_4).toEqualTypeOf<
                          null | number
                        >()
                        expect($_branch_2_branch_4).toBe(1) // the value is set in $_branch_2_branches_4 ^

                        return 3
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
          _1: "Too short",
          _2: {
            active: null,
            branches: {
              _3: true,
              _4: 3,
            },
          },
        },
      })
    })
  })
})
