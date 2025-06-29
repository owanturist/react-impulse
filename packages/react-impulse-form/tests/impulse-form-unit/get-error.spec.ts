import { z } from "zod"

import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"
import { params } from "~/tools/params"

import {
  ImpulseFormUnit,
  type ImpulseFormUnitSchemaOptions,
  type ImpulseFormUnitValidatedOptions,
  type Result,
} from "../../src"
import type { Setter } from "~/tools/setter"

it("selects error", ({ scope }) => {
  const value = ImpulseFormUnit("1", {
    validateOn: "onInit",
    validate: (input) => (input.length > 1 ? [1, null] : [null, input]),
  })

  const error_default = value.getError(scope)
  expect(error_default).toBeNull()
  expectTypeOf(error_default).toEqualTypeOf<null | number>()

  const error_concise = value.getError(scope, params._first)
  expect(error_concise).toBeNull()
  expectTypeOf(error_concise).toEqualTypeOf<null | number>()

  const error_verbose = value.getError(scope, params._second)
  expect(error_verbose).toBeNull()
  expectTypeOf(error_verbose).toEqualTypeOf<null | number>()

  value.setInput("12")
  expect(value.getError(scope)).toBe(1)
  expect(value.getError(scope, params._first)).toBe(1)
  expect(value.getError(scope, params._second)).toBe(1)
})

describe("when neither schema nor initial error are defined", () => {
  function setup() {
    return ImpulseFormUnit<string, number>("1")
  }

  it("returns null", ({ scope }) => {
    const value = setup()
    const error = value.getError(scope)

    expect(error).toBeNull()
    expectTypeOf(error).toEqualTypeOf<null | number>()
  })

  it("sets an error", ({ scope }) => {
    const value = setup()

    value.setError(2)
    expect(value.getError(scope)).toBe(2)

    expectTypeOf(value.setError)
      .parameter(0)
      .toEqualTypeOf<Setter<null | number>>()
  })

  it("resets to null", ({ scope }) => {
    const value = setup()

    value.setError(2)
    value.setError(null)
    expect(value.getError(scope)).toBeNull()
  })

  it("uses setter value", ({ scope }) => {
    const value = setup()

    value.setError((error) => (error ?? 1) + 1)
    expect(value.getError(scope)).toBe(2)
  })
})

describe("when initial error is defined", () => {
  function setup() {
    return ImpulseFormUnit("1", { error: 2 })
  }

  it("returns the initial error", ({ scope }) => {
    const value = setup()
    const error = value.getError(scope)

    expect(error).toBe(2)
    expectTypeOf(error).toEqualTypeOf<null | number>()
  })

  it("updates an error", ({ scope }) => {
    const value = setup()

    value.setError(3)
    expect(value.getError(scope)).toBe(3)
  })

  it("resets to null", ({ scope }) => {
    const value = setup()

    value.setError(null)
    expect(value.getError(scope)).toBeNull()
  })

  it("uses setter value", ({ scope }) => {
    const value = setup()

    value.setError((error) => error! + 1)
    expect(value.getError(scope)).toBe(3)
  })

  it("selects different error value when isErrorEqual is not specified", ({
    scope,
  }) => {
    const value = ImpulseFormUnit("1", {
      error: ["error"],
    })

    const error_0 = value.getError(scope)

    value.setError(["error"])
    const error_1 = value.getError(scope)

    expect(error_0).not.toBe(error_1)
    expect(error_0).toStrictEqual(error_1)
  })

  it("selects same error value when isErrorEqual is specified", ({ scope }) => {
    const value = ImpulseFormUnit("1", {
      error: ["error"],
      isErrorEqual: isShallowArrayEqual,
    })

    const error_0 = value.getError(scope)

    value.setError(["error"])
    const error_1 = value.getError(scope)

    expect(error_0).toBe(error_1)
    expect(error_0).toStrictEqual(error_1)
  })
})

describe("when validator is defined", () => {
  function setup(
    options?: Partial<ImpulseFormUnitValidatedOptions<string, number>>,
  ) {
    return ImpulseFormUnit("", {
      validate: (input) => (input.length > 0 ? [null, input] : [1, null]),
      ...options,
    })
  }

  it("returns null on init by default", ({ scope }) => {
    const value = setup()
    const error = value.getError(scope)

    expectTypeOf(error).toEqualTypeOf<null | number>()
    expect(error).toBeNull()
  })

  it("returns validation error on init when validated", ({ scope }) => {
    const value = setup({ validateOn: "onInit" })
    const error = value.getError(scope)

    expect(error).toBe(1)
  })

  it("prioritizes initial error over validation error", ({ scope }) => {
    const value = setup({ validateOn: "onInit", error: 2 })

    const error_0 = value.getError(scope)
    expect(error_0).toBe(2)

    value.setError(null)
    const error_1 = value.getError(scope)
    expect(error_1).toBe(1)
  })

  it("prioritizes custom error over validation error", ({ scope }) => {
    const value = setup({ validateOn: "onInit" })

    value.setError(4)
    const error_0 = value.getError(scope)
    expect(error_0).toBe(4)

    value.setError(null)
    const error_1 = value.getError(scope)
    expect(error_1).toBe(1)
  })

  it("uses setter value", ({ scope }) => {
    const value = setup()
    value.setError((error) => (error ?? 1) + 1)
    expect(value.getError(scope)).toBe(2)
  })

  it("selects different error value when isErrorEqual is not specified", ({
    scope,
  }) => {
    const value = ImpulseFormUnit(-1, {
      validateOn: "onInit",
      validate: (input) => {
        return input > 0 ? [null, input] : [{ message: "error" }, null]
      },
    })

    const error_0 = value.getError(scope)

    value.setInput(-2)

    const error_1 = value.getError(scope)

    expect(error_0).not.toBe(error_1)
    expect(error_0).toStrictEqual(error_1)
  })

  it("selects same error value when isErrorEqual is specified", ({ scope }) => {
    const value = ImpulseFormUnit(-1, {
      validateOn: "onInit",
      validate: (input): Result<{ message: string }, number> => {
        return input > 0 ? [null, input] : [{ message: "error" }, null]
      },
      isErrorEqual: isShallowObjectEqual,
    })

    const error_0 = value.getError(scope)

    value.setInput(-2)

    const error_1 = value.getError(scope)

    expect(error_0).toBe(error_1)
    expect(error_0).toStrictEqual(error_1)
  })
})

