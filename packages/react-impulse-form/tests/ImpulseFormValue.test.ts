import { equals, identity } from "remeda"
import { z } from "zod"

import type { Setter } from "~/tools/setter"

import type { ImpulseForm } from "../impulse-form"
import { ImpulseFormValue } from "../impulse-form-value"

describe("ImpulseFormValue.of()", () => {
  it("creates ImpulseFormValue without schema", ({ scope }) => {
    const value = ImpulseFormValue.of(1)

    expectTypeOf(value).toEqualTypeOf<ImpulseFormValue<number>>()
    expectTypeOf(value).toEqualTypeOf<ImpulseFormValue<number, number>>()

    expect(value.getOriginalValue(scope)).toBe(1)
    expect(value.getValue(scope)).toBe(1)
  })

  it("creates ImpulseFormValue with same type schema", ({ scope }) => {
    const value = ImpulseFormValue.of("", {
      schema: z.string().trim().min(2),
    })

    expectTypeOf(value).toEqualTypeOf<ImpulseFormValue<string>>()
    expectTypeOf(value).toEqualTypeOf<ImpulseFormValue<string, string>>()

    expect(value.getOriginalValue(scope)).toBe("")
    expect(value.getValue(scope)).toBeNull()

    value.setOriginalValue(" 123 ")
    expect(value.getOriginalValue(scope)).toBe(" 123 ")
    expect(value.getValue(scope)).toBe("123")
  })

  it("creates ImpulseFormValue with different type schema", ({ scope }) => {
    const value = ImpulseFormValue.of("", {
      schema: z.string().trim().min(1).pipe(z.coerce.number()),
    })

    expectTypeOf(value).toEqualTypeOf<ImpulseFormValue<string, number>>()

    expect(value.getOriginalValue(scope)).toBe("")
    expect(value.getValue(scope)).toBeNull()

    value.setOriginalValue(" 123 ")
    expect(value.getOriginalValue(scope)).toBe(" 123 ")
    expect(value.getValue(scope)).toBe(123)
  })

  it("creates ImpulseFormValue with complex value", ({ scope }) => {
    const value = ImpulseFormValue.of(
      {
        type: "",
        value: "",
      },
      {
        schema: z.object({
          type: z.enum(["first", "second"]),
          value: z.string().min(1).pipe(z.coerce.boolean()),
        }),
      },
    )
    expectTypeOf(value).toEqualTypeOf<
      ImpulseFormValue<
        {
          type: string
          value: string
        },
        {
          type: "first" | "second"
          value: boolean
        }
      >
    >()

    expect(value.getOriginalValue(scope)).toStrictEqual({
      type: "",
      value: "",
    })
    expect(value.getValue(scope)).toBeNull()

    value.setOriginalValue((current) => ({ ...current, type: "first" }))
    expect(value.getValue(scope)).toBeNull()

    value.setOriginalValue((current) => ({ ...current, value: "true" }))
    expect(value.getValue(scope)).toStrictEqual({
      type: "first",
      value: true,
    })
  })

  it("does not allow to specify TValue when TOriginValue does not extend it", ({
    scope,
  }) => {
    // @ts-expect-error TOriginValue does not extend TValue
    const value = ImpulseFormValue.of<string, number>("1")

    expectTypeOf(value).toEqualTypeOf<ImpulseFormValue<string, number>>()

    expect(value.getOriginalValue(scope)).toBe("1")
    expect(value.getValue(scope)).toBe("1")
  })

  it("does not allow to specify schema Input different from TOriginalValue", ({
    scope,
  }) => {
    const value = ImpulseFormValue.of<string>("1", {
      // @ts-expect-error schema Input is not string
      schema: z.coerce.number(),
    })

    expect(value.getOriginalValue(scope)).toBe("1")
    expect(value.getValue(scope)).toBe(1)
  })

  it("does not allow to specify schema Output different from TValue", ({
    scope,
  }) => {
    const value = ImpulseFormValue.of<number, string>(0, {
      // @ts-expect-error schema Output is not string
      schema: z.number(),
    })

    expect(value.getOriginalValue(scope)).toBe(0)
    expect(value.getValue(scope)).toBe(0)
  })

  it("specifies initial touched", ({ scope }) => {
    const value = ImpulseFormValue.of("", { touched: true })

    expect(value.isTouched(scope)).toBe(true)

    value.setTouched(false)
    expect(value.isTouched(scope)).toBe(false)
  })

  it("specifies initial value", ({ scope }) => {
    const value = ImpulseFormValue.of("", { initialValue: "1" })

    expect(value.getOriginalValue(scope)).toBe("")
    expect(value.getInitialValue(scope)).toBe("1")
  })
})

