import z from "zod"

import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormOptional,
  type ImpulseFormOptionalErrorSetter,
  type ImpulseFormOptionalOptions,
  ImpulseFormShape,
  ImpulseFormUnit,
  type Result,
  type ValidateStrategy,
} from "../../src"

describe("types", () => {
  const enabled = ImpulseFormUnit(0, {
    validate: (input): Result<number, boolean> => {
      return input > 0 ? [null, input % 2 === 0] : [0, null]
    },
  })
  const element = ImpulseFormShape({
    _0: ImpulseFormUnit(0, {
      schema: z.number(),
    }),
    _1: ImpulseFormUnit("0", {
      transform: (input) => input.length,
    }),
    _2: ImpulseFormUnit(true),
  })

  const form = ImpulseFormOptional(enabled, element)

  type ErrorSchema = null | {
    readonly enabled: null | number
    readonly element: null | {
      readonly _0: null | ReadonlyArray<string>
      readonly _1: null
      readonly _2: null
    }
  }

  interface ErrorVerboseSchema {
    readonly enabled: null | number
    readonly element: {
      readonly _0: null | ReadonlyArray<string>
      readonly _1: null
      readonly _2: null
    }
  }

  type ErrorOnSetter = Setter<
    null | {
      readonly enabled?: Setter<null | number>
      readonly element?: Setter<
        null | {
          readonly _0?: Setter<null | ReadonlyArray<string>>
          readonly _1?: Setter<null>
          readonly _2?: Setter<null>
        },
        [
          {
            readonly _0: null | ReadonlyArray<string>
            readonly _1: null
            readonly _2: null
          },
        ]
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

  it("ensures ImpulseFormOptionalOptions.error type", () => {
    const form = ImpulseFormOptional(enabled, element, {
      error: {
        // @ts-expect-error should be null | number
        enabled: "",
        element: {
          // @ts-expect-error should be null | ReadonlyArray<string>
          _0: "",
          // @ts-expect-error should be null
          _1: false,
        },
      },
    } satisfies ImpulseFormOptionalOptions<typeof enabled, typeof element>)

    expectTypeOf(form).not.toBeUndefined()
  })

  describe("nested", () => {
    const parent = ImpulseFormOptional(
      ImpulseFormUnit("", {
        schema: z.string().transform((input) => !input),
      }),
      form,
    )

    type ParentErrorSchema = null | {
      readonly enabled: null | ReadonlyArray<string>
      readonly element: ErrorSchema
    }

    interface ParentErrorVerboseSchema {
      readonly enabled: null | ReadonlyArray<string>
      readonly element: ErrorVerboseSchema
    }

    type ParentErrorSetter = Setter<
      null | {
        readonly enabled?: Setter<null | ReadonlyArray<string>>
        readonly element?: ErrorOnSetter
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
  })
})

describe.each([
  "onTouch" as const,
  "onChange" as const,
  "onSubmit" as const,
  "onInit" as const,
])("when any validateOn (%s)", (validateOn) => {
  it("selects only the enables's error when it has an error", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, {
        schema: z.boolean(),
        error: ["custom"],
      }),
      ImpulseFormUnit(0, {
        error: 123,
      }),
      {
        validateOn,
      },
    )

    const concise = {
      enabled: ["custom"],
      element: null,
    }

    expect(form.getError(scope)).toStrictEqual(concise)
    expect(form.getError(scope, params._first)).toStrictEqual(concise)
    expect(form.getError(scope, params._second)).toStrictEqual({
      enabled: ["custom"],
      element: 123,
    })
  })

  it("selects the custom error regardless of the validate strategy", ({
    scope,
  }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, {
        schema: z.boolean(),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit(true, {
          schema: z.boolean(),
        }),
        ImpulseFormUnit("0", {
          error: true,
        }),
      ),
      {
        validateOn,
      },
    )

    const error = {
      enabled: null,
      element: {
        enabled: null,
        element: true,
      },
    }

    expect(form.getError(scope)).toStrictEqual(error)
    expect(form.getError(scope, params._first)).toStrictEqual(error)
    expect(form.getError(scope, params._second)).toStrictEqual(error)
  })
})

describe.each(["onTouch" as const, "onChange" as const, "onSubmit" as const])(
  "when runtime validateOn (%s)",
  (validateOn) => {
    it("selects null for validating error", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(true, {
          validateOn,
          schema: z.boolean(),
        }),
        ImpulseFormOptional(
          ImpulseFormUnit(true, {
            validateOn,
            schema: z.boolean(),
          }),
          ImpulseFormUnit("0", {
            validateOn,
            schema: z.string(),
          }),
        ),
      )

      expect(form.getError(scope)).toBeNull()
      expect(form.getError(scope, params._first)).toBeNull()
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: null,
        element: {
          enabled: null,
          element: null,
        },
      })
    })
  },
)

