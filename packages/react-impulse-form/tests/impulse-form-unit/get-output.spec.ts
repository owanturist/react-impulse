import { subscribe } from "packages/react-impulse/dist"
import { z } from "zod"

import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { params } from "~/tools/params"

import {
  ImpulseFormUnit,
  type ImpulseFormUnitSchemaOptions,
  type ImpulseFormUnitValidatedOptions,
  type Result,
} from "../../src"

it("matches type signature", ({ scope }) => {
  const value = ImpulseFormUnit("1", {
    schema: z.string().max(1),
    validateOn: "onInit",
  })

  expect(value.getOutput(scope)).toBe("1")
  expect(value.getOutput(scope, params._first)).toBe("1")
  expect(value.getOutput(scope, params._second)).toBe("1")

  value.setInput("12")
  expect(value.getOutput(scope)).toBeNull()
  expect(value.getOutput(scope, params._first)).toBeNull()
  expect(value.getOutput(scope, params._second)).toBeNull()

  expectTypeOf(value.getOutput(scope)).toEqualTypeOf<null | string>()
  expectTypeOf(value.getOutput(scope, params._first)).toEqualTypeOf<
    null | string
  >()
  expectTypeOf(value.getOutput(scope, params._second)).toEqualTypeOf<
    null | string
  >()
})

describe("when neither schema nor initial error are defined", () => {
  function setup() {
    return ImpulseFormUnit<string, number>("1")
  }

  it("returns input value", ({ scope }) => {
    const value = setup()
    const output = value.getOutput(scope)

    expect(output).toBe("1")
    expectTypeOf(output).toEqualTypeOf<null | string>()
  })

  it("updates via input change", ({ scope }) => {
    const value = setup()

    value.setInput("2")
    expect(value.getOutput(scope)).toBe("2")
  })

  it("returns null after error is set", ({ scope }) => {
    const value = setup()

    value.setError(2)
    expect(value.getOutput(scope)).toBeNull()
  })

  it("selects unequal output values when isInputEqual is not specified", ({
    scope,
  }) => {
    const value = ImpulseFormUnit(["1"])

    const output_0 = value.getOutput(scope)

    value.setInput(["1"])
    const output_1 = value.getOutput(scope)

    expect(output_0).not.toBe(output_1)
    expect(output_0).toStrictEqual(output_1)
  })

  it("selects equal output values when isInputEqual is specified", ({
    scope,
  }) => {
    const value = ImpulseFormUnit(["1"], {
      isInputEqual: isShallowArrayEqual,
    })

    const output_0 = value.getOutput(scope)

    value.setInput(["1"])
    const output_1 = value.getOutput(scope)

    expect(output_0).toBe(output_1)
    expect(output_0).toStrictEqual(output_1)
  })
})

describe("when initial error is defined", () => {
  function setup() {
    return ImpulseFormUnit("1", { error: 2 })
  }

  it("returns null", ({ scope }) => {
    const value = setup()
    const output = value.getOutput(scope)

    expect(output).toBeNull()
    expectTypeOf(output).toEqualTypeOf<null | string>()
  })

  it("ignores the input change", ({ scope }) => {
    const value = setup()

    value.setInput("2")
    expect(value.getOutput(scope)).toBeNull()
  })

  it("returns output after error is reset", ({ scope }) => {
    const value = setup()

    value.setError(null)
    expect(value.getOutput(scope)).toBe("1")
  })

  it("returns null after error is changed", ({ scope }) => {
    const value = setup()

    value.setError(3)
    expect(value.getOutput(scope)).toBeNull()
  })

  it("selects same output value between error flips when isInputEqual is not specified", ({
    scope,
  }) => {
    const value = ImpulseFormUnit(["1"], {
      error: 2,
    })

    const output_0 = value.getOutput(scope)
    expect(output_0).toBeNull()

    value.setError(null)
    const output_1 = value.getOutput(scope)
    expect(output_1).not.toBeNull()

    value.setError(3)
    const output_2 = value.getOutput(scope)
    expect(output_2).toBeNull()

    value.setError(null)
    const output_3 = value.getOutput(scope)
    expect(output_3).not.toBeNull()

    expect(output_3).toBe(output_1)
    expect(output_3).toStrictEqual(output_1)
  })
})

