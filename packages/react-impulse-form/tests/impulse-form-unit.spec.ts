import { z } from "zod"

import type { Setter } from "~/tools/setter"

import { type ImpulseForm, ImpulseFormUnit } from "../src"

import { arg } from "./common"

describe("ImpulseFormUnit()", () => {
  it("creates ImpulseFormUnit without validation", ({ scope }) => {
    const value = ImpulseFormUnit(1)

    expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<number>>()
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
    expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<number, null>>()
    expectTypeOf(value).toEqualTypeOf<ImpulseFormUnit<number, null, number>>()

    expect(value.getInput(scope)).toBe(1)
    expect(value.getOutput(scope)).toBe(1)
  })

  it("creates ImpulseFormUnit with same type validator", ({ scope }) => {
    const value = ImpulseFormUnit("", {
      validateOn: "onInit",
      validate: (input) => {
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

  it("creates ImpulseFormUnit with same type schema", ({ scope }) => {
    const value = ImpulseFormUnit("", {
      schema: z.string().trim().min(2),
      validateOn: "onInit",
    })

    expectTypeOf(value).toEqualTypeOf<
      ImpulseFormUnit<string, ReadonlyArray<string>>
    >()
    expectTypeOf(value).toEqualTypeOf<
      ImpulseFormUnit<string, ReadonlyArray<string>, string>
    >()

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

    expectTypeOf(value).toEqualTypeOf<
      ImpulseFormUnit<string, ReadonlyArray<string>, number>
    >()

    expect(value.getInput(scope)).toBe("")
    expect(value.getOutput(scope)).toBeNull()

    value.setInput(" 123 ")
    expect(value.getInput(scope)).toBe(" 123 ")
    expect(value.getOutput(scope)).toBe(123)
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

  it("does not allow to specify schema TOutput different from TInput", ({
    scope,
  }) => {
    const value = ImpulseFormUnit<string>("1", {
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

  it("specifies initial value", ({ scope }) => {
    const value = ImpulseFormUnit("", { initial: "1" })

    expect(value.getInput(scope)).toBe("")
    expect(value.getInitial(scope)).toBe("1")
  })

  it("assigns initial to input by default", ({ scope }) => {
    const value = ImpulseFormUnit("1")

    expect(value.getInput(scope)).toBe("1")
    expect(value.getInitial(scope)).toBe("1")
  })

  it("assigns custom initial", ({ scope }) => {
    const value = ImpulseFormUnit("1", { initial: "2" })

    expect(value.getInput(scope)).toBe("1")
    expect(value.getInitial(scope)).toBe("2")
  })

  it("returns initial if it is equals to input with custom isInputEqual", ({
    scope,
  }) => {
    const initial = { count: 0 }
    const form = ImpulseFormUnit(
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
})

describe("ImpulseFormUnit#getOutput()", () => {
  it("selects value when not validated", ({ scope }) => {
    const value = ImpulseFormUnit("1", {
      schema: z.string().max(1),
    })

    expect(value.getOutput(scope)).toBe("1")
    expect(value.getError(scope)).toBeNull()

    value.setTouched(true)
    expect(value.getOutput(scope)).toBe("1")
    expect(value.getError(scope)).toBeNull()
  })

  it("selects value when not validated without schema", ({ scope }) => {
    const value = ImpulseFormUnit("1")

    expect(value.getOutput(scope)).toBe("1")
    expect(value.getError(scope)).toBeNull()
  })

  it("selects value", ({ scope }) => {
    const value = ImpulseFormUnit("1", {
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

  it("transforms value with custom ZodLikeSchema#safeParse", ({ scope }) => {
    const value = ImpulseFormUnit(2, {
      schema: {
        safeParse(input) {
          return { success: true, data: String(input) }
        },
      },
      validateOn: "onInit",
    })

    expect(value.getOutput(scope)).toBe("2")
    expect(value.getError(scope)).toBeNull()
  })

  it("transforms value with custom ZodLikeSchema#parse", ({ scope }) => {
    const value = ImpulseFormUnit(2, {
      schema: {
        parse(input) {
          return String(input)
        },
      },
      validateOn: "onInit",
    })

    expect(value.getOutput(scope)).toBe("2")
    expect(value.getError(scope)).toBeNull()
  })
})

describe("ImpulseFormUnit#isTouched()", () => {
  it("selects touched", ({ scope }) => {
    const value = ImpulseFormUnit("")

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

describe("ImpulseFormUnit#setInput()", () => {
  it("sets original value", ({ scope }) => {
    const value = ImpulseFormUnit("")

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

describe("ImpulseFormUnit#setInitial()", () => {
  it("sets initial value", ({ scope }) => {
    const value = ImpulseFormUnit("")

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

describe("ImpulseFormUnit#isDirty()", () => {
  it("clean on init", ({ scope }) => {
    const value = ImpulseFormUnit("")

    expect(value.isDirty(scope)).toBe(false)
  })

  it("dirty on init when initial is different", ({ scope }) => {
    const value = ImpulseFormUnit("", { initial: "1" })

    expect(value.isDirty(scope)).toBe(true)
  })

  it("clean when original value equals to initial value", ({ scope }) => {
    const value = ImpulseFormUnit("", { initial: "1" })

    value.setInput("1")

    expect(value.isDirty(scope)).toBe(false)
  })

  it("dirty when original value is different from initial value", ({
    scope,
  }) => {
    const value = ImpulseFormUnit("1")

    value.setInput("2")

    expect(value.isDirty(scope)).toBe(true)
  })

  it("clean when complex value comparably equal to initial value", ({
    scope,
  }) => {
    const value = ImpulseFormUnit(
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
    const value = ImpulseFormUnit(
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

describe("ImpulseFormUnit#reset()", () => {
  describe.each([
    ["without arguments", (form: ImpulseForm) => form.reset()],
    ["with resetter=identity", (form: ImpulseForm) => form.reset(arg(0))],
  ])("%s", (_, reset) => {
    it("resets to initial value", ({ scope }) => {
      const value = ImpulseFormUnit("", { initial: "1" })

      reset(value)
      expect(value.getInput(scope)).toBe("1")
      expect(value.getInitial(scope)).toBe("1")
      expect(value.isDirty(scope)).toBe(false)
    })
  })

  it("resets to initial value by consuming current original value with resetter", ({
    scope,
  }) => {
    const value = ImpulseFormUnit("2", { initial: "1" })

    value.reset((_, current) => current)
    expect(value.getInput(scope)).toBe("2")
    expect(value.getInitial(scope)).toBe("2")
    expect(value.isDirty(scope)).toBe(false)
  })

  it("resets to new initial value", ({ scope }) => {
    const value = ImpulseFormUnit("2", { initial: "1" })

    value.reset("3")
    expect(value.getInput(scope)).toBe("3")
    expect(value.getInitial(scope)).toBe("3")
    expect(value.isDirty(scope)).toBe(false)
  })

  it("resets custom error", ({ scope }) => {
    const value = ImpulseFormUnit("2", { schema: z.string(), initial: "1" })

    value.setError(["error"])
    expect(value.getError(scope)).toStrictEqual(["error"])

    value.reset()
    expect(value.getError(scope)).toBeNull()
  })

  it("resets isValidated", ({ scope }) => {
    const value = ImpulseFormUnit("2", { initial: "1" })

    value.setTouched(true)
    expect(value.isValidated(scope)).toBe(true)

    value.reset()
    expect(value.isValidated(scope)).toBe(false)
  })
})
