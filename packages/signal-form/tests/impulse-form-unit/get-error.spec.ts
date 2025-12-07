import { z } from "zod"

import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormUnit,
  type ImpulseFormUnitSchemaOptions,
  type ImpulseFormUnitValidatedOptions,
  type Result,
} from "../../src"

it("selects error", ({ monitor }) => {
  const value = ImpulseFormUnit("1", {
    validateOn: "onInit",
    validate: (input) => (input.length > 1 ? [1, null] : [null, input]),
  })

  const errorDefault = value.getError(monitor)
  expect(errorDefault).toBeNull()
  expectTypeOf(errorDefault).toEqualTypeOf<null | number>()

  const errorConcise = value.getError(monitor, params._first)
  expect(errorConcise).toBeNull()
  expectTypeOf(errorConcise).toEqualTypeOf<null | number>()

  const errorVerbose = value.getError(monitor, params._second)
  expect(errorVerbose).toBeNull()
  expectTypeOf(errorVerbose).toEqualTypeOf<null | number>()

  value.setInput("12")
  expect(value.getError(monitor)).toBe(1)
  expect(value.getError(monitor, params._first)).toBe(1)
  expect(value.getError(monitor, params._second)).toBe(1)
})

describe("when neither schema nor initial error are defined", () => {
  function setup() {
    return ImpulseFormUnit<string, number>("1")
  }

  it("returns null", ({ monitor }) => {
    const value = setup()
    const error = value.getError(monitor)

    expect(error).toBeNull()
    expectTypeOf(error).toEqualTypeOf<null | number>()
  })

  it("sets an error", ({ monitor }) => {
    const value = setup()

    value.setError(2)
    expect(value.getError(monitor)).toBe(2)

    expectTypeOf(value.setError).parameter(0).toEqualTypeOf<Setter<null | number>>()
  })

  it("resets to null", ({ monitor }) => {
    const value = setup()

    value.setError(2)
    value.setError(null)
    expect(value.getError(monitor)).toBeNull()
  })

  it("uses setter value", ({ monitor }) => {
    const value = setup()

    value.setError((error) => (error ?? 1) + 1)
    expect(value.getError(monitor)).toBe(2)
  })
})

describe("when initial error is defined", () => {
  function setup() {
    return ImpulseFormUnit("1", { error: 2 })
  }

  it("returns the initial error", ({ monitor }) => {
    const value = setup()
    const error = value.getError(monitor)

    expect(error).toBe(2)
    expectTypeOf(error).toEqualTypeOf<null | number>()
  })

  it("updates an error", ({ monitor }) => {
    const value = setup()

    value.setError(3)
    expect(value.getError(monitor)).toBe(3)
  })

  it("resets to null", ({ monitor }) => {
    const value = setup()

    value.setError(null)
    expect(value.getError(monitor)).toBeNull()
  })

  it("uses setter value", ({ monitor }) => {
    const value = setup()

    value.setError((error) => error! + 1)
    expect(value.getError(monitor)).toBe(3)
  })

  it("selects unequal error values when isErrorEqual is not specified", ({ monitor }) => {
    const value = ImpulseFormUnit("1", {
      error: ["error"],
    })

    const error0 = value.getError(monitor)

    value.setError(["error"])
    const error1 = value.getError(monitor)

    expect(error0).not.toBe(error1)
    expect(error0).toStrictEqual(error1)
  })

  it("selects equal error values when isErrorEqual is specified", ({ monitor }) => {
    const value = ImpulseFormUnit("1", {
      error: ["error"],
      isErrorEqual: isShallowArrayEqual,
    })

    const error0 = value.getError(monitor)

    value.setError(["error"])
    const error1 = value.getError(monitor)

    expect(error0).toBe(error1)
    expect(error0).toStrictEqual(error1)
  })
})

describe("when validator is defined", () => {
  function setup(options?: Partial<ImpulseFormUnitValidatedOptions<string, number>>) {
    return ImpulseFormUnit("", {
      validate: (input) => (input.length > 0 ? [null, input] : [1, null]),
      ...options,
    })
  }

  it("returns null on init by default", ({ monitor }) => {
    const value = setup()
    const error = value.getError(monitor)

    expectTypeOf(error).toEqualTypeOf<null | number>()
    expect(error).toBeNull()
  })

  it("returns validation error on init when validated", ({ monitor }) => {
    const value = setup({ validateOn: "onInit" })
    const error = value.getError(monitor)

    expect(error).toBe(1)
  })

  it("prioritizes initial error over validation error", ({ monitor }) => {
    const value = setup({ validateOn: "onInit", error: 2 })

    const error0 = value.getError(monitor)
    expect(error0).toBe(2)

    value.setError(null)
    const error1 = value.getError(monitor)
    expect(error1).toBe(1)
  })

  it("prioritizes custom error over validation error", ({ monitor }) => {
    const value = setup({ validateOn: "onInit" })

    value.setError(4)
    const error0 = value.getError(monitor)
    expect(error0).toBe(4)

    value.setError(null)
    const error1 = value.getError(monitor)
    expect(error1).toBe(1)
  })

  it("uses setter value", ({ monitor }) => {
    const value = setup()
    value.setError((error) => (error ?? 1) + 1)
    expect(value.getError(monitor)).toBe(2)
  })

  it("selects unequal error values when isErrorEqual is not specified", ({ monitor }) => {
    const value = ImpulseFormUnit(-1, {
      validateOn: "onInit",
      validate: (input) => (input > 0 ? [null, input] : [{ message: "error" }, null]),
    })

    const error0 = value.getError(monitor)

    value.setInput(-2)

    const error1 = value.getError(monitor)

    expect(error0).not.toBe(error1)
    expect(error0).toStrictEqual(error1)
  })

  it("selects equal error values when isErrorEqual is specified", ({ monitor }) => {
    const value = ImpulseFormUnit(-1, {
      validateOn: "onInit",
      validate: (input): Result<{ message: string }, number> =>
        input > 0 ? [null, input] : [{ message: "error" }, null],
      isErrorEqual: (left, right) => left.message === right.message,
    })

    const error0 = value.getError(monitor)

    value.setInput(-2)

    const error1 = value.getError(monitor)

    expect(error0).toBe(error1)
    expect(error0).toStrictEqual(error1)
  })
})