describe("when transform is defined", () => {
  function setup(
    initial = "",
    options?: Partial<ImpulseFormUnitValidatedOptions<string, number, number>>,
  ) {
    return ImpulseFormUnit(initial, {
      transform: (input) => input.length,
      ...options,
    })
  }

  it("returns output before validation", ({ scope }) => {
    const value = setup("123")
    const output = value.getOutput(scope)

    expectTypeOf(output).toEqualTypeOf<null | number>()
    expect(output).toBe(3)
  })

  it("returns output after validation", ({ scope }) => {
    const value = setup("123", { validateOn: "onInit" })
    const output = value.getOutput(scope)

    expect(output).toBe(3)
  })

  it("returns null before validation when error is specified", ({ scope }) => {
    const value = setup("1", { validateOn: "onInit", error: 2 })

    const output_0 = value.getOutput(scope)
    expect(output_0).toBeNull()

    value.setError(null)
    const output_1 = value.getOutput(scope)
    expect(output_1).toBe(1)
  })

  it("returns null after validation when error is set", ({ scope }) => {
    const value = setup("1", { validateOn: "onInit" })

    const output_0 = value.getOutput(scope)
    expect(output_0).toBe(1)

    value.setError(4)
    const output_1 = value.getOutput(scope)
    expect(output_1).toBeNull()

    value.setError(null)
    const output_2 = value.getOutput(scope)
    expect(output_2).toBe(1)
  })

  it("selects unequal output values when isOutputEqual is not specified", ({
    scope,
  }) => {
    const value = ImpulseFormUnit(1, {
      transform: (input) => ({ isPositive: input > 0 }),
    })

    const output_0 = value.getOutput(scope)

    value.setInput(2)

    const output_1 = value.getOutput(scope)

    expect(output_0).not.toBe(output_1)
    expect(output_0).toStrictEqual(output_1)
  })

  it("selects equal output values when isOutputEqual is specified", ({
    scope,
  }) => {
    const value = ImpulseFormUnit(1 as number, {
      transform: (input) => ({ isPositive: input > 0 }),
      isOutputEqual: (left, right) => left.isPositive === right.isPositive,
    })

    const output_0 = value.getOutput(scope)

    value.setInput(2)

    const output_1 = value.getOutput(scope)

    expect(output_0).toBe(output_1)
    expect(output_0).toStrictEqual(output_1)
  })
})

