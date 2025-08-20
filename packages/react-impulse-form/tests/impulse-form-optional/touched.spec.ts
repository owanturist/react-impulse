import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormOptional,
  type ImpulseFormOptionalFlagSetter,
  type ImpulseFormOptionalOptions,
  ImpulseFormUnit,
} from "../../src"

describe("types", () => {
  const enabled = ImpulseFormUnit(true)
  const element = ImpulseFormUnit(0)

  const form = ImpulseFormOptional(enabled, element)

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

  it("matches schema type for isTouched(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isTouched(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(
      form.isTouched(scope, params._first),
    ).toEqualTypeOf<TouchedSchema>()

    expectTypeOf(
      form.isTouched(scope, params._second),
    ).toEqualTypeOf<TouchedVerboseSchema>()
  })

  it("matches setter type for setTouched(setter)", () => {
    expectTypeOf(form.setTouched).toEqualTypeOf<
      (setter: TouchedSetter) => void
    >()
  })

  it("allows passing concise value to setTouched", ({ scope }) => {
    const touched_0 = form.isTouched(scope)
    const touched_0_concise = form.isTouched(scope, params._first)
    const touched_0_verbose = form.isTouched(scope, params._second)

    form.setTouched(touched_0_concise)

    expect(form.isTouched(scope)).toStrictEqual(touched_0)
    expect(form.isTouched(scope, params._first)).toStrictEqual(
      touched_0_concise,
    )
    expect(form.isTouched(scope, params._second)).toStrictEqual(
      touched_0_verbose,
    )
  })

  it("allows passing verbose value to setTouched", ({ scope }) => {
    const touched_0 = form.isTouched(scope)
    const touched_0_concise = form.isTouched(scope, params._first)
    const touched_0_verbose = form.isTouched(scope, params._second)

    form.setTouched(touched_0_verbose)

    expect(form.isTouched(scope)).toStrictEqual(touched_0)
    expect(form.isTouched(scope, params._first)).toStrictEqual(
      touched_0_concise,
    )
    expect(form.isTouched(scope, params._second)).toStrictEqual(
      touched_0_verbose,
    )
  })

  it("allows passing verbose value in setTouched callback", ({ scope }) => {
    const touched_0 = form.isTouched(scope)
    const touched_0_concise = form.isTouched(scope, params._first)
    const touched_0_verbose = form.isTouched(scope, params._second)

    form.setTouched((verbose) => {
      return verbose
    })

    expect(form.isTouched(scope)).toStrictEqual(touched_0)
    expect(form.isTouched(scope, params._first)).toStrictEqual(
      touched_0_concise,
    )
    expect(form.isTouched(scope, params._second)).toStrictEqual(
      touched_0_verbose,
    )
  })

  it("ensures ImpulseFormOptionalOptions.touched type", () => {
    const form = ImpulseFormOptional(enabled, element, {
      touched: {
        // @ts-expect-error should be boolean
        enabled: 1,
        // @ts-expect-error should be boolean
        element: "",
      },
    } satisfies ImpulseFormOptionalOptions<typeof enabled, typeof element>)

    expectTypeOf(form).not.toBeUndefined()
  })

  describe("nested", () => {
    const parent = ImpulseFormOptional(ImpulseFormUnit(true), form)

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

    it("matches schema type for isTouched(scope, select?)", ({ scope }) => {
      expectTypeOf(parent.isTouched(scope)).toEqualTypeOf<boolean>()

      expectTypeOf(
        parent.isTouched(scope, params._first),
      ).toEqualTypeOf<ParentTouchedSchema>()

      expectTypeOf(
        parent.isTouched(scope, params._second),
      ).toEqualTypeOf<ParentTouchedVerboseSchema>()
    })

    it("matches setter type for setTouched(setter)", () => {
      expectTypeOf(parent.setTouched).toEqualTypeOf<
        (setter: ParentTouchedSetter) => void
      >()
    })

    it("allows passing concise value to setTouched", ({ scope }) => {
      const concise = parent.isTouched(scope, params._first)

      parent.setTouched(concise)

      expect(parent.isTouched(scope, params._first)).toStrictEqual(concise)
    })

    it("allows passing verbose value to setTouched", ({ scope }) => {
      const verbose = parent.isTouched(scope, params._second)

      parent.setTouched(verbose)

      expect(parent.isTouched(scope, params._second)).toStrictEqual(verbose)
    })
  })
})

