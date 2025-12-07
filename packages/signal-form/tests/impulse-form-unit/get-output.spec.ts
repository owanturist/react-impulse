import { z } from "zod"

import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { params } from "~/tools/params"

import {
  ImpulseFormUnit,
  type ImpulseFormUnitSchemaOptions,
  type ImpulseFormUnitValidatedOptions,
  type Result,
} from "../../src"

it("matches type signature", ({ monitor }) => {
  const value = ImpulseFormUnit("1", {
    schema: z.string().max(1),
    validateOn: "onInit",
  })

  expect(value.getOutput(monitor)).toBe("1")
  expect(value.getOutput(monitor, params._first)).toBe("1")
  expect(value.getOutput(monitor, params._second)).toBe("1")

  value.setInput("12")
  expect(value.getOutput(monitor)).toBeNull()
  expect(value.getOutput(monitor, params._first)).toBeNull()
  expect(value.getOutput(monitor, params._second)).toBeNull()

  expectTypeOf(value.getOutput(monitor)).toEqualTypeOf<null | string>()
  expectTypeOf(value.getOutput(monitor, params._first)).toEqualTypeOf<null | string>()
  expectTypeOf(value.getOutput(monitor, params._second)).toEqualTypeOf<null | string>()
})

describe("when neither schema nor initial error are defined", () => {
  function setup() {
    return ImpulseFormUnit<string, number>("1")
  }

  it("returns input value", ({ monitor }) => {
    const value = setup()
    const output = value.getOutput(monitor)

    expect(output).toBe("1")
    expectTypeOf(output).toEqualTypeOf<null | string>()
  })

  it("updates via input change", ({ monitor }) => {
    const value = setup()

    value.setInput("2")
    expect(value.getOutput(monitor)).toBe("2")
  })

  it("returns null after error is set", ({ monitor }) => {
    const value = setup()

    value.setError(2)
    expect(value.getOutput(monitor)).toBeNull()
  })

  it("selects unequal output values when isInputEqual is not specified", ({ monitor }) => {
    const value = ImpulseFormUnit(["1"])

    const output0 = value.getOutput(monitor)

    value.setInput(["1"])
    const output1 = value.getOutput(monitor)

    expect(output0).not.toBe(output1)
    expect(output0).toStrictEqual(output1)
  })

  it("selects equal output values when isInputEqual is specified", ({ monitor }) => {
    const value = ImpulseFormUnit(["1"], {
      isInputEqual: isShallowArrayEqual,
    })

    const output0 = value.getOutput(monitor)

    value.setInput(["1"])
    const output1 = value.getOutput(monitor)

    expect(output0).toBe(output1)
    expect(output0).toStrictEqual(output1)
  })
})