describe("when validator is defined", () => {
  function setup(
    initial = "",
    options?: Partial<ImpulseFormUnitValidatedOptions<string, number>>,
  ) {
    return ImpulseFormUnit(initial, {
      validate: (input) => (input.length > 0 ? [null, input] : [1, null]),
      ...options,
    })
  }

  it("returns valid output before validation", ({ scope }) => {
    const value = setup("123")
    const output = value.getOutput(scope)

    expectTypeOf(output).toEqualTypeOf<null | string>()
    expect(output).toBe("123")
  })

  it("returns null for invalid input before validation", ({ scope }) => {
    const value = setup()
    const output = value.getOutput(scope)

    expect(output).toBeNull()
  })

  it("returns valid output after validation", ({ scope }) => {
    const value = setup("123", { validateOn: "onInit" })
    const output = value.getOutput(scope)

    expect(output).toBe("123")
  })

  it("returns null for invalid input after validation", ({ scope }) => {
    const value = setup("", { validateOn: "onInit" })
    const output = value.getOutput(scope)

    expect(output).toBeNull()
  })

  it("returns null for valid input before validation when error is specified", ({
    scope,
  }) => {
    const value = setup("1", { validateOn: "onInit", error: 2 })

    const output_0 = value.getOutput(scope)
    expect(output_0).toBeNull()

    value.setError(null)
    const output_1 = value.getOutput(scope)
    expect(output_1).toBe("1")
  })

  it("returns null for valid input after validation when error is set", ({
    scope,
  }) => {
    const value = setup("1", { validateOn: "onInit" })

    const output_0 = value.getOutput(scope)
    expect(output_0).toBe("1")

    value.setError(4)
    const output_1 = value.getOutput(scope)
    expect(output_1).toBeNull()

    value.setError(null)
    const output_2 = value.getOutput(scope)
    expect(output_2).toBe("1")
  })

  it("selects unequal output values when isOutputEqual is not specified", ({
    scope,
  }) => {
    const value = ImpulseFormUnit(1, {
      validate: (input): Result<string, { isPositive: boolean }> => {
        return input > 0 ? [null, { isPositive: true }] : ["error", null]
      },
    })

    const output_0 = value.getOutput(scope)

    value.setInput(2)

    const output_1 = value.getOutput(scope)

    expect(output_0).not.toBe(output_1)
    expect(output_0).toStrictEqual(output_1)
  })

  it("selects equal output values when isOutputEqual is specified", ({
    scope,
  }) => {
    const value = ImpulseFormUnit(1, {
      validate: (input): Result<string, { isPositive: boolean }> => {
        return input > 0 ? [null, { isPositive: true }] : ["error", null]
      },
      isOutputEqual: (left, right) => left.isPositive === right.isPositive,
    })

    const output_0 = value.getOutput(scope)

    value.setInput(2)

    const output_1 = value.getOutput(scope)

    expect(output_0).toBe(output_1)
    expect(output_0).toStrictEqual(output_1)
  })
})

describe("when schema is defined", () => {
  function setup(
    initial = 1,
    options?: Partial<ImpulseFormUnitSchemaOptions<number>>,
  ) {
    return ImpulseFormUnit(initial, { schema: z.number().min(2), ...options })
  }

  it("returns valid output before validation", ({ scope }) => {
    const value = setup(3)
    const output = value.getOutput(scope)

    expectTypeOf(output).toEqualTypeOf<null | number>()
    expect(output).toBe(3)
  })

  it("returns null for invalid input before validation", ({ scope }) => {
    const value = setup()
    const output = value.getOutput(scope)

    expect(output).toBeNull()
  })

  it("returns valid output after validation", ({ scope }) => {
    const value = setup(3, { validateOn: "onInit" })
    const output = value.getOutput(scope)

    expect(output).toBe(3)
  })

  it("returns null for invalid input after validation", ({ scope }) => {
    const value = setup(1, { validateOn: "onInit" })
    const output = value.getOutput(scope)

    expect(output).toBeNull()
  })

  it("returns null for valid input before validation when error is specified", ({
    scope,
  }) => {
    const value = setup(3, { validateOn: "onInit", error: ["custom error"] })

    const output_0 = value.getOutput(scope)
    expect(output_0).toBeNull()

    value.setError(null)
    const output_1 = value.getOutput(scope)
    expect(output_1).toBe(3)
  })

  it("returns null for valid input after validation when error is set", ({
    scope,
  }) => {
    const value = setup(4, { validateOn: "onInit" })

    const output_0 = value.getOutput(scope)
    expect(output_0).toBe(4)

    value.setError(["error"])
    const output_1 = value.getOutput(scope)
    expect(output_1).toBeNull()

    value.setError(null)
    const output_2 = value.getOutput(scope)
    expect(output_2).toBe(4)
  })

  it("selects unequal output values when isOutputEqual is not specified", ({
    scope,
  }) => {
    const value = ImpulseFormUnit(4, {
      schema: z
        .number()
        .min(2)
        .transform((number) => ({ isPositive: number > 2 })),
    })

    const output_0 = value.getOutput(scope)

    value.setInput(8)

    const output_1 = value.getOutput(scope)

    expect(output_0).not.toBe(output_1)
    expect(output_0).toStrictEqual(output_1)
  })

  it("selects equal output values when isOutputEqual is specified", ({
    scope,
  }) => {
    const value = ImpulseFormUnit(4, {
      schema: z
        .number()
        .min(2)
        .transform((number) => ({ isPositive: number > 2 })),
      isOutputEqual: (left, right) => left.isPositive === right.isPositive,
    })

    const output_0 = value.getOutput(scope)

    value.setInput(8)

    const output_1 = value.getOutput(scope)

    expect(output_0).toBe(output_1)
    expect(output_0).toStrictEqual(output_1)
  })
})

