import type { Scope } from "react-impulse"

import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormOptional,
  type ImpulseFormOptionalInputSetter,
  type ImpulseFormOptionalOptions,
  ImpulseFormShape,
  ImpulseFormUnit,
} from "../../src"

describe("types", () => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { initial: false }),
    ImpulseFormUnit(0, { initial: 1 }),
  )

  interface InitialSchema {
    readonly enabled: boolean
    readonly element: number
  }

  type InitialSetter = Setter<
    {
      readonly enabled?: Setter<boolean, [boolean, boolean]>
      readonly element?: Setter<number, [number, number]>
    },
    [InitialSchema, InitialSchema]
  >

  it("matches schema type for getInitial(scope)", () => {
    expectTypeOf(form.getInitial).toEqualTypeOf<(scope: Scope) => InitialSchema>()
  })

  it("matches setter type for setInitial(setter)", () => {
    expectTypeOf(form.setInitial).toEqualTypeOf<(setter: InitialSetter) => void>()
  })

  it("ensures ImpulseFormOptionalOptions.initial type", () => {
    const form = ImpulseFormOptional(ImpulseFormUnit(true), ImpulseFormUnit(0), {
      initial: {
        // @ts-expect-error should be boolean
        enabled: 1,
        // @ts-expect-error should be number
        element: "0",
      },
    })

    expectTypeOf(form).not.toBeUndefined()
  })

  describe("nested", () => {
    const parent = ImpulseFormOptional(ImpulseFormUnit(true), form)

    interface ParentInitialSchema {
      readonly enabled: boolean
      readonly element: InitialSchema
    }

    type ParentInitialSetter = Setter<
      {
        readonly enabled?: Setter<boolean, [boolean, boolean]>
        readonly element?: InitialSetter
      },
      [ParentInitialSchema, ParentInitialSchema]
    >

    it("matches schema type for getInitial(scope)", () => {
      expectTypeOf(parent.getInitial).toEqualTypeOf<(scope: Scope) => ParentInitialSchema>()
    })

    it("matches setter type for setInitial(setter)", () => {
      expectTypeOf(parent.setInitial).toEqualTypeOf<(setter: ParentInitialSetter) => void>()
    })
  })
})

it("initiates with element initial", ({ scope }) => {
  const form = ImpulseFormOptional(ImpulseFormUnit(true), ImpulseFormUnit(1))

  expect(form.getInitial(scope)).toStrictEqual({ enabled: true, element: 1 })
})

it("initiates with overridden initial", ({ scope }) => {
  const form = ImpulseFormOptional(ImpulseFormUnit(true), ImpulseFormUnit(1), {
    initial: {
      enabled: false,
      element: 2,
    },
  })

  expect(form.getInitial(scope)).toStrictEqual({ enabled: false, element: 2 })
})

it("sets initial", ({ scope }) => {
  const form = ImpulseFormOptional(ImpulseFormUnit(true), ImpulseFormUnit(1))

  form.setInitial({
    enabled: false,
    element: 10,
  })

  expect(form.getInitial(scope)).toStrictEqual({
    enabled: false,
    element: 10,
  })
})

it("sets partial initial", ({ scope }) => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true),
    ImpulseFormShape({
      _1: ImpulseFormUnit(1),
      _2: ImpulseFormUnit("1"),
    }),
  )

  form.setInitial({
    element: {
      _2: "2",
    },
  })

  expect(form.getInitial(scope)).toStrictEqual({
    enabled: true,
    element: {
      _1: 1,
      _2: "2",
    },
  })
})

describe("using recursive setter", () => {
  const enabled = ImpulseFormUnit(true, { initial: false })
  const element = ImpulseFormUnit(0, { initial: 1 })

  function setup(options?: ImpulseFormOptionalOptions<typeof enabled, typeof element>) {
    return ImpulseFormOptional(enabled, element, options)
  }

  describe.each<
    [
      string,
      (
        initial: ImpulseFormOptionalInputSetter<typeof enabled, typeof element>,
      ) => ReturnType<typeof setup>,
    ]
  >([
    ["ImpulseFormOptionalOptions.initial", (initial) => setup({ initial })],

    [
      "ImpulseFormOptional.setInitial",
      (setter) => {
        const form = setup()

        form.setInitial(setter)

        return form
      },
    ],
  ])("in %s", (_, run) => {
    it("passes initial and input recursively to all setters", ({ scope }) => {
      expect.assertions(8)

      const form = run((initial, input) => {
        expect(input).toStrictEqual({ enabled: true, element: 0 })
        expect(initial).toStrictEqual({ enabled: false, element: 1 })

        return {
          enabled: (initialEnabled, inputEnabled) => {
            expect(initialEnabled).toBe(false)
            expect(inputEnabled).toBe(true)

            return false
          },

          element: (initialElement, inputElement) => {
            expect(initialElement).toBe(1)
            expect(inputElement).toBe(0)

            return 2
          },
        }
      })

      expect(form.getInitial(scope)).toStrictEqual({
        enabled: false,
        element: 2,
      })
      expect(form.getInput(scope)).toStrictEqual({
        enabled: true,
        element: 0,
      })
    })
  })
})

describe("stable input value", () => {
  it("subsequently selects equal input", ({ scope }) => {
    const form = ImpulseFormOptional(ImpulseFormUnit(true), ImpulseFormUnit({ a: 1 }))

    const input0 = form.getInitial(scope)

    form.setInitial({ element: { a: 1 } })
    const input1 = form.getInitial(scope)

    expect(input0).not.toBe(input1)
    expect(input0).toStrictEqual(input1)
  })

  it("selects unequal initial values when isInputEqual is not specified", ({ scope }) => {
    const form = ImpulseFormOptional(ImpulseFormUnit(true), ImpulseFormUnit([0]))

    const initial0 = form.getInitial(scope)

    form.setInitial({
      element: [0],
    })
    const initial1 = form.getInitial(scope)

    expect(initial0).not.toBe(initial1)
    expect(initial0).toStrictEqual(initial1)
  })

  it("selects equal initial values when isInputEqual is specified", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(false),
      ImpulseFormUnit([0], {
        isInputEqual: isShallowArrayEqual,
      }),
    )

    const initial0 = form.getInitial(scope)

    form.setInitial({
      element: [0],
    })
    const initial1 = form.getInitial(scope)

    expect(initial0).toBe(initial1)
    expect(initial0).toStrictEqual(initial1)
  })
})
