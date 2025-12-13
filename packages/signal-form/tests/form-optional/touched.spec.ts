import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  FormOptional,
  type FormOptionalFlagSetter,
  type FormOptionalOptions,
  FormUnit,
} from "../../src"

describe("types", () => {
  const enabled = FormUnit(true)
  const element = FormUnit(0)

  const form = FormOptional(enabled, element)

  type TouchedSchema =
    | boolean
    | {
        readonly enabled: boolean
        readonly element: boolean
      }

  interface TouchedVerboseSchema {
    readonly enabled: boolean
    readonly element: boolean
  }

  type TouchedSetter = Setter<
    | boolean
    | {
        readonly enabled?: Setter<boolean>
        readonly element?: Setter<boolean>
      },
    [TouchedVerboseSchema]
  >

  it("matches schema type for isTouched(monitor, select?)", ({ monitor }) => {
    expectTypeOf(form.isTouched(monitor)).toEqualTypeOf<boolean>()

    expectTypeOf(form.isTouched(monitor, params._first)).toEqualTypeOf<TouchedSchema>()

    expectTypeOf(form.isTouched(monitor, params._second)).toEqualTypeOf<TouchedVerboseSchema>()
  })

  it("matches setter type for setTouched(setter)", () => {
    expectTypeOf(form.setTouched).toEqualTypeOf<(setter: TouchedSetter) => void>()
  })

  it("allows passing concise value to setTouched", ({ monitor }) => {
    const touched0 = form.isTouched(monitor)
    const touched0Concise = form.isTouched(monitor, params._first)
    const touched0Verbose = form.isTouched(monitor, params._second)

    form.setTouched(touched0Concise)

    expect(form.isTouched(monitor)).toStrictEqual(touched0)
    expect(form.isTouched(monitor, params._first)).toStrictEqual(touched0Concise)
    expect(form.isTouched(monitor, params._second)).toStrictEqual(touched0Verbose)
  })

  it("allows passing verbose value to setTouched", ({ monitor }) => {
    const touched0 = form.isTouched(monitor)
    const touched0Concise = form.isTouched(monitor, params._first)
    const touched0Verbose = form.isTouched(monitor, params._second)

    form.setTouched(touched0Verbose)

    expect(form.isTouched(monitor)).toStrictEqual(touched0)
    expect(form.isTouched(monitor, params._first)).toStrictEqual(touched0Concise)
    expect(form.isTouched(monitor, params._second)).toStrictEqual(touched0Verbose)
  })

  it("allows passing verbose value in setTouched callback", ({ monitor }) => {
    const touched0 = form.isTouched(monitor)
    const touched0Concise = form.isTouched(monitor, params._first)
    const touched0Verbose = form.isTouched(monitor, params._second)

    form.setTouched((verbose) => verbose)

    expect(form.isTouched(monitor)).toStrictEqual(touched0)
    expect(form.isTouched(monitor, params._first)).toStrictEqual(touched0Concise)
    expect(form.isTouched(monitor, params._second)).toStrictEqual(touched0Verbose)
  })

  it("ensures FormOptionalOptions.touched type", () => {
    const form = FormOptional(enabled, element, {
      touched: {
        // @ts-expect-error should be boolean
        enabled: 1,
        // @ts-expect-error should be boolean
        element: "",
      },
    } satisfies FormOptionalOptions<typeof enabled, typeof element>)

    expectTypeOf(form).not.toBeUndefined()
  })

  describe("nested", () => {
    const parent = FormOptional(FormUnit(true), form)

    type ParentTouchedSchema =
      | boolean
      | {
          readonly enabled: boolean
          readonly element: TouchedSchema
        }

    interface ParentTouchedVerboseSchema {
      readonly enabled: boolean
      readonly element: TouchedVerboseSchema
    }

    type ParentTouchedSetter = Setter<
      | boolean
      | {
          readonly enabled?: Setter<boolean>
          readonly element?: TouchedSetter
        },
      [ParentTouchedVerboseSchema]
    >

    it("matches schema type for isTouched(monitor, select?)", ({ monitor }) => {
      expectTypeOf(parent.isTouched(monitor)).toEqualTypeOf<boolean>()

      expectTypeOf(parent.isTouched(monitor, params._first)).toEqualTypeOf<ParentTouchedSchema>()

      expectTypeOf(
        parent.isTouched(monitor, params._second),
      ).toEqualTypeOf<ParentTouchedVerboseSchema>()
    })

    it("matches setter type for setTouched(setter)", () => {
      expectTypeOf(parent.setTouched).toEqualTypeOf<(setter: ParentTouchedSetter) => void>()
    })

    it("allows passing concise value to setTouched", ({ monitor }) => {
      const concise = parent.isTouched(monitor, params._first)

      parent.setTouched(concise)

      expect(parent.isTouched(monitor, params._first)).toStrictEqual(concise)
    })

    it("allows passing verbose value to setTouched", ({ monitor }) => {
      const verbose = parent.isTouched(monitor, params._second)

      parent.setTouched(verbose)

      expect(parent.isTouched(monitor, params._second)).toStrictEqual(verbose)
    })
  })
})