describe("when after trigger", () => {
  function setup(validateOn: ValidateStrategy) {
    return ImpulseFormOptional(
      ImpulseFormUnit(true, {
        validateOn,
        schema: z.boolean(),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit(true, {
          validateOn,
          schema: z.boolean(),
        }),
        ImpulseFormUnit("0", {
          validateOn,
          schema: z.number(),
        }),
      ),
    )
  }

  describe.each<
    [
      ValidateStrategy,
      trigger?: (form: ReturnType<typeof setup>) => void | Promise<void>,
    ]
  >([
    ["onInit" as const],

    [
      "onChange" as const,
      (form) => {
        form.setInput({
          element: {
            element: "123",
          },
        })
      },
    ],

    [
      "onTouch" as const,
      (form) => {
        form.setTouched({
          element: {
            element: true,
          },
        })
      },
    ],

    [
      "onSubmit" as const,
      async (form) => {
        await form.submit()
      },
    ],
  ])("when validateOn=%s", (validateOn, trigger) => {
    describe("when enabled", () => {
      it("selects element's validating errors when units become dirty", async ({
        scope,
      }) => {
        const form = setup(validateOn)

        await trigger?.(form)

        const error = {
          enabled: null,
          element: {
            enabled: null,
            element: [expect.any(String)],
          },
        }

        expect(form.getError(scope)).toStrictEqual(error)
        expect(form.getError(scope, params._first)).toStrictEqual(error)
        expect(form.getError(scope, params._second)).toStrictEqual(error)
      })
    })
  })
})

describe("when defining top-level concise ImpulseFormOptionalOptions.error", () => {
  const validateOn = "onInit" as const

  describe("when enabled", () => {
    it("overrides all errors", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(true, {
          validateOn,
          error: ["custom"],
          schema: z.boolean(),
        }),
        ImpulseFormOptional(
          ImpulseFormUnit(true, {
            validateOn,
            error: ["custom_2"],
            schema: z.boolean(),
          }),
          ImpulseFormUnit("0", {
            validateOn,
            error: ["custom_3"],
            schema: z.string(),
          }),
        ),
        {
          error: null,
        },
      )

      expect(form.getError(scope)).toBeNull()
      expect(form.getError(scope, params._first)).toBeNull()
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: null,
        element: {
          enabled: null,
          element: null,
        },
      })
    })
  })

  describe("when disabled", () => {
    it("overrides only the enabled's error", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(false, {
          validateOn,
          error: ["custom"],
          schema: z.boolean(),
        }),
        ImpulseFormOptional(
          ImpulseFormUnit(true, {
            validateOn,
            error: ["custom_2"],
            schema: z.boolean(),
          }),
          ImpulseFormUnit("0", {
            validateOn,
            error: ["custom_3"],
            schema: z.string(),
          }),
        ),
        {
          error: null,
        },
      )

      expect(form.getError(scope)).toBeNull()
      expect(form.getError(scope, params._first)).toBeNull()
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: null,
        element: {
          enabled: ["custom_2"],
          element: ["custom_3"],
        },
      })
    })
  })

  describe("when enabled is invalid", () => {
    it("overrides only the enabled's error", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit("", {
          validateOn,
          error: ["custom"],
          schema: z.boolean(),
        }),
        ImpulseFormOptional(
          ImpulseFormUnit(true, {
            validateOn,
            error: ["custom_2"],
            schema: z.boolean(),
          }),
          ImpulseFormUnit("0", {
            validateOn,
            error: ["custom_3"],
            schema: z.string(),
          }),
        ),
        {
          error: null,
        },
      )

      const concise = {
        enabled: [expect.stringContaining("Invalid input")],
        element: null,
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: [expect.stringContaining("Invalid input")],
        element: {
          enabled: ["custom_2"],
          element: ["custom_3"],
        },
      })
    })
  })
})

