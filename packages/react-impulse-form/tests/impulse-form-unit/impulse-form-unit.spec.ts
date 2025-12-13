import { z } from "zod"

import { FormUnit, type Result } from "../../src"

it("creates FormUnit without validation", ({ monitor }) => {
  const value = FormUnit(1)

  expectTypeOf(value).toEqualTypeOf<FormUnit<number>>()
  expectTypeOf(value).toEqualTypeOf<FormUnit<number, null>>()
  expectTypeOf(value).toEqualTypeOf<FormUnit<number, null, number>>()

  expect(value.getInput(monitor)).toBe(1)
  expect(value.getOutput(monitor)).toBe(1)
})

it("creates FormUnit with same type transformer", ({ monitor }) => {
  const value = FormUnit("", {
    transform: (input) => input.trim(),
  })

  expectTypeOf(value).toEqualTypeOf<FormUnit<string>>()
  expectTypeOf(value).toEqualTypeOf<FormUnit<string, null, string>>()

  expect(value.getInput(monitor)).toBe("")
  expect(value.getOutput(monitor)).toBe("")

  value.setInput(" 123 ")
  expect(value.getInput(monitor)).toBe(" 123 ")
  expect(value.getOutput(monitor)).toBe("123")
})

it("creates FormUnit with converting type transformer", ({ monitor }) => {
  const value = FormUnit("", {
    transform: (input) => input.trim().length,
  })

  expectTypeOf(value).toEqualTypeOf<FormUnit<string, null, number>>()

  expect(value.getInput(monitor)).toBe("")
  expect(value.getOutput(monitor)).toBe(0)

  value.setInput(" 123 ")
  expect(value.getInput(monitor)).toBe(" 123 ")
  expect(value.getOutput(monitor)).toBe(3)
})

it("creates FormUnit with same type validator", ({ monitor }) => {
  const value = FormUnit("", {
    validateOn: "onInit",
    validate: (input): Result<string, string> => {
      const trimmed = input.trim()

      return trimmed.length < 2 ? ["too short", null] : [null, trimmed]
    },
  })

  expectTypeOf(value).toEqualTypeOf<FormUnit<string, string>>()
  expectTypeOf(value).toEqualTypeOf<FormUnit<string, string, string>>()

  expect(value.getInput(monitor)).toBe("")
  expect(value.getOutput(monitor)).toBeNull()

  value.setInput(" 123 ")
  expect(value.getInput(monitor)).toBe(" 123 ")
  expect(value.getOutput(monitor)).toBe("123")
})

it("creates FormUnit with converting type validator", ({ monitor }) => {
  const value = FormUnit("", {
    validateOn: "onInit",
    validate: (input): Result<string, number> => {
      const trimmed = input.trim()

      return trimmed.length < 2 ? ["too short", null] : [null, trimmed.length]
    },
  })

  expectTypeOf(value).toEqualTypeOf<FormUnit<string, string, number>>()

  expect(value.getInput(monitor)).toBe("")
  expect(value.getOutput(monitor)).toBeNull()

  value.setInput(" 123 ")
  expect(value.getInput(monitor)).toBe(" 123 ")
  expect(value.getOutput(monitor)).toBe(3)
})

it("creates FormUnit with same type schema", ({ monitor }) => {
  const value = FormUnit("", {
    schema: z.string().trim().min(2),
    validateOn: "onInit",
  })

  expectTypeOf(value).toEqualTypeOf<FormUnit<string, ReadonlyArray<string>>>()
  expectTypeOf(value).toEqualTypeOf<FormUnit<string, ReadonlyArray<string>, string>>()

  expect(value.getInput(monitor)).toBe("")
  expect(value.getOutput(monitor)).toBeNull()

  value.setInput(" 123 ")
  expect(value.getInput(monitor)).toBe(" 123 ")
  expect(value.getOutput(monitor)).toBe("123")
})

it("creates FormUnit with converting type schema", ({ monitor }) => {
  const value = FormUnit("", {
    schema: z.string().trim().min(1).pipe(z.coerce.number()),
    validateOn: "onInit",
  })

  expectTypeOf(value).toEqualTypeOf<FormUnit<string, ReadonlyArray<string>, number>>()

  expect(value.getInput(monitor)).toBe("")
  expect(value.getOutput(monitor)).toBeNull()

  value.setInput(" 123 ")
  expect(value.getInput(monitor)).toBe(" 123 ")
  expect(value.getOutput(monitor)).toBe(123)
})

