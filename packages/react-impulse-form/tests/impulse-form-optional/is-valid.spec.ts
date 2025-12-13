import z from "zod"

import { params } from "~/tools/params"

import { FormOptional, FormShape, FormUnit } from "../../src"

describe("types", () => {
  const enabled = FormUnit(true)
  const element = FormUnit(0)

  const form = FormOptional(enabled, element)

  type IsValidSchema =
    | boolean
    | {
        readonly enabled: boolean
        readonly element: boolean
      }

  interface IsValidVerboseSchema {
    readonly enabled: boolean
    readonly element: boolean
  }

  it("matches schema type for isValid(monitor, select?)", ({ monitor }) => {
    expectTypeOf(form.isValid(monitor)).toEqualTypeOf<boolean>()

    expectTypeOf(form.isValid(monitor, params._first)).toEqualTypeOf<IsValidSchema>()

    expectTypeOf(form.isValid(monitor, params._second)).toEqualTypeOf<IsValidVerboseSchema>()
  })

  describe("nested", () => {
    const parent = FormOptional(FormUnit(true), form)

    type ParentIsValidSchema =
      | boolean
      | {
          readonly enabled: boolean
          readonly element: IsValidSchema
        }

    interface ParentIsValidVerboseSchema {
      readonly enabled: boolean
      readonly element: IsValidVerboseSchema
    }

    it("matches schema type for isValid(monitor, select?)", ({ monitor }) => {
      expectTypeOf(parent.isValid(monitor)).toEqualTypeOf<boolean>()

      expectTypeOf(parent.isValid(monitor, params._first)).toEqualTypeOf<ParentIsValidSchema>()

      expectTypeOf(
        parent.isValid(monitor, params._second),
      ).toEqualTypeOf<ParentIsValidVerboseSchema>()
    })
  })
})