describe("when initial error is defined", () => {
  function setup() {
    return ImpulseFormUnit("1", { error: 2 })
  }

  it("returns null", ({ monitor }) => {
    const value = setup()
    const output = value.getOutput(monitor)

    expect(output).toBeNull()
    expectTypeOf(output).toEqualTypeOf<null | string>()
  })

  it("ignores the input change", ({ monitor }) => {
    const value = setup()

    value.setInput("2")
    expect(value.getOutput(monitor)).toBeNull()
  })

  it("returns output after error is reset", ({ monitor }) => {
    const value = setup()

    value.setError(null)
    expect(value.getOutput(monitor)).toBe("1")
  })

  it("returns null after error is changed", ({ monitor }) => {
    const value = setup()

    value.setError(3)
    expect(value.getOutput(monitor)).toBeNull()
  })

  it("selects same output value between error flips when isInputEqual is not specified", ({
    monitor,
  }) => {
    const value = ImpulseFormUnit(["1"], {
      error: 2,
    })

    const output0 = value.getOutput(monitor)
    expect(output0).toBeNull()

    value.setError(null)
    const output1 = value.getOutput(monitor)
    expect(output1).not.toBeNull()

    value.setError(3)
    const output2 = value.getOutput(monitor)
    expect(output2).toBeNull()

    value.setError(null)
    const output3 = value.getOutput(monitor)
    expect(output3).not.toBeNull()

    expect(output3).toBe(output1)
    expect(output3).toStrictEqual(output1)
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

  it("returns output before validation", ({ monitor }) => {
    const value = setup("123")
    const output = value.getOutput(monitor)

    expectTypeOf(output).toEqualTypeOf<null | number>()
    expect(output).toBe(3)
  })

  it("returns output after validation", ({ monitor }) => {
    const value = setup("123", { validateOn: "onInit" })
    const output = value.getOutput(monitor)

    expect(output).toBe(3)
  })

  it("returns null before validation when error is specified", ({ monitor }) => {
    const value = setup("1", { validateOn: "onInit", error: 2 })

    const output0 = value.getOutput(monitor)
    expect(output0).toBeNull()

    value.setError(null)
    const output1 = value.getOutput(monitor)
    expect(output1).toBe(1)
  })

  it("returns null after validation when error is set", ({ monitor }) => {
    const value = setup("1", { validateOn: "onInit" })

    const output0 = value.getOutput(monitor)
    expect(output0).toBe(1)

    value.setError(4)
    const output1 = value.getOutput(monitor)
    expect(output1).toBeNull()

    value.setError(null)
    const output2 = value.getOutput(monitor)
    expect(output2).toBe(1)
  })

  it("selects unequal output values when isOutputEqual is not specified", ({ monitor }) => {
    const value = ImpulseFormUnit(1, {
      transform: (input) => ({ isPositive: input > 0 }),
    })

    const output0 = value.getOutput(monitor)

    value.setInput(2)

    const output1 = value.getOutput(monitor)

    expect(output0).not.toBe(output1)
    expect(output0).toStrictEqual(output1)
  })

  it("selects equal output values when isOutputEqual is specified", ({ monitor }) => {
    const value = ImpulseFormUnit(1 as number, {
      transform: (input) => ({ isPositive: input > 0 }),
      isOutputEqual: (left, right) => left.isPositive === right.isPositive,
    })

    const output0 = value.getOutput(monitor)

    value.setInput(2)

    const output1 = value.getOutput(monitor)

    expect(output0).toBe(output1)
    expect(output0).toStrictEqual(output1)
  })
})

describe("when validator is defined", () => {
  function setup(initial = "", options?: Partial<ImpulseFormUnitValidatedOptions<string, number>>) {
    return ImpulseFormUnit(initial, {
      validate: (input) => (input.length > 0 ? [null, input] : [1, null]),
      ...options,
    })
  }

  it("returns valid output before validation", ({ monitor }) => {
    const value = setup("123")
    const output = value.getOutput(monitor)

    expectTypeOf(output).toEqualTypeOf<null | string>()
    expect(output).toBe("123")
  })

  it("returns null for invalid input before validation", ({ monitor }) => {
    const value = setup()
    const output = value.getOutput(monitor)

    expect(output).toBeNull()
  })

  it("returns valid output after validation", ({ monitor }) => {
    const value = setup("123", { validateOn: "onInit" })
    const output = value.getOutput(monitor)

    expect(output).toBe("123")
  })

  it("returns null for invalid input after validation", ({ monitor }) => {
    const value = setup("", { validateOn: "onInit" })
    const output = value.getOutput(monitor)

    expect(output).toBeNull()
  })

  it("returns null for valid input before validation when error is specified", ({ monitor }) => {
    const value = setup("1", { validateOn: "onInit", error: 2 })

    const output0 = value.getOutput(monitor)
    expect(output0).toBeNull()

    value.setError(null)
    const output1 = value.getOutput(monitor)
    expect(output1).toBe("1")
  })

  it("returns null for valid input after validation when error is set", ({ monitor }) => {
    const value = setup("1", { validateOn: "onInit" })

    const output0 = value.getOutput(monitor)
    expect(output0).toBe("1")

    value.setError(4)
    const output1 = value.getOutput(monitor)
    expect(output1).toBeNull()

    value.setError(null)
    const output2 = value.getOutput(monitor)
    expect(output2).toBe("1")
  })

  it("selects unequal output values when isOutputEqual is not specified", ({ monitor }) => {
    const value = ImpulseFormUnit(1, {
      validate: (input): Result<string, { isPositive: boolean }> =>
        input > 0 ? [null, { isPositive: true }] : ["error", null],
    })

    const output0 = value.getOutput(monitor)

    value.setInput(2)

    const output1 = value.getOutput(monitor)

    expect(output0).not.toBe(output1)
    expect(output0).toStrictEqual(output1)
  })

  it("selects equal output values when isOutputEqual is specified", ({ monitor }) => {
    const value = ImpulseFormUnit(1, {
      validate: (input): Result<string, { isPositive: boolean }> =>
        input > 0 ? [null, { isPositive: true }] : ["error", null],
      isOutputEqual: (left, right) => left.isPositive === right.isPositive,
    })

    const output0 = value.getOutput(monitor)

    value.setInput(2)

    const output1 = value.getOutput(monitor)

    expect(output0).toBe(output1)
    expect(output0).toStrictEqual(output1)
  })
})

describe("when schema is defined", () => {
  function setup(initial = 1, options?: Partial<ImpulseFormUnitSchemaOptions<number>>) {
    return ImpulseFormUnit(initial, { schema: z.number().min(2), ...options })
  }

  it("returns valid output before validation", ({ monitor }) => {
    const value = setup(3)
    const output = value.getOutput(monitor)

    expectTypeOf(output).toEqualTypeOf<null | number>()
    expect(output).toBe(3)
  })

  it("returns null for invalid input before validation", ({ monitor }) => {
    const value = setup()
    const output = value.getOutput(monitor)

    expect(output).toBeNull()
  })

  it("returns valid output after validation", ({ monitor }) => {
    const value = setup(3, { validateOn: "onInit" })
    const output = value.getOutput(monitor)

    expect(output).toBe(3)
  })

  it("returns null for invalid input after validation", ({ monitor }) => {
    const value = setup(1, { validateOn: "onInit" })
    const output = value.getOutput(monitor)

    expect(output).toBeNull()
  })

  it("returns null for valid input before validation when error is specified", ({ monitor }) => {
    const value = setup(3, { validateOn: "onInit", error: ["custom error"] })

    const output0 = value.getOutput(monitor)
    expect(output0).toBeNull()

    value.setError(null)
    const output1 = value.getOutput(monitor)
    expect(output1).toBe(3)
  })

  it("returns null for valid input after validation when error is set", ({ monitor }) => {
    const value = setup(4, { validateOn: "onInit" })

    const output0 = value.getOutput(monitor)
    expect(output0).toBe(4)

    value.setError(["error"])
    const output1 = value.getOutput(monitor)
    expect(output1).toBeNull()

    value.setError(null)
    const output2 = value.getOutput(monitor)
    expect(output2).toBe(4)
  })

  it("selects unequal output values when isOutputEqual is not specified", ({ monitor }) => {
    const value = ImpulseFormUnit(4, {
      schema: z
        .number()
        .min(2)
        .transform((number) => ({ isPositive: number > 2 })),
    })

    const output0 = value.getOutput(monitor)

    value.setInput(8)

    const output1 = value.getOutput(monitor)

    expect(output0).not.toBe(output1)
    expect(output0).toStrictEqual(output1)
  })

  it("selects equal output values when isOutputEqual is specified", ({ monitor }) => {
    const value = ImpulseFormUnit(4, {
      schema: z
        .number()
        .min(2)
        .transform((number) => ({ isPositive: number > 2 })),
      isOutputEqual: (left, right) => left.isPositive === right.isPositive,
    })

    const output0 = value.getOutput(monitor)

    value.setInput(8)

    const output1 = value.getOutput(monitor)

    expect(output0).toBe(output1)
    expect(output0).toStrictEqual(output1)
  })
})

describe("when ZodLikeSchema is used", () => {
  describe.each([
    [
      "get errors()",
      {
        get errors() {
          return [{ message: "error message #1" }, { message: "error message #2" }]
        },
      },
    ],
    [
      "errors",
      {
        errors: [{ message: "error message #1" }, { message: "error message #2" }],
      },
    ],
    [
      "issues",
      {
        issues: [{ message: "error message #1" }, { message: "error message #2" }],
      },
    ],
  ])("when using ZodLikeSchema#safeParse() with ZodLikeError#%s", (_, error) => {
    function setup(initial = "", options?: Partial<ImpulseFormUnitSchemaOptions<string, number>>) {
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

    it("returns valid output before validation", ({ monitor }) => {
      const value = setup("123")
      const output = value.getOutput(monitor)

      expectTypeOf(output).toEqualTypeOf<null | number>()
      expect(output).toBe(3)
    })

    it("returns null for invalid input before validation", ({ monitor }) => {
      const value = setup()
      const output = value.getOutput(monitor)

      expect(output).toBeNull()
    })

    it("returns valid output after validation", ({ monitor }) => {
      const value = setup("123", { validateOn: "onInit" })
      const output = value.getOutput(monitor)

      expect(output).toBe(3)
    })

    it("returns null for invalid input after validation", ({ monitor }) => {
      const value = setup("", { validateOn: "onInit" })
      const output = value.getOutput(monitor)

      expect(output).toBeNull()
    })
  })

  describe("when using ZodLikeSchema#parse()", () => {
    it("returns null when throwing Error", ({ monitor }) => {
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

      expect(value.getOutput(monitor)).toBe(1)

      value.setInput(-1)
      expect(value.getOutput(monitor)).toBeNull()
    })

    describe.each([
      [
        "get errors()",
        {
          get errors() {
            return [{ message: "error message #1" }, { message: "error message #2" }]
          },
        },
      ],
      [
        "errors",
        {
          errors: [{ message: "error message #1" }, { message: "error message #2" }],
        },
      ],
      [
        "issues",
        {
          issues: [{ message: "error message #1" }, { message: "error message #2" }],
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

      it("returns valid output before validation", ({ monitor }) => {
        const value = setup("123")
        const output = value.getOutput(monitor)

        expectTypeOf(output).toEqualTypeOf<null | number>()
        expect(output).toBe(3)
      })

      it("returns null for invalid input before validation", ({ monitor }) => {
        const value = setup()
        const output = value.getOutput(monitor)

        expect(output).toBeNull()
      })

      it("returns valid output after validation", ({ monitor }) => {
        const value = setup("123", { validateOn: "onInit" })
        const output = value.getOutput(monitor)

        expect(output).toBe(3)
      })

      it("returns null for invalid input after validation", ({ monitor }) => {
        const value = setup("", { validateOn: "onInit" })
        const output = value.getOutput(monitor)

        expect(output).toBeNull()
      })
    })

    it("returns null for ZodLikeIssue without the message: string property", ({ monitor }) => {
      const value = ImpulseFormUnit(1, {
        validateOn: "onInit",
        schema: {
          parse(input: number) {
            if (input >= 0) {
              return input
            }

            // biome-ignore lint/style/useThrowOnlyError: for testing purposes
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

      expect(value.getOutput(monitor)).toBe(1)

      value.setInput(-1)
      expect(value.getOutput(monitor)).toBeNull()
    })

    it("returns null if ZodLikeError does not have errors|issues properties", ({ monitor }) => {
      const value = ImpulseFormUnit(1, {
        validateOn: "onInit",
        schema: {
          parse(value: number) {
            if (value >= 0) {
              return value
            }

            // biome-ignore lint/style/useThrowOnlyError: for testing purposes
            throw { anything: [] }
          },
        },
      })

      expect(value.getOutput(monitor)).toBe(1)

      value.setInput(-1)
      expect(value.getOutput(monitor)).toBeNull()
    })

    it("returns null if ZodLikeError is not an object", ({ monitor }) => {
      const value = ImpulseFormUnit(1, {
        validateOn: "onInit",
        schema: {
          parse(input: number) {
            if (input >= 0) {
              return input
            }

            // biome-ignore lint/style/useThrowOnlyError: for testing purposes
            throw "error"
          },
        },
      })

      expect(value.getOutput(monitor)).toBe(1)

      value.setInput(-1)
      expect(value.getOutput(monitor)).toBeNull()
    })

    it("returns null for proxied ZodSchema#parse()", ({ monitor }) => {
      const value = ImpulseFormUnit(1, {
        validateOn: "onInit",
        schema: {
          parse(input) {
            return z.number().min(0).parse(input)
          },
        },
      })

      expect(value.getOutput(monitor)).toBe(1)

      value.setInput(-1)
      expect(value.getOutput(monitor)).toBeNull()
    })
  })
})
