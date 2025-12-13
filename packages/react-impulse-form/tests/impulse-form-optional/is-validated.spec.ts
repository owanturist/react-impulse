import z from "zod"

import { params } from "~/tools/params"

import { FormOptional, FormShape, FormUnit, type ValidateStrategy } from "../../src"

describe("types", () => {
  const enabled = FormUnit(true)
  const element = FormUnit(0)

  const form = FormOptional(enabled, element)

  type IsValidatedSchema =
    | boolean
    | {
        readonly enabled: boolean
        readonly element: boolean
      }

  interface IsValidatedVerboseSchema {
    readonly enabled: boolean
    readonly element: boolean
  }

  it("matches schema type for isValidated(monitor, select?)", ({ monitor }) => {
    expectTypeOf(form.isValidated(monitor)).toEqualTypeOf<boolean>()

    expectTypeOf(form.isValidated(monitor, params._first)).toEqualTypeOf<IsValidatedSchema>()

    expectTypeOf(
      form.isValidated(monitor, params._second),
    ).toEqualTypeOf<IsValidatedVerboseSchema>()
  })

  describe("nested", () => {
    const parent = FormOptional(FormUnit(true), form)

    type ParentIsValidatedSchema =
      | boolean
      | {
          readonly enabled: boolean
          readonly element: IsValidatedSchema
        }

    interface ParentIsValidatedVerboseSchema {
      readonly enabled: boolean
      readonly element: IsValidatedVerboseSchema
    }

    it("matches schema type for isValidated(monitor, select?)", ({ monitor }) => {
      expectTypeOf(parent.isValidated(monitor)).toEqualTypeOf<boolean>()

      expectTypeOf(
        parent.isValidated(monitor, params._first),
      ).toEqualTypeOf<ParentIsValidatedSchema>()

      expectTypeOf(
        parent.isValidated(monitor, params._second),
      ).toEqualTypeOf<ParentIsValidatedVerboseSchema>()
    })
  })
})

describe("when element is initially not validated", () => {
  function setup(enabled: string, validateOn?: ValidateStrategy) {
    return FormOptional(
      FormUnit(enabled, {
        validateOn,
        schema: z.string().nonempty().pipe(z.coerce.boolean()),
      }),
      FormOptional(
        FormUnit(true, { schema: z.boolean() }),
        FormShape({
          _1: FormUnit("name", { schema: z.string() }),
          _2: FormUnit(18, { schema: z.number() }),
        }),
      ),
    )
  }

  it("returns false for initially invalid but not validated enabled", ({ monitor }) => {
    const form = setup("")

    expect(form.isValidated(monitor)).toBe(false)
    expect(form.isValidated(monitor, params._first)).toBe(false)
    expect(form.isValidated(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: {
        enabled: false,
        element: {
          _1: false,
          _2: false,
        },
      },
    })
  })

  it("returns true for initially invalid validated enabled", ({ monitor }) => {
    const form = setup("", "onInit")

    expect(form.isValidated(monitor)).toBe(true)
    expect(form.isValidated(monitor, params._first)).toBe(true)
    expect(form.isValidated(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: {
        enabled: false,
        element: {
          _1: false,
          _2: false,
        },
      },
    })
  })

  it("returns false for initially valid but not validated enabled", ({ monitor }) => {
    const form = setup("true")

    expect(form.isValidated(monitor)).toBe(false)
    expect(form.isValidated(monitor, params._first)).toBe(false)
    expect(form.isValidated(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: {
        enabled: false,
        element: {
          _1: false,
          _2: false,
        },
      },
    })
  })

  it("returns false for initially valid validated enabled", ({ monitor }) => {
    const form = setup("true", "onInit")

    expect(form.isValidated(monitor)).toBe(false)
    expect(form.isValidated(monitor, params._first)).toStrictEqual({
      enabled: true,
      element: false,
    })
    expect(form.isValidated(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: {
        enabled: false,
        element: {
          _1: false,
          _2: false,
        },
      },
    })
  })

  it("returns true after validating element", ({ monitor }) => {
    const form = setup("true", "onInit")

    expect(form.isValidated(monitor)).toBe(false)

    form.element.setTouched(true)

    expect(form.isValidated(monitor)).toBe(true)
    expect(form.isValidated(monitor, params._first)).toBe(true)
    expect(form.isValidated(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: {
        enabled: true,
        element: {
          _1: true,
          _2: true,
        },
      },
    })
  })
})

