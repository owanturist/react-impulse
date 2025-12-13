import type { Monitor } from "@owanturist/signal"

import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import type { Setter } from "~/tools/setter"

import {
  FormOptional,
  type FormOptionalInputSetter,
  type FormOptionalOptions,
  FormShape,
  FormUnit,
} from "../../src"

describe("types", () => {
  const form = FormOptional(FormUnit(true, { initial: false }), FormUnit(0, { initial: 1 }))

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

  it("matches schema type for getInitial(monitor)", () => {
    expectTypeOf(form.getInitial).toEqualTypeOf<(monitor: Monitor) => InitialSchema>()
  })

  it("matches setter type for setInitial(setter)", () => {
    expectTypeOf(form.setInitial).toEqualTypeOf<(setter: InitialSetter) => void>()
  })

  it("ensures FormOptionalOptions.initial type", () => {
    const form = FormOptional(FormUnit(true), FormUnit(0), {
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
    const parent = FormOptional(FormUnit(true), form)

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

    it("matches schema type for getInitial(monitor)", () => {
      expectTypeOf(parent.getInitial).toEqualTypeOf<(monitor: Monitor) => ParentInitialSchema>()
    })

    it("matches setter type for setInitial(setter)", () => {
      expectTypeOf(parent.setInitial).toEqualTypeOf<(setter: ParentInitialSetter) => void>()
    })
  })
})

it("initiates with element initial", ({ monitor }) => {
  const form = FormOptional(FormUnit(true), FormUnit(1))

  expect(form.getInitial(monitor)).toStrictEqual({ enabled: true, element: 1 })
})

it("initiates with overridden initial", ({ monitor }) => {
  const form = FormOptional(FormUnit(true), FormUnit(1), {
    initial: {
      enabled: false,
      element: 2,
    },
  })

  expect(form.getInitial(monitor)).toStrictEqual({ enabled: false, element: 2 })
})

it("sets initial", ({ monitor }) => {
  const form = FormOptional(FormUnit(true), FormUnit(1))

  form.setInitial({
    enabled: false,
    element: 10,
  })

  expect(form.getInitial(monitor)).toStrictEqual({
    enabled: false,
    element: 10,
  })
})

it("sets partial initial", ({ monitor }) => {
  const form = FormOptional(
    FormUnit(true),
    FormShape({
      _1: FormUnit(1),
      _2: FormUnit("1"),
    }),
  )

  form.setInitial({
    element: {
      _2: "2",
    },
  })

  expect(form.getInitial(monitor)).toStrictEqual({
    enabled: true,
    element: {
      _1: 1,
      _2: "2",
    },
  })
})

describe("using recursive setter", () => {
  const enabled = FormUnit(true, { initial: false })
  const element = FormUnit(0, { initial: 1 })

  function setup(options?: FormOptionalOptions<typeof enabled, typeof element>) {
    return FormOptional(enabled, element, options)
  }

  describe.each<
    [
      string,
      (
        initial: FormOptionalInputSetter<typeof enabled, typeof element>,
      ) => ReturnType<typeof setup>,
    ]
  >([
    ["FormOptionalOptions.initial", (initial) => setup({ initial })],

    [
      "FormOptional.setInitial",
      (setter) => {
        const form = setup()

        form.setInitial(setter)

        return form
      },
    ],
  ])("in %s", (_, run) => {
    it("passes initial and input recursively to all setters", ({ monitor }) => {
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

      expect(form.getInitial(monitor)).toStrictEqual({
        enabled: false,
        element: 2,
      })
      expect(form.getInput(monitor)).toStrictEqual({
        enabled: true,
        element: 0,
      })
    })
  })
})

describe("stable input value", () => {
  it("subsequently selects equal input", ({ monitor }) => {
    const form = FormOptional(FormUnit(true), FormUnit({ a: 1 }))

    const input0 = form.getInitial(monitor)

    form.setInitial({ element: { a: 1 } })
    const input1 = form.getInitial(monitor)

    expect(input0).not.toBe(input1)
    expect(input0).toStrictEqual(input1)
  })

  it("selects unequal initial values when isInputEqual is not specified", ({ monitor }) => {
    const form = FormOptional(FormUnit(true), FormUnit([0]))

    const initial0 = form.getInitial(monitor)

    form.setInitial({
      element: [0],
    })
    const initial1 = form.getInitial(monitor)

    expect(initial0).not.toBe(initial1)
    expect(initial0).toStrictEqual(initial1)
  })

  it("selects equal initial values when isInputEqual is specified", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(false),
      FormUnit([0], {
        isInputEqual: isShallowArrayEqual,
      }),
    )

    const initial0 = form.getInitial(monitor)

    form.setInitial({
      element: [0],
    })
    const initial1 = form.getInitial(monitor)

    expect(initial0).toBe(initial1)
    expect(initial0).toStrictEqual(initial1)
  })
})
