import z from "zod"

import { params } from "~/tools/params"

import { FormOptional, FormShape, FormUnit } from "../../src"

describe("types", () => {
  const enabled = FormUnit(true)
  const element = FormUnit(0)

  const form = FormOptional(enabled, element)

  type IsInvalidSchema =
    | boolean
    | {
        readonly enabled: boolean
        readonly element: boolean
      }

  interface IsInvalidVerboseSchema {
    readonly enabled: boolean
    readonly element: boolean
  }

  it("matches schema type for isInvalid(monitor, select?)", ({ monitor }) => {
    expectTypeOf(form.isInvalid(monitor)).toEqualTypeOf<boolean>()

    expectTypeOf(form.isInvalid(monitor, params._first)).toEqualTypeOf<IsInvalidSchema>()

    expectTypeOf(form.isInvalid(monitor, params._second)).toEqualTypeOf<IsInvalidVerboseSchema>()
  })

  describe("nested", () => {
    const parent = FormOptional(FormUnit(true), form)

    type ParentIsInvalidSchema =
      | boolean
      | {
          readonly enabled: boolean
          readonly element: IsInvalidSchema
        }

    interface ParentIsInvalidVerboseSchema {
      readonly enabled: boolean
      readonly element: IsInvalidVerboseSchema
    }

    it("matches schema type for isInvalid(monitor, select?)", ({ monitor }) => {
      expectTypeOf(parent.isInvalid(monitor)).toEqualTypeOf<boolean>()

      expectTypeOf(parent.isInvalid(monitor, params._first)).toEqualTypeOf<ParentIsInvalidSchema>()

      expectTypeOf(
        parent.isInvalid(monitor, params._second),
      ).toEqualTypeOf<ParentIsInvalidVerboseSchema>()
    })
  })
})

describe("when element is initially invalid", () => {
  it("returns false for initially invalid but not validated enabled", ({ monitor }) => {
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

    expect(form.isInvalid(monitor)).toBe(false)
    expect(form.isInvalid(monitor, params._first)).toBe(false)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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
    const form = FormOptional(
      FormUnit("", {
        validateOn: "onInit",
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

    expect(form.isInvalid(monitor)).toBe(true)
    expect(form.isInvalid(monitor, params._first)).toBe(true)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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

    expect(form.isInvalid(monitor)).toBe(false)
    expect(form.isInvalid(monitor, params._first)).toBe(false)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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

  it("returns true for initially valid validated enabled", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, {
        validateOn: "onInit",
        schema: z.boolean(),
      }),
      FormOptional(
        FormUnit("", {
          validateOn: "onInit",
          schema: z.boolean(),
        }),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )

    expect(form.isInvalid(monitor)).toBe(true)
    expect(form.isInvalid(monitor, params._first)).toStrictEqual({
      enabled: false,
      element: true,
    })
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: {
        enabled: true,
        element: {
          _1: false,
          _2: false,
        },
      },
    })
  })

  it("returns false after disabling initially valid validated enabled", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, {
        validateOn: "onInit",
        schema: z.boolean(),
      }),
      FormOptional(
        FormUnit("", {
          validateOn: "onInit",
          schema: z.boolean(),
        }),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )

    form.enabled.setInput(false)

    expect(form.isInvalid(monitor)).toBe(false)
    expect(form.isInvalid(monitor, params._first)).toBe(false)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: {
        enabled: true,
        element: {
          _1: false,
          _2: false,
        },
      },
    })
  })

  it("returns true after enabling initially valid validated enabled", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(false, {
        validateOn: "onInit",
        schema: z.boolean(),
      }),
      FormOptional(
        FormUnit("", {
          validateOn: "onInit",
          schema: z.boolean(),
        }),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )

    form.enabled.setInput(true)

    expect(form.isInvalid(monitor)).toBe(true)
    expect(form.isInvalid(monitor, params._first)).toStrictEqual({
      enabled: false,
      element: true,
    })
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: {
        enabled: true,
        element: {
          _1: false,
          _2: false,
        },
      },
    })
  })

  it("returns true after making element valid", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, {
        validateOn: "onInit",
        schema: z.boolean(),
      }),
      FormOptional(
        FormUnit("", {
          validateOn: "onInit",
          schema: z.string().nonempty().pipe(z.coerce.boolean()),
        }),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )
    expect(form.isInvalid(monitor)).toBe(true)

    form.element.enabled.setInput("true")

    expect(form.isInvalid(monitor)).toBe(false)
    expect(form.isInvalid(monitor, params._first)).toBe(false)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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
})

describe("when element is initially valid", () => {
  it("returns false for initially invalid but not validated enabled", ({ monitor }) => {
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

    expect(form.isInvalid(monitor)).toBe(false)
    expect(form.isInvalid(monitor, params._first)).toBe(false)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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
    const form = FormOptional(
      FormUnit("", {
        validateOn: "onInit",
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

    expect(form.isInvalid(monitor)).toBe(true)
    expect(form.isInvalid(monitor, params._first)).toBe(true)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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

  describe.each([
    ["and validated", "onInit" as const],
    ["but not validated", "onSubmit" as const],
  ])("when enabled is initially valid %s", (_, validateOn) => {
    it("returns false", ({ monitor }) => {
      const form = FormOptional(
        FormUnit(true, {
          validateOn,
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

      expect(form.enabled.isInvalid(monitor)).toBe(false)

      expect(form.isInvalid(monitor)).toBe(false)
      expect(form.isInvalid(monitor, params._first)).toBe(false)
      expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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
  })

  it("returns true after making element invalid", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true),
      FormOptional(
        FormUnit("true", {
          validateOn: "onInit",
          schema: z.string().nonempty().pipe(z.coerce.boolean()),
        }),
        FormShape({
          _1: FormUnit("name"),
          _2: FormUnit(18),
        }),
      ),
    )

    expect(form.isInvalid(monitor)).toBe(false)

    form.element.enabled.setInput("")

    expect(form.isInvalid(monitor)).toBe(true)
    expect(form.isInvalid(monitor, params._first)).toStrictEqual({
      enabled: false,
      element: true,
    })
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: {
        enabled: true,
        element: {
          _1: false,
          _2: false,
        },
      },
    })
  })

  it("returns true after making active invalid", ({ monitor }) => {
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

    expect(form.isInvalid(monitor)).toBe(false)

    form.enabled.setInput("")

    expect(form.isInvalid(monitor)).toBe(true)
    expect(form.isInvalid(monitor, params._first)).toBe(true)
    expect(form.isInvalid(monitor, params._second)).toStrictEqual({
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
})

describe("stable invalid value", () => {
  it("subsequently selects equal invalid", ({ monitor }) => {
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

    expect(form.isInvalid(monitor)).toBeTypeOf("boolean")
    expect(form.isInvalid(monitor)).toBe(form.isInvalid(monitor))

    expect(form.isInvalid(monitor, params._first)).toBeInstanceOf(Object)
    expect(form.isInvalid(monitor, params._first)).toBe(form.isInvalid(monitor, params._first))

    expect(form.isInvalid(monitor, params._second)).toBeInstanceOf(Object)
    expect(form.isInvalid(monitor, params._second)).toBe(form.isInvalid(monitor, params._second))
  })
})
