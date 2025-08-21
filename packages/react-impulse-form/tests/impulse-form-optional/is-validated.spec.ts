import z from "zod"

import { params } from "~/tools/params"

import {
  ImpulseFormOptional,
  ImpulseFormShape,
  ImpulseFormUnit,
  type ValidateStrategy,
} from "../../src"

describe("types", () => {
  const enabled = ImpulseFormUnit(true)
  const element = ImpulseFormUnit(0)

  const form = ImpulseFormOptional(enabled, element)

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

  it("matches schema type for isValidated(scope, select?)", ({ scope }) => {
    expectTypeOf(form.isValidated(scope)).toEqualTypeOf<boolean>()

    expectTypeOf(
      form.isValidated(scope, params._first),
    ).toEqualTypeOf<IsValidatedSchema>()

    expectTypeOf(
      form.isValidated(scope, params._second),
    ).toEqualTypeOf<IsValidatedVerboseSchema>()
  })

  describe("nested", () => {
    const parent = ImpulseFormOptional(ImpulseFormUnit(true), form)

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

    it("matches schema type for isValidated(scope, select?)", ({ scope }) => {
      expectTypeOf(parent.isValidated(scope)).toEqualTypeOf<boolean>()

      expectTypeOf(
        parent.isValidated(scope, params._first),
      ).toEqualTypeOf<ParentIsValidatedSchema>()

      expectTypeOf(
        parent.isValidated(scope, params._second),
      ).toEqualTypeOf<ParentIsValidatedVerboseSchema>()
    })
  })
})

describe("when element is initially not validated", () => {
  function setup(enabled: string, validateOn?: ValidateStrategy) {
    return ImpulseFormOptional(
      ImpulseFormUnit(enabled, {
        validateOn,
        schema: z.string().nonempty().pipe(z.coerce.boolean()),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit(true, { schema: z.boolean() }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name", { schema: z.string() }),
          _2: ImpulseFormUnit(18, { schema: z.number() }),
        }),
      ),
    )
  }

  it("returns false for initially invalid but not validated enabled", ({
    scope,
  }) => {
    const form = setup("")

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, params._first)).toBe(false)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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
    const form = setup("", "onInit")

    expect(form.isValidated(scope)).toBe(true)
    expect(form.isValidated(scope, params._first)).toBe(true)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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
    const form = setup("true")

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, params._first)).toBe(false)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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

  it("returns false for initially valid validated enabled", ({ scope }) => {
    const form = setup("true", "onInit")

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, params._first)).toStrictEqual({
      enabled: true,
      element: false,
    })
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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

  it("returns true after validating element", ({ scope }) => {
    const form = setup("true", "onInit")

    expect(form.isValidated(scope)).toBe(false)

    form.element.setTouched(true)

    expect(form.isValidated(scope)).toBe(true)
    expect(form.isValidated(scope, params._first)).toBe(true)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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
    return ImpulseFormOptional(
      ImpulseFormUnit(enabled, {
        validateOn,
        schema: z.string().nonempty().pipe(z.coerce.boolean()),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit(true, { schema: z.boolean() }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name", { schema: z.string() }),
          _2: ImpulseFormUnit(18, { schema: z.number() }),
        }),
        {
          validateOn: "onInit",
        },
      ),
    )
  }

  it("returns false for initially invalid but not validated enabled", ({
    scope,
  }) => {
    const form = setup("")

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, params._first)).toBe(false)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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

  it("returns true for initially invalid validated enabled", ({ scope }) => {
    const form = setup("", "onInit")

    expect(form.isValidated(scope)).toBe(true)
    expect(form.isValidated(scope, params._first)).toBe(true)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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

  it("returns false for a initially valid but not validated enabled", ({
    scope,
  }) => {
    const form = setup("true")

    expect(form.isValidated(scope)).toBe(false)
    expect(form.isValidated(scope, params._first)).toStrictEqual({
      enabled: false,
      element: true,
    })
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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

  it("returns true for a initially valid validated enabled", ({ scope }) => {
    const form = setup("true", "onInit")

    expect(form.isValidated(scope)).toBe(true)
    expect(form.isValidated(scope, params._first)).toBe(true)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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

  it("returns true after validating enabled", ({ scope }) => {
    const form = setup("true")

    expect(form.isValidated(scope)).toBe(false)

    form.enabled.setTouched(true)

    expect(form.isValidated(scope)).toBe(true)
    expect(form.isValidated(scope, params._first)).toBe(true)
    expect(form.isValidated(scope, params._second)).toStrictEqual({
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
  it("subsequently selects equal validated", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, {
        validateOn: "onInit",
        schema: z.boolean(),
      }),
      ImpulseFormOptional(
        ImpulseFormUnit(true, { schema: z.boolean() }),
        ImpulseFormShape({
          _1: ImpulseFormUnit("name", { schema: z.string() }),
          _2: ImpulseFormUnit(18, { schema: z.number() }),
        }),
      ),
    )

    expect(form.isValidated(scope)).toBeTypeOf("boolean")
    expect(form.isValidated(scope)).toBe(form.isValidated(scope))

    expect(form.isValidated(scope, params._first)).toBeInstanceOf(Object)
    expect(form.isValidated(scope, params._first)).toBe(
      form.isValidated(scope, params._first),
    )

    expect(form.isValidated(scope, params._second)).toBeInstanceOf(Object)
    expect(form.isValidated(scope, params._second)).toBe(
      form.isValidated(scope, params._second),
    )
  })
})