describe.each([true, false])("when touched=%s", (touched) => {
  const differentTouched = !touched

  describe("when defining top-level concise ImpulseFormOptionalOptions.touched", () => {
    describe("when enabled", () => {
      it("overrides both touched", ({ scope }) => {
        const form = ImpulseFormOptional(
          ImpulseFormUnit(true, {
            touched: true,
          }),
          ImpulseFormUnit(1, {
            touched: false,
          }),
          {
            touched,
          },
        )

        expect(form.isTouched(scope)).toBe(touched)
        expect(form.isTouched(scope, params._first)).toBe(touched)
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          enabled: touched,
          element: touched,
        })
      })
    })

    describe("when disabled", () => {
      it("overrides only enabled", ({ scope }) => {
        const form = ImpulseFormOptional(
          ImpulseFormUnit(false, {
            touched: true,
          }),
          ImpulseFormUnit(1, {
            touched: false,
          }),
          {
            touched,
          },
        )

        expect(form.isTouched(scope)).toBe(touched)
        expect(form.isTouched(scope, params._first)).toBe(touched)
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          enabled: touched,
          element: false,
        })
      })
    })
  })

  describe("when defining ImpulseFormOptionalOptions.touched.enabled", () => {
    describe("when enabled", () => {
      it("overrides only enabled", ({ scope }) => {
        const form = ImpulseFormOptional(
          ImpulseFormUnit(true, {
            touched: true,
          }),
          ImpulseFormUnit(1, {
            touched: differentTouched,
          }),
          {
            touched: {
              enabled: touched,
            },
          },
        )

        expect(form.isTouched(scope)).toBe(true)
        expect(form.isTouched(scope, params._first)).toStrictEqual({
          enabled: touched,
          element: differentTouched,
        })
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          enabled: touched,
          element: differentTouched,
        })
      })
    })

    describe("when disabled", () => {
      it("overrides only enabled", ({ scope }) => {
        const form = ImpulseFormOptional(
          ImpulseFormUnit(false, {
            touched: true,
          }),
          ImpulseFormUnit(1, {
            touched: differentTouched,
          }),
          {
            touched: {
              enabled: touched,
            },
          },
        )

        expect(form.isTouched(scope)).toBe(touched)
        expect(form.isTouched(scope, params._first)).toBe(touched)
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          enabled: touched,
          element: differentTouched,
        })
      })
    })
  })

  describe("when defining ImpulseFormOptionalOptions.touched.element", () => {
    describe("when enabled", () => {
      it("overrides only element", ({ scope }) => {
        const form = ImpulseFormOptional(
          ImpulseFormUnit(true, {
            touched: differentTouched,
          }),
          ImpulseFormUnit(1, {
            touched: true,
          }),
          {
            touched: {
              element: touched,
            },
          },
        )

        expect(form.isTouched(scope)).toBe(true)
        expect(form.isTouched(scope, params._first)).toStrictEqual({
          enabled: differentTouched,
          element: touched,
        })
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          enabled: differentTouched,
          element: touched,
        })
      })
    })

    describe("when disabled", () => {
      it("overrides only element", ({ scope }) => {
        const form = ImpulseFormOptional(
          ImpulseFormUnit(false, {
            touched: differentTouched,
          }),
          ImpulseFormUnit(1, {
            touched: true,
          }),
          {
            touched: {
              element: touched,
            },
          },
        )

        expect(form.isTouched(scope)).toBe(differentTouched)
        expect(form.isTouched(scope, params._first)).toBe(differentTouched)
        expect(form.isTouched(scope, params._second)).toStrictEqual({
          enabled: differentTouched,
          element: touched,
        })
      })
    })
  })

  it("returns the touched as concise result when both have the same touched", ({
    scope,
  }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, {
        touched,
      }),
      ImpulseFormUnit(1, {
        touched,
      }),
    )

    expect(form.isTouched(scope)).toBe(touched)
    expect(form.isTouched(scope, params._first)).toBe(touched)
    expect(form.isTouched(scope, params._second)).toStrictEqual({
      enabled: touched,
      element: touched,
    })
  })
})

describe("stable touched value", () => {
  it("subsequently selects equal touched", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, {
        touched: false,
      }),
      ImpulseFormUnit(1, {
        touched: true,
      }),
    )

    expect(form.isTouched(scope)).toBe(form.isTouched(scope))
    expect(form.isTouched(scope, params._first)).toBe(
      form.isTouched(scope, params._first),
    )
    expect(form.isTouched(scope, params._second)).toBe(
      form.isTouched(scope, params._second),
    )
  })
})

describe("using recursive setter", () => {
  const enabled = ImpulseFormUnit(true, {
    touched: true,
  })
  const element = ImpulseFormUnit(1, {
    touched: false,
  })

  function setup(
    options?: ImpulseFormOptionalOptions<typeof enabled, typeof element>,
  ) {
    return ImpulseFormOptional(enabled, element, options)
  }

  describe.each<
    [
      string,
      (
        touched: ImpulseFormOptionalFlagSetter<typeof enabled, typeof element>,
      ) => ReturnType<typeof setup>,
    ]
  >([
    ["ImpulseFormOptionalOptions.touched", (touched) => setup({ touched })],

    [
      "ImpulseFormOptional.setTouched",
      (setter) => {
        const form = setup()

        form.setTouched(setter)

        return form
      },
    ],
  ])("in %s", (_, run) => {
    it("passes touched recursively to all setters", ({ scope }) => {
      expect.assertions(6)

      const form = run((touched) => {
        expect(touched).toStrictEqual({
          enabled: true,
          element: false,
        })

        return {
          enabled: (touched_enabled) => {
            expect(touched_enabled).toBe(true)

            return false
          },

          element: (touched_element) => {
            expect(touched_element).toBe(false)

            return true
          },
        }
      })

      expect(form.isTouched(scope)).toBe(true)
      expect(form.isTouched(scope, params._first)).toStrictEqual({
        enabled: false,
        element: true,
      })
      expect(form.isTouched(scope, params._second)).toStrictEqual({
        enabled: false,
        element: true,
      })
    })
  })
})