describe("when defining ImpulseFormOptionalOptions.error.enabled", () => {
  const validateOn = "onInit" as const

  describe("when enabled", () => {
    it("overrides only the enabled's error", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(true, {
          validateOn,
          error: ["custom"],
          schema: z.boolean(),
        }),
        ImpulseFormOptional(
          ImpulseFormUnit(true, {
            validateOn,
            error: ["custom_2"],
            schema: z.boolean(),
          }),
          ImpulseFormUnit("0", {
            validateOn,
            error: ["custom_3"],
            schema: z.string(),
          }),
        ),
        {
          error: {
            enabled: null,
          },
        },
      )

      const concise = {
        enabled: null,
        element: {
          enabled: ["custom_2"],
          element: null,
        },
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: null,
        element: {
          enabled: ["custom_2"],
          element: ["custom_3"],
        },
      })
    })
  })

  describe("when disabled", () => {
    it("overrides only the enabled's error", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(false, {
          validateOn,
          error: ["custom"],
          schema: z.boolean(),
        }),
        ImpulseFormOptional(
          ImpulseFormUnit(true, {
            validateOn,
            error: ["custom_2"],
            schema: z.boolean(),
          }),
          ImpulseFormUnit("0", {
            validateOn,
            error: ["custom_3"],
            schema: z.string(),
          }),
        ),
        {
          error: {
            enabled: null,
          },
        },
      )

      expect(form.getError(scope)).toBeNull()
      expect(form.getError(scope, params._first)).toBeNull()
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: null,
        element: {
          enabled: ["custom_2"],
          element: ["custom_3"],
        },
      })
    })
  })

  describe("when enabled is invalid", () => {
    it("overrides only the enabled's error", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit("", {
          validateOn,
          error: ["custom"],
          schema: z.boolean(),
        }),
        ImpulseFormOptional(
          ImpulseFormUnit(true, {
            validateOn,
            error: ["custom_2"],
            schema: z.boolean(),
          }),
          ImpulseFormUnit("0", {
            validateOn,
            error: ["custom_3"],
            schema: z.string(),
          }),
        ),
        {
          error: {
            enabled: null,
          },
        },
      )

      const concise = {
        enabled: [expect.stringContaining("Invalid input")],
        element: null,
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: [expect.stringContaining("Invalid input")],
        element: {
          enabled: ["custom_2"],
          element: ["custom_3"],
        },
      })
    })
  })
})

describe("when defining ImpulseFormOptionalOptions.error.element", () => {
  const validateOn = "onInit" as const

  describe("when enabled", () => {
    it("overrides only the element's error", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(true, {
          validateOn,
          schema: z.boolean(),
        }),
        ImpulseFormOptional(
          ImpulseFormUnit(true, {
            validateOn,
            error: ["custom_2"],
            schema: z.boolean(),
          }),
          ImpulseFormUnit("0", {
            validateOn,
            error: ["custom_3"],
            schema: z.string(),
          }),
        ),
        {
          error: {
            element: null,
          },
        },
      )

      expect(form.getError(scope)).toBeNull()
      expect(form.getError(scope, params._first)).toBeNull()
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: null,
        element: {
          enabled: null,
          element: null,
        },
      })
    })

    it("overrides nested optional", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(true, {
          validateOn,
          schema: z.boolean(),
        }),
        ImpulseFormOptional(
          ImpulseFormUnit(true, {
            validateOn,
            error: ["custom_2"],
            schema: z.boolean(),
          }),
          ImpulseFormUnit("0", {
            validateOn,
            error: ["custom_3"],
            schema: z.string(),
          }),
        ),
        {
          error: {
            element: {
              element: null,
            },
          },
        },
      )

      const concise = {
        enabled: null,
        element: {
          enabled: ["custom_2"],
          element: null,
        },
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: null,
        element: {
          enabled: ["custom_2"],
          element: null,
        },
      })
    })
  })

  describe("when disabled", () => {
    it("overrides only the element's error", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(false, {
          validateOn,
          schema: z.boolean(),
        }),
        ImpulseFormOptional(
          ImpulseFormUnit(true, {
            validateOn,
            error: ["custom_2"],
            schema: z.boolean(),
          }),
          ImpulseFormUnit("0", {
            validateOn,
            error: ["custom_3"],
            schema: z.string(),
          }),
        ),
        {
          error: {
            element: null,
          },
        },
      )

      expect(form.getError(scope)).toBeNull()
      expect(form.getError(scope, params._first)).toBeNull()
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: null,
        element: {
          enabled: null,
          element: null,
        },
      })
    })

    it("overrides nested optional", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(false, {
          validateOn,
          schema: z.boolean(),
        }),
        ImpulseFormOptional(
          ImpulseFormUnit(true, {
            validateOn,
            error: ["custom_2"],
            schema: z.boolean(),
          }),
          ImpulseFormUnit("0", {
            validateOn,
            error: ["custom_3"],
            schema: z.string(),
          }),
        ),
        {
          error: {
            element: {
              element: null,
            },
          },
        },
      )

      expect(form.getError(scope)).toBeNull()
      expect(form.getError(scope, params._first)).toBeNull()
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: null,
        element: {
          enabled: ["custom_2"],
          element: null,
        },
      })
    })
  })

  describe("when active is invalid", () => {
    it("overrides only the element's error", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit("", {
          validateOn,
          schema: z.boolean(),
        }),
        ImpulseFormOptional(
          ImpulseFormUnit(true, {
            validateOn,
            error: ["custom_2"],
            schema: z.boolean(),
          }),
          ImpulseFormUnit("0", {
            validateOn,
            error: ["custom_3"],
            schema: z.string(),
          }),
        ),
        {
          error: {
            element: null,
          },
        },
      )

      const concise = {
        enabled: [expect.stringContaining("Invalid input")],
        element: null,
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: [expect.stringContaining("Invalid input")],
        element: {
          enabled: null,
          element: null,
        },
      })
    })

    it("overrides nested optional", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit("", {
          validateOn,
          schema: z.boolean(),
        }),
        ImpulseFormOptional(
          ImpulseFormUnit(true, {
            validateOn,
            error: ["custom_2"],
            schema: z.boolean(),
          }),
          ImpulseFormUnit("0", {
            validateOn,
            error: ["custom_3"],
            schema: z.string(),
          }),
        ),
        {
          error: {
            element: {
              element: null,
            },
          },
        },
      )

      const concise = {
        enabled: [expect.stringContaining("Invalid input")],
        element: null,
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: [expect.stringContaining("Invalid input")],
        element: {
          enabled: ["custom_2"],
          element: null,
        },
      })
    })
  })
})

