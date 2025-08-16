import z from "zod"

import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import {
  ImpulseFormOptional,
  type ImpulseFormOptionalOptions,
  ImpulseFormUnit,
  type Result,
} from "../../src"

describe("types", () => {
  const enabled = ImpulseFormUnit(true, { schema: z.boolean() })
  const element = ImpulseFormUnit(0, {
    validate: (input): Result<string, number> => {
      if (input > 0) {
        return [null, input]
      }

      return ["Too small", null]
    },
    validateOn: "onInit",
  })

  const form = ImpulseFormOptional(enabled, element)

  type ErrorSchema = null | {
    readonly enabled: null | ReadonlyArray<string>
    readonly element: null | string
  }

  interface ErrorVerboseSchema {
    readonly enabled: null | ReadonlyArray<string>
    readonly element: null | string
  }

  type ErrorSetter = Setter<
    null | {
      readonly enabled?: Setter<null | ReadonlyArray<string>>
      readonly element?: Setter<null | string>
    },
    [ErrorVerboseSchema]
  >

  it("matches schema type for getError(scope, select?)", ({ scope }) => {
    expectTypeOf(form.getError(scope)).toEqualTypeOf<ErrorSchema>()
    expectTypeOf(
      form.getError(scope, params._first),
    ).toEqualTypeOf<ErrorSchema>()
    expectTypeOf(
      form.getError(scope, params._second),
    ).toEqualTypeOf<ErrorVerboseSchema>()
  })

  it("matches setter type for setError(setter)", () => {
    expectTypeOf(form.setError).toEqualTypeOf<(setter: ErrorSetter) => void>()
  })

  it("allows passing concise value to setError", ({ scope }) => {
    const error_0 = form.getError(scope)
    const error_0_concise = form.getError(scope, params._first)
    const error_0_verbose = form.getError(scope, params._second)

    form.setError(error_0_concise)

    expect(form.getError(scope)).toStrictEqual(error_0)
    expect(form.getError(scope, params._first)).toStrictEqual(error_0_concise)
    expect(form.getError(scope, params._second)).toStrictEqual(error_0_verbose)
  })

  it("allows passing verbose value to setError", ({ scope }) => {
    const error_0 = form.getError(scope)
    const error_0_concise = form.getError(scope, params._first)
    const error_0_verbose = form.getError(scope, params._second)

    form.setError(error_0_verbose)

    expect(form.getError(scope)).toStrictEqual(error_0)
    expect(form.getError(scope, params._first)).toStrictEqual(error_0_concise)
    expect(form.getError(scope, params._second)).toStrictEqual(error_0_verbose)
  })

  it("allows passing verbose value in setError callback", ({ scope }) => {
    const error_0 = form.getError(scope)
    const error_0_concise = form.getError(scope, params._first)
    const error_0_verbose = form.getError(scope, params._second)

    form.setError((verbose) => verbose)

    expect(form.getError(scope)).toStrictEqual(error_0)
    expect(form.getError(scope, params._first)).toStrictEqual(error_0_concise)
    expect(form.getError(scope, params._second)).toStrictEqual(error_0_verbose)
  })

  it("ensures ImpulseFormOptionalOptions.error type", () => {
    const form = ImpulseFormOptional(enabled, element, {
      error: {
        // @ts-expect-error should be ReadonlyArray<string>
        enabled: 1,
        // @ts-expect-error should be string
        element: [],
      },
    } satisfies ImpulseFormOptionalOptions<typeof enabled, typeof element>)

    expectTypeOf(form).not.toBeUndefined()
  })

  describe("nested", () => {
    const parent = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      form,
    )

    type ParentErrorSchema = null | {
      readonly enabled: null | ReadonlyArray<string>
      readonly element: ErrorSchema
    }

    interface ParentErrorVerboseSchema {
      readonly enabled: null | ReadonlyArray<string>
      readonly element: ErrorVerboseSchema
    }

    type ParentErrorSetter = Setter<
      null | {
        readonly enabled?: Setter<null | ReadonlyArray<string>>
        readonly element?: ErrorSetter
      },
      [ParentErrorVerboseSchema]
    >

    it("matches schema type for getError(scope, select?)", ({ scope }) => {
      expectTypeOf(parent.getError(scope)).toEqualTypeOf<ParentErrorSchema>()
      expectTypeOf(
        parent.getError(scope, params._first),
      ).toEqualTypeOf<ParentErrorSchema>()
      expectTypeOf(
        parent.getError(scope, params._second),
      ).toEqualTypeOf<ParentErrorVerboseSchema>()
    })

    it("matches setter type for setError(setter)", () => {
      expectTypeOf(parent.setError).toEqualTypeOf<
        (setter: ParentErrorSetter) => void
      >()
    })

    it("allows passing concise value to setError", ({ scope }) => {
      const concise = parent.getError(scope, params._first)
      parent.setError(concise)
      expect(parent.getError(scope, params._first)).toStrictEqual(concise)
    })

    it("allows passing verbose value to setError", ({ scope }) => {
      const verbose = parent.getError(scope, params._second)
      parent.setError(verbose)
      expect(parent.getError(scope, params._second)).toStrictEqual(verbose)
    })
  })
})

