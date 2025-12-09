import type { Monitor } from "@owanturist/signal"
import z from "zod"

import type { Setter } from "~/tools/setter"

import {
  FormOptional,
  type FormOptionalInputSetter,
  type FormOptionalOptions,
  FormUnit,
  type Result,
} from "../../src"

describe("types", () => {
  const form = FormOptional(FormUnit(true), FormUnit(0))

  interface InputSchema {
    readonly enabled: boolean
    readonly element: number
  }

  type InputSetter = Setter<
    {
      readonly enabled?: Setter<boolean, [boolean, boolean]>
      readonly element?: Setter<number, [number, number]>
    },
    [InputSchema, InputSchema]
  >

  it("matches schema type for getInput(monitor)", () => {
    expectTypeOf(form.getInput).toEqualTypeOf<(monitor: Monitor) => InputSchema>()
  })

  it("matches setter type for setInput(setter)", () => {
    expectTypeOf(form.setInput).toEqualTypeOf<(setter: InputSetter) => void>()
  })

  it("ensures FormOptionalOptions.input type", () => {
    const form = FormOptional(FormUnit(true), FormUnit(0), {
      input: {
        // @ts-expect-error should be boolean
        enabled: 1,
        // @ts-expect-error should be number
        element: "0",
      },
    })

    expectTypeOf(form).not.toBeUndefined()
  })

  describe("nested", () => {
    const parent = FormOptional(FormUnit(true), form)

    interface ParentInputSchema {
      readonly enabled: boolean
      readonly element: InputSchema
    }

    type ParentInputSetter = Setter<
      {
        readonly enabled?: Setter<boolean, [boolean, boolean]>
        readonly element?: InputSetter
      },
      [ParentInputSchema, ParentInputSchema]
    >

    it("matches schema type for getInput(monitor)", () => {
      expectTypeOf(parent.getInput).toEqualTypeOf<(monitor: Monitor) => ParentInputSchema>()
    })

    it("matches setter type for setInput(setter)", () => {
      expectTypeOf(parent.setInput).toEqualTypeOf<(setter: ParentInputSetter) => void>()
    })
  })

  it("ensures the enabled output is a boolean", ({ monitor }) => {
    const form1 = FormOptional(FormUnit(false), FormUnit(0))
    expectTypeOf(form1.enabled.getOutput(monitor)).toEqualTypeOf<null | boolean>()

    const form2 = FormOptional(
      FormUnit(1, {
        transform: (input) => input > 0,
      }),
      FormUnit(0),
    )
    expectTypeOf(form2.enabled.getOutput(monitor)).toEqualTypeOf<null | boolean>()

    const form3 = FormOptional(
      FormUnit(1, {
        validate: (input): Result<string, boolean> =>
          input > 0 ? [null, true] : ["Negative", null],
      }),
      FormUnit(0),
    )
    expectTypeOf(form3.enabled.getOutput(monitor)).toEqualTypeOf<null | boolean>()

    const form4 = FormOptional(
      FormUnit(1, {
        schema: z.number().transform((input) => input > 0),
      }),
      FormUnit(0),
    )
    expectTypeOf(form4.enabled.getOutput(monitor)).toEqualTypeOf<null | boolean>()

    const form5 = FormOptional(
      // @ts-expect-error should output boolean
      FormUnit(1, {
        schema: z.number(),
      }),
      FormUnit(0),
    )
    expectTypeOf(form5.enabled.getOutput(monitor)).toEqualTypeOf<null | number>()
  })
})

it("initiates with element input", ({ monitor }) => {
  const form = FormOptional(FormUnit(true), FormUnit(1))

  expect(form.getInput(monitor)).toStrictEqual({
    enabled: true,
    element: 1,
  })
})

it("initiates with overridden input", ({ monitor }) => {
  const form = FormOptional(FormUnit(true), FormUnit(1), {
    input: {
      enabled: false,
      element: 2,
    },
  })

  expect(form.getInput(monitor)).toStrictEqual({
    enabled: false,
    element: 2,
  })
})

it("sets input", ({ monitor }) => {
  const form = FormOptional(FormUnit(true), FormUnit(1))

  form.setInput({
    enabled: false,
    element: 5,
  })

  expect(form.getInput(monitor)).toStrictEqual({
    enabled: false,
    element: 5,
  })
})

it("sets partial input", ({ monitor }) => {
  const form = FormOptional(FormUnit(true), FormUnit(1))

  form.setInput({
    element: 10,
  })
  expect(form.getInput(monitor)).toStrictEqual({
    enabled: true,
    element: 10,
  })

  form.setInput({
    enabled: false,
  })
  expect(form.getInput(monitor)).toStrictEqual({
    enabled: false,
    element: 10,
  })
})

describe("using recursive setter", () => {
  const enabled = FormUnit(true)
  const element = FormUnit(1)

  function setup(options?: FormOptionalOptions<typeof enabled, typeof element>) {
    return FormOptional(enabled, element, options)
  }

  describe.each<
    [
      string,
      (input: FormOptionalInputSetter<typeof enabled, typeof element>) => ReturnType<typeof setup>,
    ]
  >([
    ["FormOptionalOptions.input", (input) => setup({ input })],

    [
      "FormOptional.setInput",
      (setter) => {
        const form = setup()

        form.setInput(setter)

        return form
      },
    ],
  ])("in %s", (_, run) => {
    it("passes input and initial recursively to all setters", ({ monitor }) => {
      expect.assertions(8)

      const form = run((input, initial) => {
        expect(input).toStrictEqual({ enabled: true, element: 1 })
        expect(initial).toStrictEqual({ enabled: true, element: 1 })

        return {
          enabled: (inputEnabled, initialEnabled) => {
            expect(inputEnabled).toBe(true)
            expect(initialEnabled).toBe(true)

            return false
          },

          element: (inputElement, initialElement) => {
            expect(inputElement).toBe(1)
            expect(initialElement).toBe(1)

            return 2
          },
        }
      })

      expect(form.getInput(monitor)).toStrictEqual({
        enabled: false,
        element: 2,
      })
      expect(form.getInitial(monitor)).toStrictEqual({
        enabled: true,
        element: 1,
      })
    })
  })
})

describe("stable input value", () => {
  it("subsequently selects equal input", ({ monitor }) => {
    const form = FormOptional(FormUnit(true), FormUnit({ a: 1 }))

    const input0 = form.getInput(monitor)

    form.setInput({ element: { a: 1 } })
    const input1 = form.getInput(monitor)

    expect(input0).not.toBe(input1)
    expect(input0).toStrictEqual(input1)
  })
})