describe("when element is initially invalid", () => {
  it("returns false for initially invalid enabled", ({ monitor }) => {
    const form = FormOptional(
      FormUnit("", {
        schema: z.boolean(),
      }),
      FormOptional(
        FormUnit("", {
          schema: z.boolean(),
        }),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )

    expect(form.isValid(monitor)).toBe(false)
    expect(form.isValid(monitor, params._first)).toBe(false)
    expect(form.isValid(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: {
        enabled: false,
        element: {
          _1: true,
          _2: true,
        },
      },
    })
  })

  it("returns falsy for initially enabled", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, {
        schema: z.boolean(),
      }),
      FormOptional(
        FormUnit("", {
          schema: z.boolean(),
        }),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )

    expect(form.isValid(monitor)).toBe(false)
    expect(form.isValid(monitor, params._first)).toStrictEqual({
      enabled: true,
      element: false,
    })
    expect(form.isValid(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: {
        enabled: false,
        element: {
          _1: true,
          _2: true,
        },
      },
    })
  })

  it("returns true for initially disabled", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(false, {
        schema: z.boolean(),
      }),
      FormOptional(
        FormUnit("", {
          schema: z.boolean(),
        }),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )

    expect(form.isValid(monitor)).toBe(true)
    expect(form.isValid(monitor, params._first)).toBe(true)
    expect(form.isValid(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: {
        enabled: false,
        element: {
          _1: true,
          _2: true,
        },
      },
    })
  })

  it("returns true after disabling", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true),
      FormOptional(
        FormUnit("", {
          schema: z.boolean(),
        }),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )

    expect(form.isValid(monitor)).toBe(false)

    form.enabled.setInput(false)

    expect(form.element.isValid(monitor)).toBe(false)
    expect(form.isValid(monitor)).toStrictEqual(true)
    expect(form.isValid(monitor, params._first)).toBe(true)
    expect(form.isValid(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: {
        enabled: false,
        element: {
          _1: true,
          _2: true,
        },
      },
    })
  })

  it("returns false after enabling", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(false),
      FormOptional(
        FormUnit("", {
          schema: z.boolean(),
        }),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )

    expect(form.isValid(monitor)).toBe(true)

    form.enabled.setInput(true)

    expect(form.element.isValid(monitor)).toBe(false)
    expect(form.isValid(monitor)).toStrictEqual(false)
    expect(form.isValid(monitor, params._first)).toStrictEqual({
      enabled: true,
      element: false,
    })
    expect(form.isValid(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: {
        enabled: false,
        element: {
          _1: true,
          _2: true,
        },
      },
    })
  })

  it("returns true after making element valid", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true),
      FormOptional(
        FormUnit("", {
          schema: z.string().nonempty().pipe(z.coerce.boolean()),
        }),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )

    expect(form.isValid(monitor)).toBe(false)

    form.element.enabled.setInput("true")

    expect(form.isValid(monitor)).toBe(true)
    expect(form.isValid(monitor, params._first)).toBe(true)
    expect(form.isValid(monitor, params._second)).toStrictEqual({
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

describe("when element is initially valid", () => {
  it("returns false for initially invalid enabled", ({ monitor }) => {
    const form = FormOptional(
      FormUnit("", {
        schema: z.boolean(),
      }),
      FormOptional(
        FormUnit(true),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )

    expect(form.isValid(monitor)).toBe(false)
    expect(form.isValid(monitor, params._first)).toBe(false)
    expect(form.isValid(monitor, params._second)).toStrictEqual({
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

  describe.each([
    ["enabled", true],
    ["disabled", false],
  ])("when initially %s", (_, enabled) => {
    it("returns true", ({ monitor }) => {
      const form = FormOptional(
        FormUnit(enabled),
        FormOptional(
          FormUnit(true),
          FormShape({
            _1: FormUnit("name"),
            _2: FormUnit(18),
          }),
        ),
      )

      expect(form.enabled.isValid(monitor)).toBe(true)

      expect(form.isValid(monitor)).toBe(true)
      expect(form.isValid(monitor, params._first)).toBe(true)
      expect(form.isValid(monitor, params._second)).toStrictEqual({
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

    it("returns true after switching", ({ monitor }) => {
      const form = FormOptional(
        FormUnit(enabled),
        FormOptional(
          FormUnit(true),
          FormShape({
            _1: FormUnit("name"),
            _2: FormUnit(18),
          }),
        ),
      )

      form.enabled.setInput(!enabled)

      expect(form.isValid(monitor)).toBe(true)
      expect(form.isValid(monitor, params._first)).toBe(true)
      expect(form.isValid(monitor, params._second)).toStrictEqual({
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

  it("returns false after making element invalid", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true),
      FormOptional(
        FormUnit("true", {
          schema: z.string().nonempty().pipe(z.coerce.boolean()),
        }),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )

    expect(form.isValid(monitor)).toBe(true)

    form.element.enabled.setInput("")

    expect(form.isValid(monitor)).toBe(false)
    expect(form.isValid(monitor, params._first)).toStrictEqual({
      enabled: true,
      element: false,
    })
    expect(form.isValid(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: {
        enabled: false,
        element: {
          _1: true,
          _2: true,
        },
      },
    })
  })

  it("returns false after making active invalid", ({ monitor }) => {
    const form = FormOptional(
      FormUnit("true", {
        validateOn: "onInit",
        schema: z.string().nonempty().pipe(z.coerce.boolean()),
      }),
      FormOptional(
        FormUnit(true),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )

    expect(form.isValid(monitor)).toBe(true)

    form.enabled.setInput("")

    expect(form.isValid(monitor)).toBe(false)
    expect(form.isValid(monitor, params._first)).toBe(false)
    expect(form.isValid(monitor, params._second)).toStrictEqual({
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
})

describe("stable valid value", () => {
  it("subsequently selects equal valid", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true),
      FormOptional(
        FormUnit(true),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18, {
            validateOn: "onInit",
            schema: z.number().min(100),
          }),
        }),
      ),
    )

    expect(form.isValid(monitor)).toBeTypeOf("boolean")
    expect(form.isValid(monitor)).toBe(form.isValid(monitor))

    expect(form.isValid(monitor, params._first)).toBeInstanceOf(Object)
    expect(form.isValid(monitor, params._first)).toBe(form.isValid(monitor, params._first))

    expect(form.isValid(monitor, params._second)).toBeInstanceOf(Object)
    expect(form.isValid(monitor, params._second)).toBe(form.isValid(monitor, params._second))
  })
})
