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

  it("matches schema type for getValidateOn(monitor, select?)", ({ monitor }) => {
    expectTypeOf(form.getValidateOn(monitor)).toEqualTypeOf<ValidateOnSchema>()

    expectTypeOf(form.getValidateOn(monitor, params._first)).toEqualTypeOf<ValidateOnSchema>()

    expectTypeOf(
      form.getValidateOn(monitor, params._second),
    ).toEqualTypeOf<ValidateOnVerboseSchema>()
  })

  it("matches setter type for setValidateOn(setter)", () => {
    expectTypeOf(form.setValidateOn).toEqualTypeOf<(setter: ValidateOnSetter) => void>()
  })

  it("allows passing concise value to setValidateOn", ({ monitor }) => {
    const validateOn0 = form.getValidateOn(monitor)
    const validateOn0Concise = form.getValidateOn(monitor, params._first)
    const validateOn0Verbose = form.getValidateOn(monitor, params._second)

    form.setValidateOn(validateOn0Concise)

    expect(form.getValidateOn(monitor)).toStrictEqual(validateOn0)
    expect(form.getValidateOn(monitor, params._first)).toStrictEqual(validateOn0Concise)
    expect(form.getValidateOn(monitor, params._second)).toStrictEqual(validateOn0Verbose)
  })

  it("allows passing verbose value to setValidateOn", ({ monitor }) => {
    const validateOn0 = form.getValidateOn(monitor)
    const validateOn0Concise = form.getValidateOn(monitor, params._first)
    const validateOn0Verbose = form.getValidateOn(monitor, params._second)

    form.setValidateOn(validateOn0Verbose)

    expect(form.getValidateOn(monitor)).toStrictEqual(validateOn0)
    expect(form.getValidateOn(monitor, params._first)).toStrictEqual(validateOn0Concise)
    expect(form.getValidateOn(monitor, params._second)).toStrictEqual(validateOn0Verbose)
  })

  it("allows passing verbose value in setValidateOn callback", ({ monitor }) => {
    const validateOn0 = form.getValidateOn(monitor)
    const validateOn0Concise = form.getValidateOn(monitor, params._first)
    const validateOn0Verbose = form.getValidateOn(monitor, params._second)

    form.setValidateOn((verbose) => verbose)

    expect(form.getValidateOn(monitor)).toStrictEqual(validateOn0)
    expect(form.getValidateOn(monitor, params._first)).toStrictEqual(validateOn0Concise)
    expect(form.getValidateOn(monitor, params._second)).toStrictEqual(validateOn0Verbose)
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

    it("matches schema type for getValidateOn(monitor, select?)", ({ monitor }) => {
      expectTypeOf(parent.getValidateOn(monitor)).toEqualTypeOf<ParentValidateOnSchema>()

      expectTypeOf(
        parent.getValidateOn(monitor, params._first),
      ).toEqualTypeOf<ParentValidateOnSchema>()

      expectTypeOf(
        parent.getValidateOn(monitor, params._second),
      ).toEqualTypeOf<ParentValidateOnVerboseSchema>()
    })

    it("matches setter type for setValidateOn(setter)", () => {
      expectTypeOf(parent.setValidateOn).toEqualTypeOf<(setter: ParentValidateOnSetter) => void>()
    })

    it("allows passing concise value to setValidateOn", ({ monitor }) => {
      const concise = parent.getValidateOn(monitor, params._first)

      parent.setValidateOn(concise)

      expect(parent.getValidateOn(monitor, params._first)).toStrictEqual(concise)
    })

    it("allows passing verbose value to setValidateOn", ({ monitor }) => {
      const verbose = parent.getValidateOn(monitor, params._second)

      parent.setValidateOn(verbose)

      expect(parent.getValidateOn(monitor, params._second)).toStrictEqual(verbose)
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
    describe("when enabled", () => {
      it("overrides both validateOn", ({ monitor }) => {
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

        expect(form.getValidateOn(monitor)).toBe(validateOn)
        expect(form.getValidateOn(monitor, params._first)).toBe(validateOn)
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          enabled: validateOn,
          element: validateOn,
        })
      })
    })

    describe("when disabled", () => {
      it("overrides only enabled", ({ monitor }) => {
        const form = ImpulseFormOptional(
          ImpulseFormUnit(false, {
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

        expect(form.getValidateOn(monitor)).toBe(validateOn)
        expect(form.getValidateOn(monitor, params._first)).toBe(validateOn)
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          enabled: validateOn,
          element: "onSubmit",
        })
      })
    })
  })

  describe("when defining ImpulseFormOptionalOptions.validateOn.enabled", () => {
    describe("when enabled", () => {
      it("overrides only enabled", ({ monitor }) => {
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

        expect(form.getValidateOn(monitor)).toStrictEqual({
          enabled: validateOn,
          element: differentValidateOn,
        })
        expect(form.getValidateOn(monitor, params._first)).toStrictEqual({
          enabled: validateOn,
          element: differentValidateOn,
        })
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          enabled: validateOn,
          element: differentValidateOn,
        })
      })
    })

    describe("when disabled", () => {
      it("overrides only enabled", ({ monitor }) => {
        const form = ImpulseFormOptional(
          ImpulseFormUnit(false, {
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

        expect(form.getValidateOn(monitor)).toBe(validateOn)
        expect(form.getValidateOn(monitor, params._first)).toBe(validateOn)
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          enabled: validateOn,
          element: differentValidateOn,
        })
      })
    })
  })

  describe("when defining ImpulseFormOptionalOptions.validateOn.element", () => {
    describe("when enabled", () => {
      it("overrides only element", ({ monitor }) => {
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

        expect(form.getValidateOn(monitor)).toStrictEqual({
          enabled: differentValidateOn,
          element: validateOn,
        })
        expect(form.getValidateOn(monitor, params._first)).toStrictEqual({
          enabled: differentValidateOn,
          element: validateOn,
        })
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          enabled: differentValidateOn,
          element: validateOn,
        })
      })
    })

    describe("when disabled", () => {
      it("overrides only element", ({ monitor }) => {
        const form = ImpulseFormOptional(
          ImpulseFormUnit(false, {
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

        expect(form.getValidateOn(monitor)).toBe(differentValidateOn)
        expect(form.getValidateOn(monitor, params._first)).toBe(differentValidateOn)
        expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
          enabled: differentValidateOn,
          element: validateOn,
        })
      })
    })
  })

  it("returns the ValidateStrategy as concise result when both have the same ValidateStrategy", ({
    monitor,
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

    expect(form.getValidateOn(monitor)).toBe(validateOn)
    expect(form.getValidateOn(monitor, params._first)).toBe(validateOn)
    expect(form.getValidateOn(monitor, params._second)).toStrictEqual({
      enabled: validateOn,
      element: validateOn,
    })
  })
})

