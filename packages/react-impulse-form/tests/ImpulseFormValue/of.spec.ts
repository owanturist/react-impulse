import { z } from "zod"

import { ImpulseFormValue } from "../../src"

describe("ImpulseFormValueValidatedOptions", () => {
  it("defines impulse with validate as transformer", ({ scope }) => {
    const value = ImpulseFormValue.of(123, {
      validateOn: "onInit",
      validate: (input) => [null, input.toFixed(2)],
    })

    expectTypeOf(value).toEqualTypeOf<ImpulseFormValue<number, null, string>>()
    expect(value.getInput(scope)).toBe(123)
    expect(value.getOutput(scope)).toBe("123.00")
  })

  it("defines impulse with validate as validator", ({ scope }) => {
    const value = ImpulseFormValue.of(0, {
      validateOn: "onInit",
      validate: (input) => {
        return input > 0 ? [null, input] : ["should be positive", null]
      },
    })

    expectTypeOf(value).toEqualTypeOf<
      ImpulseFormValue<number, string, number>
    >()
    expect(value.getInput(scope)).toBe(0)
    expect(value.getErrors(scope)).toBe("should be positive")
    expect(value.getOutput(scope)).toBeNull()

    value.setInput(1)
    expect(value.getInput(scope)).toBe(1)
    expect(value.getErrors(scope)).toBeNull()
    expect(value.getOutput(scope)).toBe(1)
  })

  it("defines impulse with validate as validator and transformer", ({
    scope,
  }) => {
    const value = ImpulseFormValue.of(0, {
      validateOn: "onInit",
      validate: (input) => {
        return input > 0
          ? [null, input.toFixed(2)]
          : ["should be positive", null]
      },
    })

    expectTypeOf(value).toEqualTypeOf<
      ImpulseFormValue<number, string, string>
    >()
    expect(value.getInput(scope)).toBe(0)
    expect(value.getErrors(scope)).toBe("should be positive")
    expect(value.getOutput(scope)).toBeNull()

    value.setInput(1)
    expect(value.getInput(scope)).toBe(1)
    expect(value.getErrors(scope)).toBeNull()
    expect(value.getOutput(scope)).toBe("1.00")
  })
})

describe("ImpulseFormValueSchemaOptions", () => {
  it("defines impulse with schema as validator", ({ scope }) => {
    const value = ImpulseFormValue.of(0, {
      validateOn: "onInit",
      schema: z.number().min(1),
    })

    expectTypeOf(value).toEqualTypeOf<
      ImpulseFormValue<number, ReadonlyArray<string>, number>
    >()
    expect(value.getInput(scope)).toBe(0)
    expect(value.getErrors(scope)).toStrictEqual([
      "Number must be greater than or equal to 1",
    ])
    expect(value.getOutput(scope)).toBeNull()

    value.setInput(1)
    expect(value.getInput(scope)).toBe(1)
    expect(value.getErrors(scope)).toBeNull()
    expect(value.getOutput(scope)).toBe(1)
  })

  it("defines impulse with schema as validator and transformer", ({
    scope,
  }) => {
    const value = ImpulseFormValue.of(0, {
      validateOn: "onInit",
      schema: z
        .number()
        .min(1)
        .transform((input) => input.toFixed(2)),
    })

    expectTypeOf(value).toEqualTypeOf<
      ImpulseFormValue<number, ReadonlyArray<string>, string>
    >()
    expect(value.getInput(scope)).toBe(0)
    expect(value.getErrors(scope)).toStrictEqual([
      "Number must be greater than or equal to 1",
    ])
    expect(value.getOutput(scope)).toBeNull()

    value.setInput(1)
    expect(value.getInput(scope)).toBe(1)
    expect(value.getErrors(scope)).toBeNull()
    expect(value.getOutput(scope)).toBe("1.00")
  })
})

describe("ImpulseFormValueOptions.isInputDirty", () => {
  it("uses Object.is when not provided", ({ scope }) => {
    const value = ImpulseFormValue.of({ value: "value" })

    expect(value.isDirty(scope)).toBe(false)

    value.setInput({ value: "value" })
    expect(value.isDirty(scope)).toBe(true)
  })

  it("fallbacks to isInputEqual when not provided", ({ scope }) => {
    const value = ImpulseFormValue.of(
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
    const value = ImpulseFormValue.of(
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
    const value = ImpulseFormValue.of("", {
      isInputDirty: (left, right) => left.trim() !== right.trim(),
    })

    expect(value.isDirty(scope)).toBe(false)

    value.setInput(" ")
    expect(value.isDirty(scope)).toBe(false)
  })

  it("returns dirty when isInputDirty returns true", ({ scope }) => {
    const value = ImpulseFormValue.of("", {
      isInputDirty: (left, right) => left.trim() !== right.trim(),
    })

    expect(value.isDirty(scope)).toBe(false)

    value.setInput(" s")
    expect(value.isDirty(scope)).toBe(true)
  })
})