describe("ImpulseFormValue#getValue()", () => {
  it("selects value", ({ scope }) => {
    const value = ImpulseFormValue.of("1", { schema: z.string().max(1) })

    expect(value.getValue(scope)).toBe("1")
    expect(value.getValue(scope, identity)).toBe("1")
    expect(value.getValue(scope, (_, verbose) => verbose)).toBe("1")

    value.setOriginalValue("12")
    expect(value.getValue(scope)).toBeNull()
    expect(value.getValue(scope, identity)).toBeNull()
    expect(value.getValue(scope, (_, verbose) => verbose)).toBeNull()

    expectTypeOf(value.getValue(scope)).toEqualTypeOf<null | string>()
    expectTypeOf(value.getValue(scope, identity)).toEqualTypeOf<null | string>()
    expectTypeOf(value.getValue(scope, (_, verbose) => verbose)).toEqualTypeOf<
      null | string
    >()
  })
})

describe("ImpulseFormValue#getErrors()", () => {
  it("selects schema error", ({ scope }) => {
    const value = ImpulseFormValue.of("1", { schema: z.string().max(1) })

    expect(value.getErrors(scope)).toBeNull()
    expect(value.getErrors(scope, identity)).toBeNull()
    expect(value.getErrors(scope, (_, verbose) => verbose)).toBeNull()

    value.setOriginalValue("12")
    const errors = ["String must contain at most 1 character(s)"]
    expect(value.getErrors(scope)).toStrictEqual(errors)
    expect(value.getErrors(scope, identity)).toStrictEqual(errors)
    expect(value.getErrors(scope, (_, verbose) => verbose)).toStrictEqual(
      errors,
    )

    expectTypeOf(
      value.getErrors(scope),
    ).toEqualTypeOf<null | ReadonlyArray<string>>()
    expectTypeOf(
      value.getErrors(scope, identity),
    ).toEqualTypeOf<null | ReadonlyArray<string>>()
    expectTypeOf(
      value.getErrors(scope, (_, verbose) => verbose),
    ).toEqualTypeOf<null | ReadonlyArray<string>>()
  })

  it("custom errors overcome schema errors", ({ scope }) => {
    const value = ImpulseFormValue.of(2, { schema: z.number().max(1) })

    value.setErrors(["error"])
    expect(value.getErrors(scope)).toStrictEqual(["error"])

    value.setErrors(null)
    expect(value.getErrors(scope)).toStrictEqual([
      "Number must be less than or equal to 1",
    ])
  })
})

describe("ImpulseFormValue#setErrors()", () => {
  it("empty array resets errors", ({ scope }) => {
    const value = ImpulseFormValue.of("1")

    value.setErrors(["error"])
    expect(value.getErrors(scope)).toStrictEqual(["error"])

    value.setErrors([])
    expect(value.getErrors(scope)).toBeNull()
  })

  it("uses setter value", ({ scope }) => {
    const value = ImpulseFormValue.of("1")

    value.setErrors(["error"])
    expect(value.getErrors(scope)).toStrictEqual(["error"])

    value.setErrors((errors) => [...errors!, "error2"])
    expect(value.getErrors(scope)).toStrictEqual(["error", "error2"])
  })
})

describe("ImpulseFormValue#isTouched()", () => {
  it("selects touched", ({ scope }) => {
    const value = ImpulseFormValue.of("")

    expect(value.isTouched(scope)).toBe(false)
    expect(value.isTouched(scope, (x) => !x)).toBe(true)

    value.setTouched(true)
    expect(value.isTouched(scope)).toBe(true)

    value.setTouched((x) => !x)
    expect(value.isTouched(scope)).toBe(false)

    expectTypeOf(value.isTouched(scope)).toEqualTypeOf<boolean>()
    expectTypeOf(value.isTouched(scope, identity)).toEqualTypeOf<boolean>()
    expectTypeOf(value.setTouched).parameter(0).toEqualTypeOf<Setter<boolean>>()
  })
})

describe("ImpulseFormValue#setOriginalValue()", () => {
  it("sets original value", ({ scope }) => {
    const value = ImpulseFormValue.of("")

    expect(value.getOriginalValue(scope)).toBe("")

    value.setOriginalValue("1")
    expect(value.getOriginalValue(scope)).toBe("1")

    value.setOriginalValue((x) => `${x}2`)
    expect(value.getOriginalValue(scope)).toBe("12")
    expect(value.getInitialValue(scope)).toBe("")

    expectTypeOf(value.setOriginalValue)
      .parameter(0)
      .toEqualTypeOf<Setter<string>>()
  })

  it("resets error when originalValue changes", ({ scope }) => {
    const value = ImpulseFormValue.of({ foo: 1 }, { compare: equals })

    value.setErrors(["error"])
    value.setOriginalValue({ foo: 1 })
    expect(value.getErrors(scope)).toStrictEqual(["error"])

    value.setOriginalValue({ foo: 2 })
    expect(value.getErrors(scope)).toBeNull()
  })
})

