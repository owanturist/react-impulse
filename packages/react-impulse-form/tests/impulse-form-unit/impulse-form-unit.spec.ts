import { z } from "zod"

import { ImpulseFormUnit, type Result } from "../../src"

it("creates ImpulseFormUnit without validation", ({ scope }) => {
  const value = ImpulseFormUnit(1)

  expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<number>>()
  expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<number, null>>()
  expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<number, null, number>>()

  expect(value.getInput(scope)).toBe(1)
  expect(value.getOutput(scope)).toBe(1)
})

it("creates ImpulseFormUnit with same type transformer", ({ scope }) => {
  const value = ImpulseFormUnit("", {
    transform: (input) => input.trim(),
  })

  expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<string>>()
  expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<string, null, string>>()

  expect(value.getInput(scope)).toBe("")
  expect(value.getOutput(scope)).toBe("")

  value.setInput(" 123 ")
  expect(value.getInput(scope)).toBe(" 123 ")
  expect(value.getOutput(scope)).toBe("123")
})

it("creates ImpulseFormUnit with converting type transformer", ({ scope }) => {
  const value = ImpulseFormUnit("", {
    transform: (input) => input.trim().length,
  })

  expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<string, null, number>>()

  expect(value.getInput(scope)).toBe("")
  expect(value.getOutput(scope)).toBe(0)

  value.setInput(" 123 ")
  expect(value.getInput(scope)).toBe(" 123 ")
  expect(value.getOutput(scope)).toBe(3)
})

it("creates ImpulseFormUnit with same type validator", ({ scope }) => {
  const value = ImpulseFormUnit("", {
    validateOn: "onInit",
    validate: (input): Result<string, string> => {
      const trimmed = input.trim()

      return trimmed.length < 2 ? ["too short", null] : [null, trimmed]
    },
  })

  expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<string, string>>()
  expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<string, string, string>>()

  expect(value.getInput(scope)).toBe("")
  expect(value.getOutput(scope)).toBeNull()

  value.setInput(" 123 ")
  expect(value.getInput(scope)).toBe(" 123 ")
  expect(value.getOutput(scope)).toBe("123")
})

it("creates ImpulseFormUnit with converting type validator", ({ scope }) => {
  const value = ImpulseFormUnit("", {
    validateOn: "onInit",
    validate: (input): Result<string, number> => {
      const trimmed = input.trim()

      return trimmed.length < 2 ? ["too short", null] : [null, trimmed.length]
    },
  })

  expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<string, string, number>>()

  expect(value.getInput(scope)).toBe("")
  expect(value.getOutput(scope)).toBeNull()

  value.setInput(" 123 ")
  expect(value.getInput(scope)).toBe(" 123 ")
  expect(value.getOutput(scope)).toBe(3)
})

it("creates ImpulseFormUnit with same type schema", ({ scope }) => {
  const value = ImpulseFormUnit("", {
    schema: z.string().trim().min(2),
    validateOn: "onInit",
  })

  expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<string, ReadonlyArray<string>>>()
  expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<string, ReadonlyArray<string>, string>>()

  expect(value.getInput(scope)).toBe("")
  expect(value.getOutput(scope)).toBeNull()

  value.setInput(" 123 ")
  expect(value.getInput(scope)).toBe(" 123 ")
  expect(value.getOutput(scope)).toBe("123")
})

it("creates ImpulseFormUnit with converting type schema", ({ scope }) => {
  const value = ImpulseFormUnit("", {
    schema: z.string().trim().min(1).pipe(z.coerce.number()),
    validateOn: "onInit",
  })

  expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<string, ReadonlyArray<string>, number>>()

  expect(value.getInput(scope)).toBe("")
  expect(value.getOutput(scope)).toBeNull()

  value.setInput(" 123 ")
  expect(value.getInput(scope)).toBe(" 123 ")
  expect(value.getOutput(scope)).toBe(123)
})

/**
 * bugfix: ImpulseFormUnit ignores nullable transformations #874
 * @link https://github.com/owanturist/react-impulse/issues/874
 */
