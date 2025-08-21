import z from "zod"

import { params } from "~/tools/params"

import {
  ImpulseFormOptional,
  ImpulseFormShape,
  ImpulseFormUnit,
} from "../../src"

describe("types", () => {
  const enabled = ImpulseFormUnit(true)
  const element = ImpulseFormUnit(0)

  const form = ImpulseFormOptional(enabled, element)

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

  it("matches schema type for isValid(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isValid(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(
      form.isValid(scope, params._first),
    ).toEqualTypeOf<IsValidSchema>()

    expectTypeOf(
      form.isValid(scope, params._second),
    ).toEqualTypeOf<IsValidVerboseSchema>()
  })

  describe("nested", () => {
    const parent = ImpulseFormOptional(ImpulseFormUnit(true), form)

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

    it("matches schema type for isValid(scope, select?)", ({ scope }) => {
      expectTypeOf(parent.isValid(scope)).toEqualTypeOf<boolean>()

      expectTypeOf(
        parent.isValid(scope, params._first),
      ).toEqualTypeOf<ParentIsValidSchema>()

      expectTypeOf(
        parent.isValid(scope, params._second),
      ).toEqualTypeOf<ParentIsValidVerboseSchema>()
    })
  })
})

describe("when element is initially invalid", () => {
  it("returns false for initially invalid enabled", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit("", {
        schema: z.boolean(),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit("", {
          schema: z.boolean(),
        }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )

    expect(form.isValid(scope)).toBe(false)
    expect(form.isValid(scope, params._first)).toBe(false)
    expect(form.isValid(scope, params._second)).toStrictEqual({
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

  it("returns falsy for initially enabled", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, {
        schema: z.boolean(),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit("", {
          schema: z.boolean(),
        }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )

    expect(form.isValid(scope)).toBe(false)
    expect(form.isValid(scope, params._first)).toStrictEqual({
      enabled: true,
      element: false,
    })
    expect(form.isValid(scope, params._second)).toStrictEqual({
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

  it("returns true for initially disabled", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(false, {
        schema: z.boolean(),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit("", {
          schema: z.boolean(),
        }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )

    expect(form.isValid(scope)).toBe(true)
    expect(form.isValid(scope, params._first)).toBe(true)
    expect(form.isValid(scope, params._second)).toStrictEqual({
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

  it("returns true after disabling", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true),
      ImpulseFormOptional(
        ImpulseFormUnit("", {
          schema: z.boolean(),
        }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )

    expect(form.isValid(scope)).toBe(false)

    form.enabled.setInput(false)

    expect(form.element.isValid(scope)).toBe(false)
    expect(form.isValid(scope)).toStrictEqual(true)
    expect(form.isValid(scope, params._first)).toBe(true)
    expect(form.isValid(scope, params._second)).toStrictEqual({
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

  it("returns false after enabling", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(false),
      ImpulseFormOptional(
        ImpulseFormUnit("", {
          schema: z.boolean(),
        }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )

    expect(form.isValid(scope)).toBe(true)

    form.enabled.setInput(true)

    expect(form.element.isValid(scope)).toBe(false)
    expect(form.isValid(scope)).toStrictEqual(false)
    expect(form.isValid(scope, params._first)).toStrictEqual({
      enabled: true,
      element: false,
    })
    expect(form.isValid(scope, params._second)).toStrictEqual({
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

  it("returns true after making element valid", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true),
      ImpulseFormOptional(
        ImpulseFormUnit("", {
          schema: z.string().nonempty().pipe(z.coerce.boolean()),
        }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )

    expect(form.isValid(scope)).toBe(false)

    form.element.enabled.setInput("true")

    expect(form.isValid(scope)).toBe(true)
    expect(form.isValid(scope, params._first)).toBe(true)
    expect(form.isValid(scope, params._second)).toStrictEqual({
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
  it("returns false for initially invalid enabled", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit("", {
        schema: z.boolean(),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit(true),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )

    expect(form.isValid(scope)).toBe(false)
    expect(form.isValid(scope, params._first)).toBe(false)
    expect(form.isValid(scope, params._second)).toStrictEqual({
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
    it("returns true", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(enabled),
        ImpulseFormOptional(
          ImpulseFormUnit(true),
          ImpulseFormShape({
            _1: ImpulseFormUnit("name"),
            _2: ImpulseFormUnit(18),
          }),
        ),
      )

      expect(form.enabled.isValid(scope)).toBe(true)

      expect(form.isValid(scope)).toBe(true)
      expect(form.isValid(scope, params._first)).toBe(true)
      expect(form.isValid(scope, params._second)).toStrictEqual({
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

    it("returns true after switching", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(enabled),
        ImpulseFormOptional(
          ImpulseFormUnit(true),
          ImpulseFormShape({
            _1: ImpulseFormUnit("name"),
            _2: ImpulseFormUnit(18),
          }),
        ),
      )

      form.enabled.setInput(!enabled)

      expect(form.isValid(scope)).toBe(true)
      expect(form.isValid(scope, params._first)).toBe(true)
      expect(form.isValid(scope, params._second)).toStrictEqual({
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

  it("returns false after making element invalid", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true),
      ImpulseFormOptional(
        ImpulseFormUnit("true", {
          schema: z.string().nonempty().pipe(z.coerce.boolean()),
        }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )

    expect(form.isValid(scope)).toBe(true)

    form.element.enabled.setInput("")

    expect(form.isValid(scope)).toBe(false)
    expect(form.isValid(scope, params._first)).toStrictEqual({
      enabled: true,
      element: false,
    })
    expect(form.isValid(scope, params._second)).toStrictEqual({
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

  it("returns false after making active invalid", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit("true", {
        validateOn: "onInit",
        schema: z.string().nonempty().pipe(z.coerce.boolean()),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit(true),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )

    expect(form.isValid(scope)).toBe(true)

    form.enabled.setInput("")

    expect(form.isValid(scope)).toBe(false)
    expect(form.isValid(scope, params._first)).toBe(false)
    expect(form.isValid(scope, params._second)).toStrictEqual({
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
  it("subsequently selects equal valid", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true),
      ImpulseFormOptional(
        ImpulseFormUnit(true),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18, {
            validateOn: "onInit",
            schema: z.number().min(100),
          }),
        }),
      ),
    )

    expect(form.isValid(scope)).toBeTypeOf("boolean")
    expect(form.isValid(scope)).toBe(form.isValid(scope))

    expect(form.isValid(scope, params._first)).toBeInstanceOf(Object)
    expect(form.isValid(scope, params._first)).toBe(
      form.isValid(scope, params._first),
    )

    expect(form.isValid(scope, params._second)).toBeInstanceOf(Object)
    expect(form.isValid(scope, params._second)).toBe(
      form.isValid(scope, params._second),
    )
  })
})