/**
 * bugfix: FormUnit ignores nullable transformations #874
 * @link https://github.com/owanturist/react-impulse/issues/874
 */
it("creates FormUnit with undefinable output", ({ monitor }) => {
  const unit = FormUnit("", {
    validateOn: "onInit",
    schema: z.string().optional(),
  })

  expectTypeOf(unit).toEqualTypeOf<FormUnit<string, ReadonlyArray<string>, undefined | string>>()
  expect(unit.getOutput(monitor)).toBe("")

  // @ts-expect-error test the schema
  unit.setInput(undefined)

  expect(unit.getInput(monitor)).toBeUndefined()
})

/**
 * bugfix: FormUnit ignores nullable transformations #874
 * @link https://github.com/owanturist/react-impulse/issues/874
 */
it("creates FormUnit with nullable output", ({ monitor }) => {
  const unit = FormUnit("", {
    validateOn: "onInit",
    schema: z.string().nullable(),
  })

  expectTypeOf(unit).toEqualTypeOf<FormUnit<string, ReadonlyArray<string>, null | string>>()
  expect(unit.getOutput(monitor)).toBe("")

  // @ts-expect-error test the schema
  unit.setInput(null)

  expect(unit.getInput(monitor)).toBeNull()
})

it("creates FormUnit with complex value", ({ monitor }) => {
  const value = FormUnit(
    {
      type: "",
      value: "",
    },
    {
      schema: z.object({
        type: z.enum(["first", "second"]),
        value: z.string().min(1).pipe(z.coerce.boolean()),
      }),
      validateOn: "onInit",
    },
  )
  expectTypeOf(value).toEqualTypeOf<
    FormUnit<
      {
        type: string
        value: string
      },
      ReadonlyArray<string>,
      {
        type: "first" | "second"
        value: boolean
      }
    >
  >()

  expect(value.getInput(monitor)).toStrictEqual({
    type: "",
    value: "",
  })
  expect(value.getOutput(monitor)).toBeNull()

  value.setInput((current) => ({ ...current, type: "first" }))
  expect(value.getOutput(monitor)).toBeNull()

  value.setInput((current) => ({ ...current, value: "true" }))
  expect(value.getOutput(monitor)).toStrictEqual({
    type: "first",
    value: true,
  })
})

it("does not allow to specify schema TOutput different from TInput", ({ monitor }) => {
  const value = FormUnit<string>("1", {
    // @ts-expect-error schema Input is not string
    schema: z.coerce.number(),
    validateOn: "onInit",
  })

  expect(value.getInput(monitor)).toBe("1")
  expect(value.getOutput(monitor)).toBe(1)
})

it("does not allow to specify schema Output different from TValue", ({ monitor }) => {
  const value = FormUnit<number, string>(0, {
    // @ts-expect-error schema Output is not string
    schema: z.number(),
    validateOn: "onInit",
  })

  expect(value.getInput(monitor)).toBe(0)
  expect(value.getOutput(monitor)).toBe(0)
})

it("specifies initial touched", ({ monitor }) => {
  const value = FormUnit("", { touched: true })

  expect(value.isTouched(monitor)).toBe(true)

  value.setTouched(false)
  expect(value.isTouched(monitor)).toBe(false)
})

it("keeps the prev value with custom isInputEqual", ({ monitor }) => {
  const form = FormUnit(
    { count: 0 },
    {
      isInputEqual: (left, right) => left.count === right.count,
    },
  )

  const input = form.getInput(monitor)

  form.setInput({ count: 0 })
  expect(form.getInput(monitor)).toBe(input)

  form.setInput({ count: 1 })
  expect(form.getInput(monitor)).not.toBe(input)
})