it("creates ImpulseFormUnit with undefinable output", ({ scope }) => {
  const unit = ImpulseFormUnit("", {
    validateOn: "onInit",
    schema: z.string().optional(),
  })

  expectTypeOf(unit).toEqualTypeOf<
    ImpulseFormUnit<string, ReadonlyArray<string>, undefined | string>
  >()
  expect(unit.getOutput(scope)).toBe("")

  // @ts-expect-error test the schema
  unit.setInput(undefined)

  expect(unit.getInput(scope)).toBeUndefined()
})

/**
 * bugfix: ImpulseFormUnit ignores nullable transformations #874
 * @link https://github.com/owanturist/react-impulse/issues/874
 */
it("creates ImpulseFormUnit with nullable output", ({ scope }) => {
  const unit = ImpulseFormUnit("", {
    validateOn: "onInit",
    schema: z.string().nullable(),
  })

  expectTypeOf(unit).toEqualTypeOf<ImpulseFormUnit<string, ReadonlyArray<string>, null | string>>()
  expect(unit.getOutput(scope)).toBe("")

  // @ts-expect-error test the schema
  unit.setInput(null)

  expect(unit.getInput(scope)).toBeNull()
})

it("creates ImpulseFormUnit with complex value", ({ scope }) => {
  const value = ImpulseFormUnit(
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
    ImpulseFormUnit<
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

  expect(value.getInput(scope)).toStrictEqual({
    type: "",
    value: "",
  })
  expect(value.getOutput(scope)).toBeNull()

  value.setInput((current) => ({ ...current, type: "first" }))
  expect(value.getOutput(scope)).toBeNull()

  value.setInput((current) => ({ ...current, value: "true" }))
  expect(value.getOutput(scope)).toStrictEqual({
    type: "first",
    value: true,
  })
})

it("does not allow to specify schema TOutput different from TInput", ({ scope }) => {
  const value = ImpulseFormUnit<string>("1", {
    // @ts-expect-error schema Input is not string
    schema: z.coerce.number(),
    validateOn: "onInit",
  })

  expect(value.getInput(scope)).toBe("1")
  expect(value.getOutput(scope)).toBe(1)
})

it("does not allow to specify schema Output different from TValue", ({ scope }) => {
  const value = ImpulseFormUnit<number, string>(0, {
    // @ts-expect-error schema Output is not string
    schema: z.number(),
    validateOn: "onInit",
  })

  expect(value.getInput(scope)).toBe(0)
  expect(value.getOutput(scope)).toBe(0)
})

it("specifies initial touched", ({ scope }) => {
  const value = ImpulseFormUnit("", { touched: true })

  expect(value.isTouched(scope)).toBe(true)

  value.setTouched(false)
  expect(value.isTouched(scope)).toBe(false)
})

it("keeps the prev value with custom isInputEqual", ({ scope }) => {
  const form = ImpulseFormUnit(
    { count: 0 },
    {
      isInputEqual: (left, right) => left.count === right.count,
    },
  )

  const input = form.getInput(scope)

  form.setInput({ count: 0 })
  expect(form.getInput(scope)).toBe(input)

  form.setInput({ count: 1 })
  expect(form.getInput(scope)).not.toBe(input)
})

describe("ImpulseFormUnitValidatedOptions", () => {
  it("defines impulse with validate as transformer", ({ scope }) => {
    const value = ImpulseFormUnit(123, {
      validateOn: "onInit",
      validate: (input) => [null, input.toFixed(2)],
    })

    expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<number, null, string>>()
    expect(value.getInput(scope)).toBe(123)
    expect(value.getOutput(scope)).toBe("123.00")
  })

  it("defines impulse with validate as validator", ({ scope }) => {
    const value = ImpulseFormUnit(0, {
      validateOn: "onInit",
      validate: (input): Result<string, number> =>
        input > 0 ? [null, input] : ["should be positive", null],
    })

    expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<number, string, number>>()
    expect(value.getInput(scope)).toBe(0)
    expect(value.getError(scope)).toBe("should be positive")
    expect(value.getOutput(scope)).toBeNull()

    value.setInput(1)
    expect(value.getInput(scope)).toBe(1)
    expect(value.getError(scope)).toBeNull()
    expect(value.getOutput(scope)).toBe(1)
  })

  it("defines impulse with validate as validator and transformer", ({ scope }) => {
    const value = ImpulseFormUnit(0, {
      validateOn: "onInit",
      validate: (input): Result<string, string> =>
        input > 0 ? [null, input.toFixed(2)] : ["should be positive", null],
    })

    expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<number, string, string>>()
    expect(value.getInput(scope)).toBe(0)
    expect(value.getError(scope)).toBe("should be positive")
    expect(value.getOutput(scope)).toBeNull()

    value.setInput(1)
    expect(value.getInput(scope)).toBe(1)
    expect(value.getError(scope)).toBeNull()
    expect(value.getOutput(scope)).toBe("1.00")
  })
})

describe("ImpulseFormUnitSchemaOptions", () => {
  it("defines impulse with schema as validator", ({ scope }) => {
    const value = ImpulseFormUnit(0, {
      validateOn: "onInit",
      schema: z.number().min(1),
    })

    expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<number, ReadonlyArray<string>, number>>()
    expect(value.getInput(scope)).toBe(0)
    expect(value.getError(scope)).toStrictEqual([expect.any(String)])
    expect(value.getOutput(scope)).toBeNull()

    value.setInput(1)
    expect(value.getInput(scope)).toBe(1)
    expect(value.getError(scope)).toBeNull()
    expect(value.getOutput(scope)).toBe(1)
  })

  it("defines impulse with schema as validator and transformer", ({ scope }) => {
    const value = ImpulseFormUnit(0, {
      validateOn: "onInit",
      schema: z
        .number()
        .min(1)
        .transform((input) => input.toFixed(2)),
    })

    expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<number, ReadonlyArray<string>, string>>()
    expect(value.getInput(scope)).toBe(0)
    expect(value.getError(scope)).toStrictEqual([expect.any(String)])
    expect(value.getOutput(scope)).toBeNull()

    value.setInput(1)
    expect(value.getInput(scope)).toBe(1)
    expect(value.getError(scope)).toBeNull()
    expect(value.getOutput(scope)).toBe("1.00")
  })
})

describe("ImpulseFormUnitOptions.isInputDirty", () => {
  it("uses Object.is when not provided", ({ scope }) => {
    const value = ImpulseFormUnit({ value: "value" })

    expect(value.isDirty(scope)).toBe(false)

    value.setInput({ value: "value" })
    expect(value.isDirty(scope)).toBe(true)
  })

  it("fallbacks to isInputEqual when not provided", ({ scope }) => {
    const value = ImpulseFormUnit(
      { value: "value" },
      {
        isInputEqual: (left, right) => left.value === right.value,
      },
    )

    expect(value.isDirty(scope)).toBe(false)

    value.setInput({ value: "value" })
    expect(value.isDirty(scope)).toBe(false)
  })

  it("takes isInputDirty over isInputEqual", ({ scope }) => {
    const value = ImpulseFormUnit(
      { value: "value" },
      {
        isInputEqual: (left, right) => left.value === right.value,
        isInputDirty: (left, right) => left.value.trim() !== right.value.trim(),
      },
    )

    expect(value.isDirty(scope)).toBe(false)

    value.setInput({ value: "value " })
    expect(value.isDirty(scope)).toBe(false)

    value.setInput({ value: "value 1" })
    expect(value.isDirty(scope)).toBe(true)
  })

  it("returns not dirty when isInputDirty returns false", ({ scope }) => {
    const value = ImpulseFormUnit("", {
      isInputDirty: (left, right) => left.trim() !== right.trim(),
    })

    expect(value.isDirty(scope)).toBe(false)

    value.setInput(" ")
    expect(value.isDirty(scope)).toBe(false)
  })

  it("returns dirty when isInputDirty returns true", ({ scope }) => {
    const value = ImpulseFormUnit("", {
      isInputDirty: (left, right) => left.trim() !== right.trim(),
    })

    expect(value.isDirty(scope)).toBe(false)

    value.setInput(" s")
    expect(value.isDirty(scope)).toBe(true)
  })
})