// --------------

describe("stable error value", () => {
  const validateOn = "onInit" as const

  it("subsequently selects equal error", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, {
        validateOn,
        schema: z.boolean(),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit(true, {
          validateOn,
          schema: z.boolean(),
        }),
        ImpulseFormUnit("0", {
          validateOn,
          error: ["custom_3"],
          schema: z.string(),
        }),
      ),
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
  const validateOn = "onInit" as const

  const enabled = ImpulseFormUnit(0, {
    validateOn,
    validate: (input): Result<string, boolean> => {
      if (input < 0) {
        return ["Too small", null]
      }

      return [null, input % 2 === 0]
    },
  })

  const element = ImpulseFormOptional(
    ImpulseFormUnit(true, {
      validateOn,
      schema: z.boolean(),
    }),
    ImpulseFormUnit("0", {
      error: true,
    }),
  )

  function setup(
    options?: ImpulseFormOptionalOptions<typeof enabled, typeof element>,
  ) {
    return ImpulseFormOptional(enabled, element, options)
  }

  describe.each<
    [
      string,
      (
        input: ImpulseFormOptionalErrorSetter<typeof enabled, typeof element>,
      ) => ImpulseFormOptional<typeof enabled, typeof element>,
    ]
  >([
    [
      "ImpulseFormOptionalOptions.error",
      (error) => {
        return setup({ error })
      },
    ],

    [
      "ImpulseFormOptional.setError",
      (setter) => {
        const form = setup()

        form.setError(setter)

        return form
      },
    ],
  ])("in %s", (_, setup) => {
    it("passes initial and input recursively to all setters", ({ scope }) => {
      expect.assertions(8)

      const form = setup(($) => {
        expectTypeOf($).toEqualTypeOf<{
          readonly enabled: null | string
          readonly element: {
            readonly enabled: null | ReadonlyArray<string>
            readonly element: null | boolean
          }
        }>()

        expect($).toStrictEqual({
          enabled: null,
          element: {
            enabled: null,
            element: true,
          },
        })

        return {
          enabled: ($_enabled) => {
            expectTypeOf($_enabled).toEqualTypeOf<null | string>()
            expect($_enabled).toBeNull()

            return "Custom error"
          },

          element: ($_element) => {
            expectTypeOf($_element).toEqualTypeOf<{
              readonly enabled: null | ReadonlyArray<string>
              readonly element: null | boolean
            }>()

            expect($_element).toStrictEqual({
              enabled: null,
              element: true,
            })

            return {
              enabled: ($_element_enabled) => {
                expectTypeOf(
                  $_element_enabled,
                ).toEqualTypeOf<null | ReadonlyArray<string>>()
                expect($_element_enabled).toBeNull()

                return ["custom", "error"]
              },

              element: ($_element_element) => {
                expectTypeOf($_element_element).toEqualTypeOf<null | boolean>()
                expect($_element_element).toBe(true)

                return false
              },
            }
          },
        }
      })

      const concise = {
        enabled: "Custom error",
        element: null,
      }

      expect(form.getError(scope)).toStrictEqual(concise)
      expect(form.getError(scope, params._first)).toStrictEqual(concise)
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: "Custom error",
        element: {
          enabled: ["custom", "error"],
          element: false,
        },
      })
    })
  })
})
