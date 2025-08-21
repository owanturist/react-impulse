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

  it("matches schema type for isInvalid(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isInvalid(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(
      form.isInvalid(scope, params._first),
    ).toEqualTypeOf<IsInvalidSchema>()

    expectTypeOf(
      form.isInvalid(scope, params._second),
    ).toEqualTypeOf<IsInvalidVerboseSchema>()
  })

  describe("nested", () => {
    const parent = ImpulseFormOptional(ImpulseFormUnit(true), form)

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

    it("matches schema type for isInvalid(scope, select?)", ({ scope }) => {
      expectTypeOf(parent.isInvalid(scope)).toEqualTypeOf<boolean>()

      expectTypeOf(
        parent.isInvalid(scope, params._first),
      ).toEqualTypeOf<ParentIsInvalidSchema>()

      expectTypeOf(
        parent.isInvalid(scope, params._second),
      ).toEqualTypeOf<ParentIsInvalidVerboseSchema>()
    })
  })
})

describe("when element is initially invalid", () => {
  it("returns false for initially invalid but not validated enabled", ({
    scope,
  }) => {
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

    expect(form.isInvalid(scope)).toBe(false)
    expect(form.isInvalid(scope, params._first)).toBe(false)
    expect(form.isInvalid(scope, params._second)).toStrictEqual({
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

  it("returns true for initially invalid validated enabled", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit("", {
        validateOn: "onInit",
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

    expect(form.isInvalid(scope)).toBe(true)
    expect(form.isInvalid(scope, params._first)).toBe(true)
    expect(form.isInvalid(scope, params._second)).toStrictEqual({
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

  it("returns false for initially valid but not validated enabled", ({
    scope,
  }) => {
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

    expect(form.isInvalid(scope)).toBe(false)
    expect(form.isInvalid(scope, params._first)).toBe(false)
    expect(form.isInvalid(scope, params._second)).toStrictEqual({
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

  it("returns true for initially valid validated enabled", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, {
        validateOn: "onInit",
        schema: z.boolean(),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit("", {
          validateOn: "onInit",
          schema: z.boolean(),
        }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )

    expect(form.isInvalid(scope)).toBe(true)
    expect(form.isInvalid(scope, params._first)).toStrictEqual({
      enabled: false,
      element: true,
    })
    expect(form.isInvalid(scope, params._second)).toStrictEqual({
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

  it("returns false after disabling initially valid validated enabled", ({
    scope,
  }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, {
        validateOn: "onInit",
        schema: z.boolean(),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit("", {
          validateOn: "onInit",
          schema: z.boolean(),
        }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )

    form.enabled.setInput(false)

    expect(form.isInvalid(scope)).toBe(false)
    expect(form.isInvalid(scope, params._first)).toBe(false)
    expect(form.isInvalid(scope, params._second)).toStrictEqual({
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

  it("returns true after enabling initially valid validated enabled", ({
    scope,
  }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(false, {
        validateOn: "onInit",
        schema: z.boolean(),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit("", {
          validateOn: "onInit",
          schema: z.boolean(),
        }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )

    form.enabled.setInput(true)

    expect(form.isInvalid(scope)).toBe(true)
    expect(form.isInvalid(scope, params._first)).toStrictEqual({
      enabled: false,
      element: true,
    })
    expect(form.isInvalid(scope, params._second)).toStrictEqual({
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

  it("returns true after making element valid", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, {
        validateOn: "onInit",
        schema: z.boolean(),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit("", {
          validateOn: "onInit",
          schema: z.string().nonempty().pipe(z.coerce.boolean()),
        }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )
    expect(form.isInvalid(scope)).toBe(true)

    form.element.enabled.setInput("true")

    expect(form.isInvalid(scope)).toBe(false)
    expect(form.isInvalid(scope, params._first)).toBe(false)
    expect(form.isInvalid(scope, params._second)).toStrictEqual({
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
  it("returns false for initially invalid but not validated enabled", ({
    scope,
  }) => {
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

    expect(form.isInvalid(scope)).toBe(false)
    expect(form.isInvalid(scope, params._first)).toBe(false)
    expect(form.isInvalid(scope, params._second)).toStrictEqual({
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

  it("returns true for initially invalid validated enabled", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit("", {
        validateOn: "onInit",
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

    expect(form.isInvalid(scope)).toBe(true)
    expect(form.isInvalid(scope, params._first)).toBe(true)
    expect(form.isInvalid(scope, params._second)).toStrictEqual({
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
    it("returns false", ({ scope }) => {
      const form = ImpulseFormOptional(
        ImpulseFormUnit(true, {
          validateOn,
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

      expect(form.enabled.isInvalid(scope)).toBe(false)

      expect(form.isInvalid(scope)).toBe(false)
      expect(form.isInvalid(scope, params._first)).toBe(false)
      expect(form.isInvalid(scope, params._second)).toStrictEqual({
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

  it("returns true after making element invalid", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true),
      ImpulseFormOptional(
        ImpulseFormUnit("true", {
          validateOn: "onInit",
          schema: z.string().nonempty().pipe(z.coerce.boolean()),
        }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name"),
          _2: ImpulseFormUnit(18),
        }),
      ),
    )

    expect(form.isInvalid(scope)).toBe(false)

    form.element.enabled.setInput("")

    expect(form.isInvalid(scope)).toBe(true)
    expect(form.isInvalid(scope, params._first)).toStrictEqual({
      enabled: false,
      element: true,
    })
    expect(form.isInvalid(scope, params._second)).toStrictEqual({
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

  it("returns true after making active invalid", ({ scope }) => {
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

    expect(form.isInvalid(scope)).toBe(false)

    form.enabled.setInput("")

    expect(form.isInvalid(scope)).toBe(true)
    expect(form.isInvalid(scope, params._first)).toBe(true)
    expect(form.isInvalid(scope, params._second)).toStrictEqual({
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
  it("subsequently selects equal invalid", ({ scope }) => {
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

    expect(form.isInvalid(scope)).toBeTypeOf("boolean")
    expect(form.isInvalid(scope)).toBe(form.isInvalid(scope))

    expect(form.isInvalid(scope, params._first)).toBeInstanceOf(Object)
    expect(form.isInvalid(scope, params._first)).toBe(
      form.isInvalid(scope, params._first),
    )

    expect(form.isInvalid(scope, params._second)).toBeInstanceOf(Object)
    expect(form.isInvalid(scope, params._second)).toBe(
      form.isInvalid(scope, params._second),
    )
  })
})