describe.each([
  "onTouch" as const,
  "onChange" as const,
  "onSubmit" as const,
  "onInit" as const,
])("when any validateOn (%s)", (validateOn) => {
  it("selects the element's error only when it has an error", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean(), error: ["custom"] }),
      ImpulseFormUnit(0, {
        validate: (input): Result<string, number> => {
          if (input > 0) {
            return [null, input]
          }

          return ["Too small", null]
        },
        validateOn,
      }),
    )

    const concise = {
      enabled: ["custom"],
      element: null,
    }

    expect(form.getError(scope)).toStrictEqual(concise)
    expect(form.getError(scope, params._first)).toStrictEqual(concise)
    expect(form.getError(scope, params._second)).toStrictEqual({
      enabled: ["custom"],
      element: "Too small",
    })
  })
})

describe.each(["onTouch" as const, "onChange" as const, "onSubmit" as const])(
  "when runtime validateOn (%s)",
  (validateOn) => {
    it("selects null for validating error", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(true, { validateOn, schema: z.boolean() }),
        ImpulseFormUnit(0, { validateOn, schema: z.number().min(1) }),
      )

      expect(form.getError(scope)).toBeNull()
      expect(form.getError(scope, params._first)).toBeNull()
      expect(form.getError(scope, params._second)).toStrictEqual({
        enabled: null,
        element: null,
      })
    })
  },
)

describe("when defining ImpulseFormOptionalOptions.error", () => {
  const validateOn = "onInit" as const

  it("overrides errors", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { validateOn, schema: z.boolean(), error: ["e"] }),
      ImpulseFormUnit<number, string>(0, { error: "err" }),
      {
        error: null,
      },
    )

    expect(form.getError(scope)).toBeNull()
    expect(form.getError(scope, params._first)).toBeNull()
    expect(form.getError(scope, params._second)).toStrictEqual({
      enabled: null,
      element: null,
    })
  })
})

describe("stable error value", () => {
  const validateOn = "onInit" as const

  it("subsequently selects equal error", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, {
        validateOn,
        schema: z.boolean(),
        error: ["custom"],
      }),
      ImpulseFormUnit(0, {
        validateOn,
        validate: (input): Result<string, number> => [null, input],
      }),
    )

    expect(form.getError(scope)).toBeInstanceOf(Object)
    expect(form.getError(scope)).toBe(form.getError(scope))

    expect(form.getError(scope, params._first)).toBeInstanceOf(Object)
    expect(form.getError(scope, params._first)).toBe(
      form.getError(scope, params._first),
    )

    expect(form.getError(scope, params._second)).toBeInstanceOf(Object)
    expect(form.getError(scope, params._second)).toBe(
      form.getError(scope, params._second),
    )
  })
})