describe.each([true, false])("when touched=%s", (touched) => {
  const differentTouched = !touched

  describe("when defining top-level concise FormOptionalOptions.touched", () => {
    describe("when enabled", () => {
      it("overrides both touched", ({ monitor }) => {
        const form = FormOptional(
          FormUnit(true, {
            touched: true,
          }),
          FormUnit(1, {
            touched: false,
          }),
          {
            touched,
          },
        )

        expect(form.isTouched(monitor)).toBe(touched)
        expect(form.isTouched(monitor, params._first)).toBe(touched)
        expect(form.isTouched(monitor, params._second)).toStrictEqual({
          enabled: touched,
          element: touched,
        })
      })
    })

    describe("when disabled", () => {
      it("overrides only enabled", ({ monitor }) => {
        const form = FormOptional(
          FormUnit(false, {
            touched: true,
          }),
          FormUnit(1, {
            touched: false,
          }),
          {
            touched,
          },
        )

        expect(form.isTouched(monitor)).toBe(touched)
        expect(form.isTouched(monitor, params._first)).toBe(touched)
        expect(form.isTouched(monitor, params._second)).toStrictEqual({
          enabled: touched,
          element: false,
        })
      })
    })
  })

  describe("when defining FormOptionalOptions.touched.enabled", () => {
    describe("when enabled", () => {
      it("overrides only enabled", ({ monitor }) => {
        const form = FormOptional(
          FormUnit(true, {
            touched: true,
          }),
          FormUnit(1, {
            touched: differentTouched,
          }),
          {
            touched: {
              enabled: touched,
            },
          },
        )

        expect(form.isTouched(monitor)).toBe(true)
        expect(form.isTouched(monitor, params._first)).toStrictEqual({
          enabled: touched,
          element: differentTouched,
        })
        expect(form.isTouched(monitor, params._second)).toStrictEqual({
          enabled: touched,
          element: differentTouched,
        })
      })
    })

    describe("when disabled", () => {
      it("overrides only enabled", ({ monitor }) => {
        const form = FormOptional(
          FormUnit(false, {
            touched: true,
          }),
          FormUnit(1, {
            touched: differentTouched,
          }),
          {
            touched: {
              enabled: touched,
            },
          },
        )

        expect(form.isTouched(monitor)).toBe(touched)
        expect(form.isTouched(monitor, params._first)).toBe(touched)
        expect(form.isTouched(monitor, params._second)).toStrictEqual({
          enabled: touched,
          element: differentTouched,
        })
      })
    })
  })

  describe("when defining FormOptionalOptions.touched.element", () => {
    describe("when enabled", () => {
      it("overrides only element", ({ monitor }) => {
        const form = FormOptional(
          FormUnit(true, {
            touched: differentTouched,
          }),
          FormUnit(1, {
            touched: true,
          }),
          {
            touched: {
              element: touched,
            },
          },
        )

        expect(form.isTouched(monitor)).toBe(true)
        expect(form.isTouched(monitor, params._first)).toStrictEqual({
          enabled: differentTouched,
          element: touched,
        })
        expect(form.isTouched(monitor, params._second)).toStrictEqual({
          enabled: differentTouched,
          element: touched,
        })
      })
    })

    describe("when disabled", () => {
      it("overrides only element", ({ monitor }) => {
        const form = FormOptional(
          FormUnit(false, {
            touched: differentTouched,
          }),
          FormUnit(1, {
            touched: true,
          }),
          {
            touched: {
              element: touched,
            },
          },
        )

        expect(form.isTouched(monitor)).toBe(differentTouched)
        expect(form.isTouched(monitor, params._first)).toBe(differentTouched)
        expect(form.isTouched(monitor, params._second)).toStrictEqual({
          enabled: differentTouched,
          element: touched,
        })
      })
    })
  })

  it("returns the touched as concise result when both have the same touched", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, {
        touched,
      }),
      FormUnit(1, {
        touched,
      }),
    )

    expect(form.isTouched(monitor)).toBe(touched)
    expect(form.isTouched(monitor, params._first)).toBe(touched)
    expect(form.isTouched(monitor, params._second)).toStrictEqual({
      enabled: touched,
      element: touched,
    })
  })
})

describe("stable touched value", () => {
  it("subsequently selects equal touched", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, {
        touched: false,
      }),
      FormUnit(1, {
        touched: true,
      }),
    )

    expect(form.isTouched(monitor)).toBe(form.isTouched(monitor))
    expect(form.isTouched(monitor, params._first)).toBe(form.isTouched(monitor, params._first))
    expect(form.isTouched(monitor, params._second)).toBe(form.isTouched(monitor, params._second))
  })
})

describe("using recursive setter", () => {
  const enabled = FormUnit(true, {
    touched: true,
  })
  const element = FormUnit(1, {
    touched: false,
  })

  function setup(options?: FormOptionalOptions<typeof enabled, typeof element>) {
    return FormOptional(enabled, element, options)
  }

  describe.each<
    [
      string,
      (touched: FormOptionalFlagSetter<typeof enabled, typeof element>) => ReturnType<typeof setup>,
    ]
  >([
    ["FormOptionalOptions.touched", (touched) => setup({ touched })],

    [
      "FormOptional.setTouched",
      (setter) => {
        const form = setup()

        form.setTouched(setter)

        return form
      },
    ],
  ])("in %s", (_, run) => {
    it("passes touched recursively to all setters", ({ monitor }) => {
      expect.assertions(6)

      const form = run((touched) => {
        expect(touched).toStrictEqual({
          enabled: true,
          element: false,
        })

        return {
          enabled: (touchedEnabled) => {
            expect(touchedEnabled).toBe(true)

            return false
          },

          element: (touchedElement) => {
            expect(touchedElement).toBe(false)

            return true
          },
        }
      })

      expect(form.isTouched(monitor)).toBe(true)
      expect(form.isTouched(monitor, params._first)).toStrictEqual({
        enabled: false,
        element: true,
      })
      expect(form.isTouched(monitor, params._second)).toStrictEqual({
        enabled: false,
        element: true,
      })
    })
  })
})