describe("when schema is defined", () => {
  function setup(options?: Partial<ImpulseFormUnitSchemaOptions<number>>) {
    return ImpulseFormUnit(1, { schema: z.number().min(2), ...options })
  }

  it("returns null on init by default", ({ monitor }) => {
    const value = setup()
    const error = value.getError(monitor)

    expectTypeOf(error).toEqualTypeOf<null | ReadonlyArray<string>>()
    expect(error).toBeNull()
  })

  it("returns validation error on init when validated", ({ monitor }) => {
    const value = setup({ validateOn: "onInit" })
    const error = value.getError(monitor)

    expect(error).toStrictEqual([expect.any(String)])
  })

  it("prioritizes initial error over validation error", ({ monitor }) => {
    const value = setup({ validateOn: "onInit", error: ["custom error"] })

    const error0 = value.getError(monitor)
    expect(error0).toStrictEqual(["custom error"])

    value.setError(null)
    const error1 = value.getError(monitor)
    expect(error1).toStrictEqual([expect.any(String)])
  })

  it("prioritizes custom error over validation error", ({ monitor }) => {
    const value = setup({ validateOn: "onInit" })

    value.setError(["custom error"])
    const error0 = value.getError(monitor)
    expect(error0).toStrictEqual(["custom error"])

    value.setError(null)
    const error1 = value.getError(monitor)
    expect(error1).toStrictEqual([expect.any(String)])
  })

  it("uses setter value", ({ monitor }) => {
    const value = setup()
    value.setError((error) => [...(error ?? ["initial"]), "custom error"])
    expect(value.getError(monitor)).toStrictEqual(["initial", "custom error"])
  })

  it("selects same error value", ({ monitor }) => {
    const value = ImpulseFormUnit(-1, {
      validateOn: "onInit",
      schema: z.number().min(0),
    })

    const error0 = value.getError(monitor)

    value.setInput(-2)

    const error1 = value.getError(monitor)

    expect(error0).toBe(error1)
    expect(error0).toStrictEqual(error1)
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
    it("returns messages", ({ monitor }) => {
      const value = ImpulseFormUnit(1, {
        touched: true,
        schema: {
          safeParse() {
            return { success: false, error }
          },
        },
      })

      expect(value.getError(monitor)).toStrictEqual(["error message #1", "error message #2"])
    })
  })

  describe("when using ZodLikeSchema#parse()", () => {
    it("returns Error.message", ({ monitor }) => {
      const value = ImpulseFormUnit(1, {
        touched: true,
        schema: {
          parse() {
            throw new Error("error message")
          },
        },
      })

      expect(value.getError(monitor)).toStrictEqual(["error message"])
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
      it("returns messages", ({ monitor }) => {
        const value = ImpulseFormUnit(1, {
          touched: true,
          schema: {
            parse() {
              throw error
            },
          },
        })

        expect(value.getError(monitor)).toStrictEqual(["error message #1", "error message #2"])
      })
    })

    it("ignores ZodLikeIssue without the message: string property", ({ monitor }) => {
      const value = ImpulseFormUnit(1, {
        touched: true,
        schema: {
          parse() {
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

      expect(value.getError(monitor)).toStrictEqual(["error message #1", "error message #2"])
    })

    it("returns empty array if ZodLikeError does not have errors|issues properties", ({
      monitor,
    }) => {
      const value = ImpulseFormUnit(1, {
        touched: true,
        schema: {
          parse() {
            // biome-ignore lint/style/useThrowOnlyError: for testing purposes
            throw { anything: [] }
          },
        },
      })

      expect(value.getError(monitor)).toStrictEqual([])
    })

    it("returns empty array if ZodLikeError is not an object", ({ monitor }) => {
      const value = ImpulseFormUnit(1, {
        touched: true,
        schema: {
          parse() {
            // biome-ignore lint/style/useThrowOnlyError: for testing purposes
            throw "error"
          },
        },
      })

      expect(value.getError(monitor)).toStrictEqual([])
    })

    it("returns error from ZodSchema#parse()", ({ monitor }) => {
      const value = ImpulseFormUnit(1, {
        touched: true,
        schema: {
          parse(input) {
            return z.number().max(1).parse(input)
          },
        },
      })

      value.setInput(2)
      expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    })
  })
})
