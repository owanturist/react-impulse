import { z } from "zod"

import { type Setter, type ImpulseForm, ImpulseFormValue } from "../src"

import { arg } from "./common"

describe("ImpulseFormValue.of()", () => {
  it("creates ImpulseFormValue without schema", ({ scope }) => {
    const value = ImpulseFormValue.of(1)

    expectTypeOf(value).toEqualTypeOf<ImpulseFormValue<number>>()
    expectTypeOf(value).toEqualTypeOf<ImpulseFormValue<number, number>>()

    expect(value.getInput(scope)).toBe(1)
    expect(value.getOutput(scope)).toBe(1)
  })

  it("creates ImpulseFormValue with same type schema", ({ scope }) => {
    const value = ImpulseFormValue.of("", {
      schema: z.string().trim().min(2),
      validateOn: "onInit",
    })

    expectTypeOf(value).toEqualTypeOf<ImpulseFormValue<string>>()
    expectTypeOf(value).toEqualTypeOf<ImpulseFormValue<string, string>>()

    expect(value.getInput(scope)).toBe("")
    expect(value.getOutput(scope)).toBeNull()

    value.setInput(" 123 ")
    expect(value.getInput(scope)).toBe(" 123 ")
    expect(value.getOutput(scope)).toBe("123")
  })

  it("creates ImpulseFormValue with different type schema", ({ scope }) => {
    const value = ImpulseFormValue.of("", {
      schema: z.string().trim().min(1).pipe(z.coerce.number()),
      validateOn: "onInit",
    })

    expectTypeOf(value).toEqualTypeOf<ImpulseFormValue<string, number>>()

    expect(value.getInput(scope)).toBe("")
    expect(value.getOutput(scope)).toBeNull()

    value.setInput(" 123 ")
    expect(value.getInput(scope)).toBe(" 123 ")
    expect(value.getOutput(scope)).toBe(123)
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
        validateOn: "onInit",
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

  it("does not allow to specify TValue when TOriginValue does not extend it", ({
    scope,
  }) => {
    // @ts-expect-error TOriginValue does not extend TValue
    const value = ImpulseFormValue.of<string, number>("1")

    expectTypeOf(value).toEqualTypeOf<ImpulseFormValue<string, number>>()

    expect(value.getInput(scope)).toBe("1")
    expect(value.getOutput(scope)).toBe("1")
  })

  it("does not allow to specify schema TOutput different from TInput", ({
    scope,
  }) => {
    const value = ImpulseFormValue.of<string>("1", {
      // @ts-expect-error schema Input is not string
      schema: z.coerce.number(),
      validateOn: "onInit",
    })

    expect(value.getInput(scope)).toBe("1")
    expect(value.getOutput(scope)).toBe(1)
  })

  it("does not allow to specify schema Output different from TValue", ({
    scope,
  }) => {
    const value = ImpulseFormValue.of<number, string>(0, {
      // @ts-expect-error schema Output is not string
      schema: z.number(),
      validateOn: "onInit",
    })

    expect(value.getInput(scope)).toBe(0)
    expect(value.getOutput(scope)).toBe(0)
  })

  it("specifies initial touched", ({ scope }) => {
    const value = ImpulseFormValue.of("", { touched: true })

    expect(value.isTouched(scope)).toBe(true)

    value.setTouched(false)
    expect(value.isTouched(scope)).toBe(false)
  })

  it("specifies initial value", ({ scope }) => {
    const value = ImpulseFormValue.of("", { initial: "1" })

    expect(value.getInput(scope)).toBe("")
    expect(value.getInitial(scope)).toBe("1")
  })

  it("assigns initial to input by default", ({ scope }) => {
    const value = ImpulseFormValue.of("1")

    expect(value.getInput(scope)).toBe("1")
    expect(value.getInitial(scope)).toBe("1")
  })

  it("assigns custom initial", ({ scope }) => {
    const value = ImpulseFormValue.of("1", { initial: "2" })

    expect(value.getInput(scope)).toBe("1")
    expect(value.getInitial(scope)).toBe("2")
  })

  it("returns initial if it is equals to input with custom isInputEqual", ({
    scope,
  }) => {
    const initial = { count: 0 }
    const form = ImpulseFormValue.of(
      { count: 0 },
      {
        initial: initial,
        isInputEqual: (left, right) => left.count === right.count,
      },
    )

    expect(form.getInput(scope)).toBe(initial)
    expect(form.getInput(scope)).toBe(form.getInitial(scope))

    form.setInput({ count: 1 })
    expect(form.getInput(scope)).not.toBe(initial)
  })

  it("keeps the prev value with custom isInputEqual", ({ scope }) => {
    const form = ImpulseFormValue.of(
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
})

describe("ImpulseFormValue#getOutput()", () => {
  it("does not select value when not validated", ({ scope }) => {
    const value = ImpulseFormValue.of("1", {
      schema: z.string().max(1),
    })

    expect(value.getOutput(scope)).toBeNull()
    expect(value.getErrors(scope)).toBeNull()

    value.setTouched(true)
    expect(value.getOutput(scope)).toBe("1")
    expect(value.getErrors(scope)).toBeNull()
  })

  it("selects value when not validated without schema", ({ scope }) => {
    const value = ImpulseFormValue.of("1")

    expect(value.getOutput(scope)).toBe("1")
    expect(value.getErrors(scope)).toBeNull()
  })

  it("selects value", ({ scope }) => {
    const value = ImpulseFormValue.of("1", {
      schema: z.string().max(1),
      validateOn: "onInit",
    })

    expect(value.getOutput(scope)).toBe("1")
    expect(value.getOutput(scope, arg(0))).toBe("1")
    expect(value.getOutput(scope, (_, verbose) => verbose)).toBe("1")

    value.setInput("12")
    expect(value.getOutput(scope)).toBeNull()
    expect(value.getOutput(scope, arg(0))).toBeNull()
    expect(value.getOutput(scope, (_, verbose) => verbose)).toBeNull()

    expectTypeOf(value.getOutput(scope)).toEqualTypeOf<null | string>()
    expectTypeOf(value.getOutput(scope, arg(0))).toEqualTypeOf<null | string>()
    expectTypeOf(value.getOutput(scope, (_, verbose) => verbose)).toEqualTypeOf<
      null | string
    >()
  })
})

describe("ImpulseFormValue#getErrors()", () => {
  it("selects schema error", ({ scope }) => {
    const value = ImpulseFormValue.of("1", {
      touched: true,
      schema: z.string().max(1),
    })

    expect(value.getErrors(scope)).toBeNull()
    expect(value.getErrors(scope, arg(0))).toBeNull()
    expect(value.getErrors(scope, (_, verbose) => verbose)).toBeNull()

    value.setInput("12")
    const errors = ["String must contain at most 1 character(s)"]
    expect(value.getErrors(scope)).toStrictEqual(errors)
    expect(value.getErrors(scope, arg(0))).toStrictEqual(errors)
    expect(value.getErrors(scope, (_, verbose) => verbose)).toStrictEqual(
      errors,
    )

    expectTypeOf(
      value.getErrors(scope),
    ).toEqualTypeOf<null | ReadonlyArray<string>>()
    expectTypeOf(
      value.getErrors(scope, arg(0)),
    ).toEqualTypeOf<null | ReadonlyArray<string>>()
    expectTypeOf(
      value.getErrors(scope, (_, verbose) => verbose),
    ).toEqualTypeOf<null | ReadonlyArray<string>>()
  })

  it("custom errors overcome schema errors", ({ scope }) => {
    const value = ImpulseFormValue.of(2, {
      touched: true,
      schema: z.number().max(1),
    })

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
    expectTypeOf(value.isTouched(scope, arg(0))).toEqualTypeOf<boolean>()
    expectTypeOf(value.setTouched).parameter(0).toEqualTypeOf<Setter<boolean>>()
  })
})

describe("ImpulseFormValue#setInput()", () => {
  it("sets original value", ({ scope }) => {
    const value = ImpulseFormValue.of("")

    expect(value.getInput(scope)).toBe("")

    value.setInput("1")
    expect(value.getInput(scope)).toBe("1")

    value.setInput((x) => `${x}2`)
    expect(value.getInput(scope)).toBe("12")
    expect(value.getInitial(scope)).toBe("")

    expectTypeOf(value.setInput)
      .parameter(0)
      .toEqualTypeOf<Setter<string, [string, string]>>()
  })
})

describe("ImpulseFormValue#setInitial()", () => {
  it("sets initial value", ({ scope }) => {
    const value = ImpulseFormValue.of("")

    expect(value.getInitial(scope)).toBe("")

    value.setInitial("1")
    expect(value.getInitial(scope)).toBe("1")

    value.setInitial((x) => `${x}2`)
    expect(value.getInitial(scope)).toBe("12")
    expect(value.getInput(scope)).toBe("")

    expectTypeOf(value.setInitial)
      .parameter(0)
      .toEqualTypeOf<Setter<string, [string, string]>>()
  })
})

describe("ImpulseFormValue#isDirty()", () => {
  it("clean on init", ({ scope }) => {
    const value = ImpulseFormValue.of("")

    expect(value.isDirty(scope)).toBe(false)
  })

  it("dirty on init when initial is different", ({ scope }) => {
    const value = ImpulseFormValue.of("", { initial: "1" })

    expect(value.isDirty(scope)).toBe(true)
  })

  it("clean when original value equals to initial value", ({ scope }) => {
    const value = ImpulseFormValue.of("", { initial: "1" })

    value.setInput("1")

    expect(value.isDirty(scope)).toBe(false)
  })

  it("dirty when original value is different from initial value", ({
    scope,
  }) => {
    const value = ImpulseFormValue.of("1")

    value.setInput("2")

    expect(value.isDirty(scope)).toBe(true)
  })

  it("clean when complex value comparably equal to initial value", ({
    scope,
  }) => {
    const value = ImpulseFormValue.of(
      { type: "zero", value: 0 },
      {
        initial: { type: "zero", value: 0 },
        isInputEqual: (left, right) =>
          left.type === right.type && left.value === right.value,
      },
    )
    expect(value.isDirty(scope)).toBe(false)

    value.setInput({ type: "one", value: 1 })
    expect(value.isDirty(scope)).toBe(true)

    value.setInput({ type: "zero", value: 0 })
    expect(value.isDirty(scope)).toBe(false)
  })

  it("dirty when complex value comparably unequal to initial value", ({
    scope,
  }) => {
    const initial = { type: "zero", value: 0 }
    const value = ImpulseFormValue.of(
      { type: "zero", value: 0 },
      { initial: initial },
    )
    expect(value.isDirty(scope)).toBe(true)

    value.setInput({ type: "one", value: 1 })
    expect(value.isDirty(scope)).toBe(true)

    value.setInput({ type: "zero", value: 0 })
    expect(value.isDirty(scope)).toBe(true)

    value.setInput(initial)
    expect(value.isDirty(scope)).toBe(false)
  })
})

describe("ImpulseFormValue#reset()", () => {
  describe.each([
    ["without arguments", (form: ImpulseForm) => form.reset()],
    ["with resetter=identity", (form: ImpulseForm) => form.reset(arg(0))],
  ])("%s", (_, reset) => {
    it("resets to initial value", ({ scope }) => {
      const value = ImpulseFormValue.of("", { initial: "1" })

      reset(value)
      expect(value.getInput(scope)).toBe("1")
      expect(value.getInitial(scope)).toBe("1")
      expect(value.isDirty(scope)).toBe(false)
    })
  })

  it("resets to initial value by consuming current original value with resetter", ({
    scope,
  }) => {
    const value = ImpulseFormValue.of("2", { initial: "1" })

    value.reset((_, current) => current)
    expect(value.getInput(scope)).toBe("2")
    expect(value.getInitial(scope)).toBe("2")
    expect(value.isDirty(scope)).toBe(false)
  })

  it("resets to new initial value", ({ scope }) => {
    const value = ImpulseFormValue.of("2", { initial: "1" })

    value.reset("3")
    expect(value.getInput(scope)).toBe("3")
    expect(value.getInitial(scope)).toBe("3")
    expect(value.isDirty(scope)).toBe(false)
  })

  it("resets custom error", ({ scope }) => {
    const value = ImpulseFormValue.of("2", { initial: "1" })

    value.setErrors(["error"])
    expect(value.getErrors(scope)).toStrictEqual(["error"])

    value.reset()
    expect(value.getErrors(scope)).toBeNull()
  })

  it("resets isValidated", ({ scope }) => {
    const value = ImpulseFormValue.of("2", { initial: "1" })

    value.setTouched(true)
    expect(value.isValidated(scope)).toBe(true)

    value.reset()
    expect(value.isValidated(scope)).toBe(false)
  })
})
