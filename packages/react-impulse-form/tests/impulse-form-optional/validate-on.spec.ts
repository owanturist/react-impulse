import z from "zod"

import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormOptional,
  type ImpulseFormOptionalOptions,
  type ImpulseFormOptionalValidateOnSetter,
  ImpulseFormUnit,
  type ValidateStrategy,
} from "../../src"

describe("types", () => {
  const enabled = ImpulseFormUnit(true)
  const element = ImpulseFormUnit(0)

  const form = ImpulseFormOptional(enabled, element)

  type ValidateOnSchema =
    | ValidateStrategy
    | {
        readonly enabled: ValidateStrategy
        readonly element: ValidateStrategy
      }

  interface ValidateOnVerboseSchema {
    readonly enabled: ValidateStrategy
    readonly element: ValidateStrategy
  }

  type ValidateOnSetter = Setter<
    | ValidateStrategy
    | {
        readonly enabled?: Setter<ValidateStrategy>
        readonly element?: Setter<ValidateStrategy>
      },
    [ValidateOnVerboseSchema]
  >

  it("matches schema type for getValidateOn(scope, select?)", ({ scope }) => {
    expectTypeOf(form.getValidateOn(scope)).toEqualTypeOf<ValidateOnSchema>()

    expectTypeOf(
      form.getValidateOn(scope, params._first),
    ).toEqualTypeOf<ValidateOnSchema>()

    expectTypeOf(
      form.getValidateOn(scope, params._second),
    ).toEqualTypeOf<ValidateOnVerboseSchema>()
  })

  it("matches setter type for setValidateOn(setter)", () => {
    expectTypeOf(form.setValidateOn).toEqualTypeOf<
      (setter: ValidateOnSetter) => void
    >()
  })

  it("allows passing concise value to setValidateOn", ({ scope }) => {
    const validateOn_0 = form.getValidateOn(scope)
    const validateOn_0_concise = form.getValidateOn(scope, params._first)
    const validateOn_0_verbose = form.getValidateOn(scope, params._second)

    form.setValidateOn(validateOn_0_concise)

    expect(form.getValidateOn(scope)).toStrictEqual(validateOn_0)
    expect(form.getValidateOn(scope, params._first)).toStrictEqual(
      validateOn_0_concise,
    )
    expect(form.getValidateOn(scope, params._second)).toStrictEqual(
      validateOn_0_verbose,
    )
  })

  it("allows passing verbose value to setValidateOn", ({ scope }) => {
    const validateOn_0 = form.getValidateOn(scope)
    const validateOn_0_concise = form.getValidateOn(scope, params._first)
    const validateOn_0_verbose = form.getValidateOn(scope, params._second)

    form.setValidateOn(validateOn_0_verbose)

    expect(form.getValidateOn(scope)).toStrictEqual(validateOn_0)
    expect(form.getValidateOn(scope, params._first)).toStrictEqual(
      validateOn_0_concise,
    )
    expect(form.getValidateOn(scope, params._second)).toStrictEqual(
      validateOn_0_verbose,
    )
  })

  it("allows passing verbose value in setValidateOn callback", ({ scope }) => {
    const validateOn_0 = form.getValidateOn(scope)
    const validateOn_0_concise = form.getValidateOn(scope, params._first)
    const validateOn_0_verbose = form.getValidateOn(scope, params._second)

    form.setValidateOn((verbose) => {
      return verbose
    })

    expect(form.getValidateOn(scope)).toStrictEqual(validateOn_0)
    expect(form.getValidateOn(scope, params._first)).toStrictEqual(
      validateOn_0_concise,
    )
    expect(form.getValidateOn(scope, params._second)).toStrictEqual(
      validateOn_0_verbose,
    )
  })

  it("ensures ImpulseFormOptionalOptions.validateOn type", () => {
    const form = ImpulseFormOptional(enabled, element, {
      validateOn: {
        // @ts-expect-error should be ValidateStrategy
        enabled: 1,
        // @ts-expect-error should be ValidateStrategy
        element: "",
      },
    } satisfies ImpulseFormOptionalOptions<typeof enabled, typeof element>)

    expectTypeOf(form).not.toBeUndefined()
  })

  describe("nested", () => {
    const parent = ImpulseFormOptional(ImpulseFormUnit(true), form)

    type ParentValidateOnSchema =
      | ValidateStrategy
      | {
          readonly enabled: ValidateStrategy
          readonly element: ValidateOnSchema
        }

    interface ParentValidateOnVerboseSchema {
      readonly enabled: ValidateStrategy
      readonly element: ValidateOnVerboseSchema
    }

    type ParentValidateOnSetter = Setter<
      | ValidateStrategy
      | {
          readonly enabled?: Setter<ValidateStrategy>
          readonly element?: ValidateOnSetter
        },
      [ParentValidateOnVerboseSchema]
    >

    it("matches schema type for getValidateOn(scope, select?)", ({ scope }) => {
      expectTypeOf(
        parent.getValidateOn(scope),
      ).toEqualTypeOf<ParentValidateOnSchema>()

      expectTypeOf(
        parent.getValidateOn(scope, params._first),
      ).toEqualTypeOf<ParentValidateOnSchema>()

      expectTypeOf(
        parent.getValidateOn(scope, params._second),
      ).toEqualTypeOf<ParentValidateOnVerboseSchema>()
    })

    it("matches setter type for setValidateOn(setter)", () => {
      expectTypeOf(parent.setValidateOn).toEqualTypeOf<
        (setter: ParentValidateOnSetter) => void
      >()
    })

    it("allows passing concise value to setValidateOn", ({ scope }) => {
      const concise = parent.getValidateOn(scope, params._first)

      parent.setValidateOn(concise)

      expect(parent.getValidateOn(scope, params._first)).toStrictEqual(concise)
    })

    it("allows passing verbose value to setValidateOn", ({ scope }) => {
      const verbose = parent.getValidateOn(scope, params._second)

      parent.setValidateOn(verbose)

      expect(parent.getValidateOn(scope, params._second)).toStrictEqual(verbose)
    })
  })
})