describe("when ZodLikeSchema is used", () => {
  describe.each([
    [
      "get errors()",
      {
        get errors() {
          return [
            { message: "error message #1" },
            { message: "error message #2" },
          ]
        },
      },
    ],
    [
      "errors",
      {
        errors: [
          { message: "error message #1" },
          { message: "error message #2" },
        ],
      },
    ],
    [
      "issues",
      {
        issues: [
          { message: "error message #1" },
          { message: "error message #2" },
        ],
      },
    ],
  ])(
    "when using ZodLikeSchema#safeParse() with ZodLikeError#%s",
    (_, error) => {
      function setup(
        initial = "",
        options?: Partial<ImpulseFormUnitSchemaOptions<string, number>>,
      ) {
        return ImpulseFormUnit(initial, {
          ...options,
          schema: {
            safeParse(input: string) {
              if (input.length > 0) {
                return { success: true, data: input.length }
              }

              return { success: false, error }
            },
          },
        })
      }

      it("returns valid output before validation", ({ scope }) => {
        const value = setup("123")
        const output = value.getOutput(scope)

        expectTypeOf(output).toEqualTypeOf<null | number>()
        expect(output).toBe(3)
      })

      it("returns null for invalid input before validation", ({ scope }) => {
        const value = setup()
        const output = value.getOutput(scope)

        expect(output).toBeNull()
      })

      it("returns valid output after validation", ({ scope }) => {
        const value = setup("123", { validateOn: "onInit" })
        const output = value.getOutput(scope)

        expect(output).toBe(3)
      })

      it("returns null for invalid input after validation", ({ scope }) => {
        const value = setup("", { validateOn: "onInit" })
        const output = value.getOutput(scope)

        expect(output).toBeNull()
      })
    },
  )

  describe("when using ZodLikeSchema#parse()", () => {
    it("returns null when throwing Error", ({ scope }) => {
      const value = ImpulseFormUnit(1, {
        validateOn: "onInit",
        schema: {
          parse(input: number) {
            if (input >= 0) {
              return input
            }

            throw new Error("error message")
          },
        },
      })

      expect(value.getOutput(scope)).toBe(1)

      value.setInput(-1)
      expect(value.getOutput(scope)).toBeNull()
    })

    describe.each([
      [
        "get errors()",
        {
          get errors() {
            return [
              { message: "error message #1" },
              { message: "error message #2" },
            ]
          },
        },
      ],
      [
        "errors",
        {
          errors: [
            { message: "error message #1" },
            { message: "error message #2" },
          ],
        },
      ],
      [
        "issues",
        {
          issues: [
            { message: "error message #1" },
            { message: "error message #2" },
          ],
        },
      ],
    ])("when messages are in ZodLikeError#%s", (_, error) => {
      function setup(
        initial = "",
        options?: Partial<ImpulseFormUnitSchemaOptions<string, number>>,
      ) {
        return ImpulseFormUnit(initial, {
          ...options,
          schema: {
            parse(input: string) {
              if (input.length > 0) {
                return input.length
              }

              throw error
            },
          },
        })
      }

      it("returns valid output before validation", ({ scope }) => {
        const value = setup("123")
        const output = value.getOutput(scope)

        expectTypeOf(output).toEqualTypeOf<null | number>()
        expect(output).toBe(3)
      })

      it("returns null for invalid input before validation", ({ scope }) => {
        const value = setup()
        const output = value.getOutput(scope)

        expect(output).toBeNull()
      })

      it("returns valid output after validation", ({ scope }) => {
        const value = setup("123", { validateOn: "onInit" })
        const output = value.getOutput(scope)

        expect(output).toBe(3)
      })

      it("returns null for invalid input after validation", ({ scope }) => {
        const value = setup("", { validateOn: "onInit" })
        const output = value.getOutput(scope)

        expect(output).toBeNull()
      })
    })

    it("returns null for ZodLikeIssue without the message: string property", ({
      scope,
    }) => {
      const value = ImpulseFormUnit(1, {
        validateOn: "onInit",
        schema: {
          parse(input: number) {
            if (input >= 0) {
              return input
            }

            throw {
              issues: [
                { message: "error message #1" },
                {},
                [],
                "error",
                { message: {} },
                { message: 1 },
                { message: "error message #2" },
              ],
            }
          },
        },
      })

      expect(value.getOutput(scope)).toBe(1)

      value.setInput(-1)
      expect(value.getOutput(scope)).toBeNull()
    })

    it("returns null if ZodLikeError does not have errors|issues properties", ({
      scope,
    }) => {
      const value = ImpulseFormUnit(1, {
        validateOn: "onInit",
        schema: {
          parse(value: number) {
            if (value >= 0) {
              return value
            }

            throw { anything: [] }
          },
        },
      })

      expect(value.getOutput(scope)).toBe(1)

      value.setInput(-1)
      expect(value.getOutput(scope)).toBeNull()
    })

    it("returns null if ZodLikeError is not an object", ({ scope }) => {
      const value = ImpulseFormUnit(1, {
        validateOn: "onInit",
        schema: {
          parse(input: number) {
            if (input >= 0) {
              return input
            }

            throw "error"
          },
        },
      })

      expect(value.getOutput(scope)).toBe(1)

      value.setInput(-1)
      expect(value.getOutput(scope)).toBeNull()
    })

    it("returns null for proxied ZodSchema#parse()", ({ scope }) => {
      const value = ImpulseFormUnit(1, {
        validateOn: "onInit",
        schema: {
          parse(input) {
            return z.number().min(0).parse(input)
          },
        },
      })

      expect(value.getOutput(scope)).toBe(1)

      value.setInput(-1)
      expect(value.getOutput(scope)).toBeNull()
    })
  })
})