describe("ImpulseFormValue#setInitialValue()", () => {
  it("sets initial value", ({ scope }) => {
    const value = ImpulseFormValue.of("")

    expect(value.getInitialValue(scope)).toBe("")

    value.setInitialValue("1")
    expect(value.getInitialValue(scope)).toBe("1")

    value.setInitialValue((x) => `${x}2`)
    expect(value.getInitialValue(scope)).toBe("12")
    expect(value.getOriginalValue(scope)).toBe("")

    expectTypeOf(value.setInitialValue)
      .parameter(0)
      .toEqualTypeOf<Setter<string>>()
  })
})

describe("ImpulseFormValue#isDirty()", () => {
  it("clean on init", ({ scope }) => {
    const value = ImpulseFormValue.of("")

    expect(value.isDirty(scope)).toBe(false)
  })

  it("dirty on init when initialValue is different", ({ scope }) => {
    const value = ImpulseFormValue.of("", { initialValue: "1" })

    expect(value.isDirty(scope)).toBe(true)
  })

  it("clean when original value equals to initial value", ({ scope }) => {
    const value = ImpulseFormValue.of("", { initialValue: "1" })

    value.setOriginalValue("1")

    expect(value.isDirty(scope)).toBe(false)
  })

  it("dirty when original value is different from initial value", ({
    scope,
  }) => {
    const value = ImpulseFormValue.of("1")

    value.setOriginalValue("2")

    expect(value.isDirty(scope)).toBe(true)
  })

  it("clean when complex value comparably equal to initial value", ({
    scope,
  }) => {
    const value = ImpulseFormValue.of(
      { type: "zero", value: 0 },
      {
        initialValue: { type: "zero", value: 0 },
        compare: equals,
      },
    )
    expect(value.isDirty(scope)).toBe(false)

    value.setOriginalValue({ type: "one", value: 1 })
    expect(value.isDirty(scope)).toBe(true)

    value.setOriginalValue({ type: "zero", value: 0 })
    expect(value.isDirty(scope)).toBe(false)
  })

  it("dirty when complex value comparably unequal to initial value", ({
    scope,
  }) => {
    const initialValue = { type: "zero", value: 0 }
    const value = ImpulseFormValue.of(
      { type: "zero", value: 0 },
      { initialValue },
    )
    expect(value.isDirty(scope)).toBe(true)

    value.setOriginalValue({ type: "one", value: 1 })
    expect(value.isDirty(scope)).toBe(true)

    value.setOriginalValue({ type: "zero", value: 0 })
    expect(value.isDirty(scope)).toBe(true)

    value.setOriginalValue(initialValue)
    expect(value.isDirty(scope)).toBe(false)
  })
})

describe("ImpulseFormValue#reset()", () => {
  describe.each([
    ["without arguments", (form: ImpulseForm) => form.reset()],
    ["with resetter=identity", (form: ImpulseForm) => form.reset(identity)],
  ])("%s", (_, reset) => {
    it("resets to initial value", ({ scope }) => {
      const value = ImpulseFormValue.of("", { initialValue: "1" })

      reset(value)
      expect(value.getOriginalValue(scope)).toBe("1")
      expect(value.getInitialValue(scope)).toBe("1")
      expect(value.isDirty(scope)).toBe(false)
    })
  })

  it("resets to initial value by consuming current original value with resetter", ({
    scope,
  }) => {
    const value = ImpulseFormValue.of("2", { initialValue: "1" })

    value.reset((_, current) => current)
    expect(value.getOriginalValue(scope)).toBe("2")
    expect(value.getInitialValue(scope)).toBe("2")
    expect(value.isDirty(scope)).toBe(false)
  })

  it("resets to new initial value", ({ scope }) => {
    const value = ImpulseFormValue.of("2", { initialValue: "1" })

    value.reset("3")
    expect(value.getOriginalValue(scope)).toBe("3")
    expect(value.getInitialValue(scope)).toBe("3")
    expect(value.isDirty(scope)).toBe(false)
  })

  it("resets custom error", ({ scope }) => {
    const value = ImpulseFormValue.of("2", { initialValue: "1" })

    value.setErrors(["error"])
    expect(value.getErrors(scope)).toStrictEqual(["error"])

    value.reset()
    expect(value.getErrors(scope)).toBeNull()
  })
})