describe.each([
  ["onTouch" as const, "onChange" as const],
  ["onChange" as const, "onSubmit" as const],
  ["onSubmit" as const, "onInit" as const],
  ["onInit" as const, "onTouch" as const],
])("when ValidateStrategy=%s", (validateOn, differentValidateOn) => {
  describe("when defining top-level concise ImpulseFormOptionalOptions.validateOn", () => {
    it("overrides both validateOn", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(true, {
          validateOn: "onChange",
          schema: z.boolean(),
        }),
        ImpulseFormUnit(1, {
          validateOn: "onSubmit",
          schema: z.number(),
        }),
        {
          validateOn,
        },
      )

      expect(form.getValidateOn(scope)).toBe(validateOn)
      expect(form.getValidateOn(scope, params._first)).toBe(validateOn)
      expect(form.getValidateOn(scope, params._second)).toStrictEqual({
        enabled: validateOn,
        element: validateOn,
      })
    })
  })

  describe("when defining ImpulseFormOptionalOptions.validateOn.enabled", () => {
    it("overrides only enabled", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(true, {
          validateOn: "onChange",
          schema: z.boolean(),
        }),
        ImpulseFormUnit(1, {
          validateOn: differentValidateOn,
          schema: z.number(),
        }),
        {
          validateOn: {
            enabled: validateOn,
          },
        },
      )

      expect(form.getValidateOn(scope)).toStrictEqual({
        enabled: validateOn,
        element: differentValidateOn,
      })
      expect(form.getValidateOn(scope, params._second)).toStrictEqual({
        enabled: validateOn,
        element: differentValidateOn,
      })
    })
  })

  describe("when defining ImpulseFormOptionalOptions.validateOn.element", () => {
    it("overrides only element", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(true, {
          validateOn: differentValidateOn,
          schema: z.boolean(),
        }),
        ImpulseFormUnit(1, {
          validateOn: "onSubmit",
          schema: z.number(),
        }),
        {
          validateOn: {
            element: validateOn,
          },
        },
      )

      expect(form.getValidateOn(scope)).toStrictEqual({
        enabled: differentValidateOn,
        element: validateOn,
      })
      expect(form.getValidateOn(scope, params._second)).toStrictEqual({
        enabled: differentValidateOn,
        element: validateOn,
      })
    })
  })

  it("returns the ValidateStrategy as concise result when both have the same ValidateStrategy", ({
    scope,
  }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, {
        validateOn,
        schema: z.boolean(),
      }),
      ImpulseFormUnit(1, {
        validateOn,
        schema: z.number(),
      }),
    )

    expect(form.getValidateOn(scope)).toBe(validateOn)
    expect(form.getValidateOn(scope, params._first)).toBe(validateOn)
    expect(form.getValidateOn(scope, params._second)).toStrictEqual({
      enabled: validateOn,
      element: validateOn,
    })
  })
})

describe("stable validateOn value", () => {
  it("subsequently selects equal validateOn", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true),
      ImpulseFormUnit(1, {
        validateOn: "onTouch",
        schema: z.number(),
      }),
    )

    expect(form.getValidateOn(scope)).toBe(form.getValidateOn(scope))
    expect(form.getValidateOn(scope, params._first)).toBe(
      form.getValidateOn(scope, params._first),
    )
    expect(form.getValidateOn(scope, params._second)).toBe(
      form.getValidateOn(scope, params._second),
    )
  })
})

describe("using recursive setter", () => {
  const enabled = ImpulseFormUnit(true, {
    schema: z.boolean(),
    validateOn: "onInit",
  })
  const element = ImpulseFormUnit(1, {
    schema: z.number(),
    validateOn: "onSubmit",
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
        validateOn: ImpulseFormOptionalValidateOnSetter<
          typeof enabled,
          typeof element
        >,
      ) => ReturnType<typeof setup>,
    ]
  >([
    [
      "ImpulseFormOptionalOptions.validateOn",
      (validateOn) => setup({ validateOn }),
    ],

    [
      "ImpulseFormOptional.setValidateOn",
      (setter) => {
        const form = setup()

        form.setValidateOn(setter)

        return form
      },
    ],
  ])("in %s", (_, run) => {
    it("passes validateOn recursively to all setters", ({ scope }) => {
      expect.assertions(4)

      const form = run((validateOn) => {
        expect(validateOn).toStrictEqual({
          enabled: "onInit",
          element: "onSubmit",
        })

        return {
          enabled: (validateOn_enabled) => {
            expect(validateOn_enabled).toBe("onInit")

            return "onChange"
          },

          element: (validateOn_element) => {
            expect(validateOn_element).toBe("onSubmit")

            return "onTouch"
          },
        }
      })

      expect(form.getValidateOn(scope)).toStrictEqual({
        enabled: "onChange",
        element: "onTouch",
      })
    })
  })
})