describe("when schema is defined", () => {
  function setup(options?: Partial<ImpulseFormUnitSchemaOptions<number>>) {
    return ImpulseFormUnit(1, { schema: z.number().min(2), ...options })
  }

  it("returns null on init by default", ({ scope }) => {
    const value = setup()
    const error = value.getError(scope)

    expectTypeOf(error).toEqualTypeOf<null | ReadonlyArray<string>>()
    expect(error).toBeNull()
  })

  it("returns validation error on init when validated", ({ scope }) => {
    const value = setup({ validateOn: "onInit" })
    const error = value.getError(scope)

    expect(error).toStrictEqual(["Number must be greater than or equal to 2"])
  })

  it("prioritizes initial error over validation error", ({ scope }) => {
    const value = setup({ validateOn: "onInit", error: ["custom error"] })

    const error_0 = value.getError(scope)
    expect(error_0).toStrictEqual(["custom error"])

    value.setError(null)
    const error_1 = value.getError(scope)
    expect(error_1).toStrictEqual(["Number must be greater than or equal to 2"])
  })

  it("prioritizes custom error over validation error", ({ scope }) => {
    const value = setup({ validateOn: "onInit" })

    value.setError(["custom error"])
    const error_0 = value.getError(scope)
    expect(error_0).toStrictEqual(["custom error"])

    value.setError(null)
    const error_1 = value.getError(scope)
    expect(error_1).toStrictEqual(["Number must be greater than or equal to 2"])
  })

  it("uses setter value", ({ scope }) => {
    const value = setup()
    value.setError((error) => [...(error ?? ["initial"]), "custom error"])
    expect(value.getError(scope)).toStrictEqual(["initial", "custom error"])
  })

  it("selects same error value", ({ scope }) => {
    const value = ImpulseFormUnit(-1, {
      validateOn: "onInit",
      schema: z.number().min(0),
    })

    const error_0 = value.getError(scope)

    value.setInput(-2)

    const error_1 = value.getError(scope)

    expect(error_0).toBe(error_1)
    expect(error_0).toStrictEqual(error_1)
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
      it("returns messages", ({ scope }) => {
        const value = ImpulseFormUnit(1, {
          touched: true,
          schema: {
            safeParse() {
              return { success: false, error }
            },
          },
        })

        expect(value.getError(scope)).toStrictEqual([
          "error message #1",
          "error message #2",
        ])
      })
    },
  )

  describe("when using ZodLikeSchema#parse()", () => {
    it("returns Error.message", ({ scope }) => {
      const value = ImpulseFormUnit(1, {
        touched: true,
        schema: {
          parse() {
            throw new Error("error message")
          },
        },
      })

      expect(value.getError(scope)).toStrictEqual(["error message"])
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
      it("returns messages", ({ scope }) => {
        const value = ImpulseFormUnit(1, {
          touched: true,
          schema: {
            parse() {
              throw error
            },
          },
        })

        expect(value.getError(scope)).toStrictEqual([
          "error message #1",
          "error message #2",
        ])
      })
    })

    it("ignores ZodLikeIssue without the message: string property", ({
      scope,
    }) => {
      const value = ImpulseFormUnit(1, {
        touched: true,
        schema: {
          parse() {
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

      expect(value.getError(scope)).toStrictEqual([
        "error message #1",
        "error message #2",
      ])
    })

    it("returns empty array if ZodLikeError does not have errors|issues properties", ({
      scope,
    }) => {
      const value = ImpulseFormUnit(1, {
        touched: true,
        schema: {
          parse() {
            throw { anything: [] }
          },
        },
      })

      expect(value.getError(scope)).toStrictEqual([])
    })

    it("returns empty array if ZodLikeError is not an object", ({ scope }) => {
      const value = ImpulseFormUnit(1, {
        touched: true,
        schema: {
          parse() {
            throw "error"
          },
        },
      })

      expect(value.getError(scope)).toStrictEqual([])
    })

    it("returns error from ZodSchema#parse()", ({ scope }) => {
      const value = ImpulseFormUnit(1, {
        touched: true,
        schema: {
          parse(input) {
            return z.number().max(1).parse(input)
          },
        },
      })

      value.setInput(2)
      expect(value.getError(scope)).toStrictEqual([
        "Number must be less than or equal to 1",
      ])
    })
  })
})