/**
 * bugfix: ImpulseForm.reset() does not run subscribers #969
 *
 * It is a narrowed case of the reported bug.
 *
 * @link https://github.com/owanturist/react-impulse/issues/969
 */
describe("when deriving error from output in subscribe", () => {
  it("assigns error for the first element, resets it, and assigns again", ({
    scope,
  }) => {
    const spy = vi.fn()
    const form = ImpulseFormUnit<number, string, boolean>(1, {
      transform: (x) => x > 0,
    })

    subscribe((scope) => {
      const output = form.getOutput(scope)

      spy(output)

      if (output === false) {
        form.setError("error")
      }
    })

    // initially valid
    expect(spy).toHaveBeenCalledExactlyOnceWith(true)
    expect(form.getError(scope)).toBeNull()
    expect(form.getOutput(scope)).toBe(true)
    spy.mockClear()

    // set invalid value
    form.setInput(-1)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenNthCalledWith(1, false)
    expect(spy).toHaveBeenNthCalledWith(2, null)
    expect(form.getError(scope)).toBe("error")
    expect(form.getOutput(scope)).toBeNull()
    spy.mockClear()

    // set valid value, but error remains so the output has not changed
    form.setInput(1)
    expect(spy).not.toHaveBeenCalled()
    expect(form.getError(scope)).toBe("error")
    expect(form.getOutput(scope)).toBeNull()
    spy.mockClear()

    // reset error
    form.setError(null)
    expect(spy).toHaveBeenCalledExactlyOnceWith(true)
    expect(form.getError(scope)).toBeNull()
    spy.mockClear()

    // set valid value again, which should assign the error again
    form.setInput(1)
    expect(spy).not.toHaveBeenCalled()
    expect(form.getError(scope)).toBe("error")
  })
})
