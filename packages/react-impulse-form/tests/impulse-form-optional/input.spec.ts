import type { Scope } from "react-impulse"
import z from "zod"

import type { Setter } from "~/tools/setter"

import {
  ImpulseFormOptional,
  type ImpulseFormOptionalInputSetter,
  type ImpulseFormOptionalOptions,
  ImpulseFormUnit,
} from "../../src"

describe("types", () => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit(0, { schema: z.number() }),
  )

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
      ImpulseFormUnit(true, { schema: z.boolean() }),
      ImpulseFormUnit(0, { schema: z.number() }),
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
    const parent = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      form,
    )

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
})

it("initiates with children input", ({ scope }) => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit(1, { schema: z.number() }),
  )

  expect(form.getInput(scope)).toStrictEqual({
    enabled: true,
    element: 1,
  })
})

it("initiates with overridden input", ({ scope }) => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit(1, { schema: z.number() }),
    {
      input: {
        enabled: false,
        element: 2,
      },
    },
  )

  expect(form.getInput(scope)).toStrictEqual({
    enabled: false,
    element: 2,
  })
})

it("sets input", ({ scope }) => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit(1, { schema: z.number() }),
  )

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
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit(1, { schema: z.number() }),
  )

  form.setInput({ element: 10 })
  expect(form.getInput(scope)).toStrictEqual({ enabled: true, element: 10 })

  form.setInput({ enabled: false })
  expect(form.getInput(scope)).toStrictEqual({ enabled: false, element: 10 })
})

describe("using recursive setter", () => {
  const enabled = ImpulseFormUnit(true, { schema: z.boolean() })
  const element = ImpulseFormUnit(1, { schema: z.number() })

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
    it("passes initial and input recursively to all setters", ({ scope }) => {
      expect.assertions(7)

      const form = run((input, initial) => {
        expect(input).toStrictEqual({ enabled: true, element: 1 })
        expect(initial).toStrictEqual({ enabled: true, element: 1 })

        return {
          enabled: (i, init) => {
            expect(i).toBe(true)
            expect(init).toBe(true)

            return false
          },

          element: (i, init) => {
            expect(i).toBe(1)
            expect(init).toBe(1)

            return 2
          },
        }
      })

      expect(form.getInput(scope)).toStrictEqual({ enabled: false, element: 2 })
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