describe("when element is initially validated", () => {
  function setup(enabled: string, validateOn?: ValidateStrategy) {
    return FormOptional(
      FormUnit(enabled, {
        validateOn,
        schema: z.string().nonempty().pipe(z.coerce.boolean()),
      }),
      FormOptional(
        FormUnit(true, { schema: z.boolean() }),
        FormShape({
          _1: FormUnit("name", { schema: z.string() }),
          _2: FormUnit(18, { schema: z.number() }),
        }),
        {
          validateOn: "onInit",
        },
      ),
    )
  }

  it("returns false for initially invalid but not validated enabled", ({ monitor }) => {
    const form = setup("")

    expect(form.isValidated(monitor)).toBe(false)
    expect(form.isValidated(monitor, params._first)).toBe(false)
    expect(form.isValidated(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: {
        enabled: true,
        element: {
          _1: true,
          _2: true,
        },
      },
    })
  })

  it("returns true for initially invalid validated enabled", ({ monitor }) => {
    const form = setup("", "onInit")

    expect(form.isValidated(monitor)).toBe(true)
    expect(form.isValidated(monitor, params._first)).toBe(true)
    expect(form.isValidated(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: {
        enabled: true,
        element: {
          _1: true,
          _2: true,
        },
      },
    })
  })

  it("returns false for a initially valid but not validated enabled", ({ monitor }) => {
    const form = setup("true")

    expect(form.isValidated(monitor)).toBe(false)
    expect(form.isValidated(monitor, params._first)).toStrictEqual({
      enabled: false,
      element: true,
    })
    expect(form.isValidated(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: {
        enabled: true,
        element: {
          _1: true,
          _2: true,
        },
      },
    })
  })

  it("returns true for a initially valid validated enabled", ({ monitor }) => {
    const form = setup("true", "onInit")

    expect(form.isValidated(monitor)).toBe(true)
    expect(form.isValidated(monitor, params._first)).toBe(true)
    expect(form.isValidated(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: {
        enabled: true,
        element: {
          _1: true,
          _2: true,
        },
      },
    })
  })

  it("returns true after validating enabled", ({ monitor }) => {
    const form = setup("true")

    expect(form.isValidated(monitor)).toBe(false)

    form.enabled.setTouched(true)

    expect(form.isValidated(monitor)).toBe(true)
    expect(form.isValidated(monitor, params._first)).toBe(true)
    expect(form.isValidated(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: {
        enabled: true,
        element: {
          _1: true,
          _2: true,
        },
      },
    })
  })
})

describe("stable validated value", () => {
  it("subsequently selects equal validated", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, {
        validateOn: "onInit",
        schema: z.boolean(),
      }),
      FormOptional(
        FormUnit(true, { schema: z.boolean() }),
        FormShape({
          _1: FormUnit("name", { schema: z.string() }),
          _2: FormUnit(18, { schema: z.number() }),
        }),
      ),
    )

    expect(form.isValidated(monitor)).toBeTypeOf("boolean")
    expect(form.isValidated(monitor)).toBe(form.isValidated(monitor))

    expect(form.isValidated(monitor, params._first)).toBeInstanceOf(Object)
    expect(form.isValidated(monitor, params._first)).toBe(form.isValidated(monitor, params._first))

    expect(form.isValidated(monitor, params._second)).toBeInstanceOf(Object)
    expect(form.isValidated(monitor, params._second)).toBe(
      form.isValidated(monitor, params._second),
    )
  })
})