describe("FormUnitValidatedOptions", () => {
  it("defines unit with validate as transformer", ({ monitor }) => {
    const value = FormUnit(123, {
      validateOn: "onInit",
      validate: (input) => [null, input.toFixed(2)],
    })

    expectTypeOf(value).toEqualTypeOf<FormUnit<number, null, string>>()
    expect(value.getInput(monitor)).toBe(123)
    expect(value.getOutput(monitor)).toBe("123.00")
  })

  it("defines unit with validate as validator", ({ monitor }) => {
    const value = FormUnit(0, {
      validateOn: "onInit",
      validate: (input): Result<string, number> =>
        input > 0 ? [null, input] : ["should be positive", null],
    })

    expectTypeOf(value).toEqualTypeOf<FormUnit<number, string, number>>()
    expect(value.getInput(monitor)).toBe(0)
    expect(value.getError(monitor)).toBe("should be positive")
    expect(value.getOutput(monitor)).toBeNull()

    value.setInput(1)
    expect(value.getInput(monitor)).toBe(1)
    expect(value.getError(monitor)).toBeNull()
    expect(value.getOutput(monitor)).toBe(1)
  })

  it("defines unit with validate as validator and transformer", ({ monitor }) => {
    const value = FormUnit(0, {
      validateOn: "onInit",
      validate: (input): Result<string, string> =>
        input > 0 ? [null, input.toFixed(2)] : ["should be positive", null],
    })

    expectTypeOf(value).toEqualTypeOf<FormUnit<number, string, string>>()
    expect(value.getInput(monitor)).toBe(0)
    expect(value.getError(monitor)).toBe("should be positive")
    expect(value.getOutput(monitor)).toBeNull()

    value.setInput(1)
    expect(value.getInput(monitor)).toBe(1)
    expect(value.getError(monitor)).toBeNull()
    expect(value.getOutput(monitor)).toBe("1.00")
  })
})

describe("FormUnitSchemaOptions", () => {
  it("defines unit with schema as validator", ({ monitor }) => {
    const value = FormUnit(0, {
      validateOn: "onInit",
      schema: z.number().min(1),
    })

    expectTypeOf(value).toEqualTypeOf<FormUnit<number, ReadonlyArray<string>, number>>()
    expect(value.getInput(monitor)).toBe(0)
    expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    expect(value.getOutput(monitor)).toBeNull()

    value.setInput(1)
    expect(value.getInput(monitor)).toBe(1)
    expect(value.getError(monitor)).toBeNull()
    expect(value.getOutput(monitor)).toBe(1)
  })

  it("defines unit with schema as validator and transformer", ({ monitor }) => {
    const value = FormUnit(0, {
      validateOn: "onInit",
      schema: z
        .number()
        .min(1)
        .transform((input) => input.toFixed(2)),
    })

    expectTypeOf(value).toEqualTypeOf<FormUnit<number, ReadonlyArray<string>, string>>()
    expect(value.getInput(monitor)).toBe(0)
    expect(value.getError(monitor)).toStrictEqual([expect.any(String)])
    expect(value.getOutput(monitor)).toBeNull()

    value.setInput(1)
    expect(value.getInput(monitor)).toBe(1)
    expect(value.getError(monitor)).toBeNull()
    expect(value.getOutput(monitor)).toBe("1.00")
  })
})

describe("FormUnitOptions.isInputDirty", () => {
  it("uses Object.is when not provided", ({ monitor }) => {
    const value = FormUnit({ value: "value" })

    expect(value.isDirty(monitor)).toBe(false)

    value.setInput({ value: "value" })
    expect(value.isDirty(monitor)).toBe(true)
  })

  it("fallbacks to isInputEqual when not provided", ({ monitor }) => {
    const value = FormUnit(
      { value: "value" },
      {
        isInputEqual: (left, right) => left.value === right.value,
      },
    )

    expect(value.isDirty(monitor)).toBe(false)

    value.setInput({ value: "value" })
    expect(value.isDirty(monitor)).toBe(false)
  })

  it("takes isInputDirty over isInputEqual", ({ monitor }) => {
    const value = FormUnit(
      { value: "value" },
      {
        isInputEqual: (left, right) => left.value === right.value,
        isInputDirty: (left, right) => left.value.trim() !== right.value.trim(),
      },
    )

    expect(value.isDirty(monitor)).toBe(false)

    value.setInput({ value: "value " })
    expect(value.isDirty(monitor)).toBe(false)

    value.setInput({ value: "value 1" })
    expect(value.isDirty(monitor)).toBe(true)
  })

  it("returns not dirty when isInputDirty returns false", ({ monitor }) => {
    const value = FormUnit("", {
      isInputDirty: (left, right) => left.trim() !== right.trim(),
    })

    expect(value.isDirty(monitor)).toBe(false)

    value.setInput(" ")
    expect(value.isDirty(monitor)).toBe(false)
  })

  it("returns dirty when isInputDirty returns true", ({ monitor }) => {
    const value = FormUnit("", {
      isInputDirty: (left, right) => left.trim() !== right.trim(),
    })

    expect(value.isDirty(monitor)).toBe(false)

    value.setInput(" s")
    expect(value.isDirty(monitor)).toBe(true)
  })
})
