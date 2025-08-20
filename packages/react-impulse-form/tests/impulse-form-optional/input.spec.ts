import type { Scope } from "react-impulse"
import z from "zod"

import type { Setter } from "~/tools/setter"

import {
  ImpulseFormOptional,
  type ImpulseFormOptionalInputSetter,
  type ImpulseFormOptionalOptions,
  ImpulseFormUnit,
  type Result,
} from "../../src"

describe("types", () => {
  const form = ImpulseFormOptional(ImpulseFormUnit(true), ImpulseFormUnit(0))

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

  it("matches schema type for getInput(scope)", () => {
    expectTypeOf(form.getInput).toEqualTypeOf<(scope: Scope) => InputSchema>()
  })

  it("matches setter type for setInput(setter)", () => {
    expectTypeOf(form.setInput).toEqualTypeOf<(setter: InputSetter) => void>()
  })

  it("ensures ImpulseFormOptionalOptions.input type", () => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true),
      ImpulseFormUnit(0),
      {
        input: {
          // @ts-expect-error should be boolean
          enabled: 1,
          // @ts-expect-error should be number
          element: "0",
        },
      },
    )

    expectTypeOf(form).not.toBeUndefined()
  })

  describe("nested", () => {
    const parent = ImpulseFormOptional(ImpulseFormUnit(true), form)

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

    it("matches schema type for getInput(scope)", () => {
      expectTypeOf(parent.getInput).toEqualTypeOf<
        (scope: Scope) => ParentInputSchema
      >()
    })

    it("matches setter type for setInput(setter)", () => {
      expectTypeOf(parent.setInput).toEqualTypeOf<
        (setter: ParentInputSetter) => void
      >()
    })
  })

  it("ensures the enabled output is a boolean", ({ scope }) => {
    const form_1 = ImpulseFormOptional(
      ImpulseFormUnit(false),
      ImpulseFormUnit(0),
    )
    expectTypeOf(form_1.enabled.getOutput(scope)).toEqualTypeOf<
      null | boolean
    >()

    const form_2 = ImpulseFormOptional(
      ImpulseFormUnit(1, {
        transform: (input) => input > 0,
      }),
      ImpulseFormUnit(0),
    )
    expectTypeOf(form_2.enabled.getOutput(scope)).toEqualTypeOf<
      null | boolean
    >()

    const form_3 = ImpulseFormOptional(
      ImpulseFormUnit(1, {
        validate: (input): Result<string, boolean> => {
          return input > 0 ? [null, true] : ["Negative", null]
        },
      }),
      ImpulseFormUnit(0),
    )
    expectTypeOf(form_3.enabled.getOutput(scope)).toEqualTypeOf<
      null | boolean
    >()

    const form_4 = ImpulseFormOptional(
      ImpulseFormUnit(1, {
        schema: z.number().transform((input) => input > 0),
      }),
      ImpulseFormUnit(0),
    )
    expectTypeOf(form_4.enabled.getOutput(scope)).toEqualTypeOf<
      null | boolean
    >()

    const form_5 = ImpulseFormOptional(
      // @ts-expect-error should output boolean
      ImpulseFormUnit(1, {
        schema: z.number(),
      }),
      ImpulseFormUnit(0),
    )
    expectTypeOf(form_5.enabled.getOutput(scope)).toEqualTypeOf<null | number>()
  })
})

it("initiates with element input", ({ scope }) => {
  const form = ImpulseFormOptional(ImpulseFormUnit(true), ImpulseFormUnit(1))

  expect(form.getInput(scope)).toStrictEqual({
    enabled: true,
    element: 1,
  })
})

it("initiates with overridden input", ({ scope }) => {
  const form = ImpulseFormOptional(ImpulseFormUnit(true), ImpulseFormUnit(1), {
    input: {
      enabled: false,
      element: 2,
    },
  })

  expect(form.getInput(scope)).toStrictEqual({
    enabled: false,
    element: 2,
  })
})

it("sets input", ({ scope }) => {
  const form = ImpulseFormOptional(ImpulseFormUnit(true), ImpulseFormUnit(1))

  form.setInput({
    enabled: false,
    element: 5,
  })

  expect(form.getInput(scope)).toStrictEqual({
    enabled: false,
    element: 5,
  })
})

it("sets partial input", ({ scope }) => {
  const form = ImpulseFormOptional(ImpulseFormUnit(true), ImpulseFormUnit(1))

  form.setInput({
    element: 10,
  })
  expect(form.getInput(scope)).toStrictEqual({
    enabled: true,
    element: 10,
  })

  form.setInput({
    enabled: false,
  })
  expect(form.getInput(scope)).toStrictEqual({
    enabled: false,
    element: 10,
  })
})

describe("using recursive setter", () => {
  const enabled = ImpulseFormUnit(true)
  const element = ImpulseFormUnit(1)

  function setup(
    options?: ImpulseFormOptionalOptions<typeof enabled, typeof element>,
  ) {
    return ImpulseFormOptional(enabled, element, options)
  }

  describe.each<
    [
      string,
      (
        input: ImpulseFormOptionalInputSetter<typeof enabled, typeof element>,
      ) => ReturnType<typeof setup>,
    ]
  >([
    ["ImpulseFormOptionalOptions.input", (input) => setup({ input })],

    [
      "ImpulseFormOptional.setInput",
      (setter) => {
        const form = setup()

        form.setInput(setter)

        return form
      },
    ],
  ])("in %s", (_, run) => {
    it("passes input and initial recursively to all setters", ({ scope }) => {
      expect.assertions(8)

      const form = run((input, initial) => {
        expect(input).toStrictEqual({ enabled: true, element: 1 })
        expect(initial).toStrictEqual({ enabled: true, element: 1 })

        return {
          enabled: (input_enabled, initial_enabled) => {
            expect(input_enabled).toBe(true)
            expect(initial_enabled).toBe(true)

            return false
          },

          element: (input_element, initial_element) => {
            expect(input_element).toBe(1)
            expect(initial_element).toBe(1)

            return 2
          },
        }
      })

      expect(form.getInput(scope)).toStrictEqual({
        enabled: false,
        element: 2,
      })
      expect(form.getInitial(scope)).toStrictEqual({
        enabled: true,
        element: 1,
      })
    })
  })
})

describe("stable input value", () => {
  it("subsequently selects equal input", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true),
      ImpulseFormUnit({ a: 1 }),
    )

    const input_0 = form.getInput(scope)

    form.setInput({ element: { a: 1 } })
    const input_1 = form.getInput(scope)

    expect(input_0).not.toBe(input_1)
    expect(input_0).toStrictEqual(input_1)
  })
})