describe("stable validateOn value", () => {
  it("subsequently selects equal validateOn", ({ monitor }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true),
      ImpulseFormUnit(1, {
        validateOn: "onTouch",
        schema: z.number(),
      }),
    )

    expect(form.getValidateOn(monitor)).toBe(form.getValidateOn(monitor))
    expect(form.getValidateOn(monitor, params._first)).toBe(
      form.getValidateOn(monitor, params._first),
    )
    expect(form.getValidateOn(monitor, params._second)).toBe(
      form.getValidateOn(monitor, params._second),
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

  function setup(options?: ImpulseFormOptionalOptions<typeof enabled, typeof element>) {
    return ImpulseFormOptional(enabled, element, options)
  }

  describe.each<
    [
      string,
      (
        validateOn: ImpulseFormOptionalValidateOnSetter<typeof enabled, typeof element>,
      ) => ReturnType<typeof setup>,
    ]
  >([
    ["ImpulseFormOptionalOptions.validateOn", (validateOn) => setup({ validateOn })],

    [
      "ImpulseFormOptional.setValidateOn",
      (setter) => {
        const form = setup()

        form.setValidateOn(setter)

        return form
      },
    ],
  ])("in %s", (_, run) => {
    it("passes validateOn recursively to all setters", ({ monitor }) => {
      expect.assertions(4)

      const form = run((validateOn) => {
        expect(validateOn).toStrictEqual({
          enabled: "onInit",
          element: "onSubmit",
        })

        return {
          enabled: (validateOnEnabled) => {
            expect(validateOnEnabled).toBe("onInit")

            return "onChange"
          },

          element: (validateOnElement) => {
            expect(validateOnElement).toBe("onSubmit")

            return "onTouch"
          },
        }
      })

      expect(form.getValidateOn(monitor)).toStrictEqual({
        enabled: "onChange",
        element: "onTouch",
      })
    })
  })
})
