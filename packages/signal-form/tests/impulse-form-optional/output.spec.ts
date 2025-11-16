import z from "zod"

import { params } from "~/tools/params"

import { ImpulseFormOptional, ImpulseFormUnit } from "../../src"

describe("types", () => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit(0, { schema: z.number().min(1) }),
  )

  type OutputSchema = undefined | number

  interface OutputVerboseSchema {
    readonly enabled: null | boolean
    readonly element: null | number
  }

  it("matches schema type for getOutput(scope, select?)", ({ scope }) => {
    expectTypeOf(form.getOutput(scope)).toEqualTypeOf<null | OutputSchema>()

    expectTypeOf(form.getOutput(scope, params._first)).toEqualTypeOf<null | OutputSchema>()

    expectTypeOf(form.getOutput(scope, params._second)).toEqualTypeOf<OutputVerboseSchema>()
  })

  describe("nested", () => {
    const parent = ImpulseFormOptional(ImpulseFormUnit(true, { schema: z.boolean() }), form)

    type ParentOutputSchema = undefined | number

    interface ParentOutputVerboseSchema {
      readonly enabled: null | boolean
      readonly element: {
        readonly enabled: null | boolean
        readonly element: null | number
      }
    }

    it("matches schema type for getOutput(scope, select?)", ({ scope }) => {
      expectTypeOf(parent.getOutput(scope)).toEqualTypeOf<null | ParentOutputSchema>()

      expectTypeOf(
        parent.getOutput(scope, params._first),
      ).toEqualTypeOf<null | ParentOutputSchema>()

      expectTypeOf(
        parent.getOutput(scope, params._second),
      ).toEqualTypeOf<ParentOutputVerboseSchema>()
    })
  })
})

describe("when element is initially invalid", () => {
  it("returns null when enabled is true", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      ImpulseFormUnit(0, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(scope)).toBeNull()
    expect(form.getOutput(scope, params._first)).toBeNull()
    expect(form.getOutput(scope, params._second)).toStrictEqual({
      enabled: true,
      element: null,
    })
  })

  it("returns undefined when enabled is false", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(false, { schema: z.boolean() }),
      ImpulseFormUnit(0, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(scope)).toBeUndefined()
    expect(form.getOutput(scope, params._first)).toBeUndefined()
    expect(form.getOutput(scope, params._second)).toStrictEqual({
      enabled: false,
      element: null,
    })
  })
})

describe("when element is initially valid", () => {
  it("returns undefined when enabled is false", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(false, { schema: z.boolean() }),
      ImpulseFormUnit(1, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(scope)).toBeUndefined()
    expect(form.getOutput(scope, params._first)).toBeUndefined()
    expect(form.getOutput(scope, params._second)).toStrictEqual({
      enabled: false,
      element: 1,
    })
  })

  it("returns output when enabled is true", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      ImpulseFormUnit(1, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(scope)).toBe(1)
    expect(form.getOutput(scope, params._first)).toBe(1)
    expect(form.getOutput(scope, params._second)).toStrictEqual({
      enabled: true,
      element: 1,
    })
  })
})

describe("getOutput after enabling/disabling", () => {
  it("returns output after enabling when element is valid", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(false, { schema: z.boolean() }),
      ImpulseFormUnit(5, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(scope)).toBeUndefined()
    expect(form.getOutput(scope, params._second)).toStrictEqual({
      enabled: false,
      element: 5,
    })

    form.enabled.setInput(true)

    const concise = 5

    expect(form.getOutput(scope)).toBe(concise)
    expect(form.getOutput(scope, params._first)).toBe(concise)
    expect(form.getOutput(scope, params._second)).toStrictEqual({
      enabled: true,
      element: 5,
    })
  })

  it("returns undefined after disabling when element is valid", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      ImpulseFormUnit(3, { schema: z.number().min(1) }),
    )

    const concise = 3

    expect(form.getOutput(scope)).toBe(concise)

    form.enabled.setInput(false)

    expect(form.getOutput(scope)).toBeUndefined()
    expect(form.getOutput(scope, params._first)).toBeUndefined()
    expect(form.getOutput(scope, params._second)).toStrictEqual({
      enabled: false,
      element: 3,
    })
  })

  it("returns null after enabling when element is invalid", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(false, { schema: z.boolean() }),
      ImpulseFormUnit(0, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(scope)).toBeUndefined()

    form.enabled.setInput(true)

    expect(form.getOutput(scope)).toBeNull()
    expect(form.getOutput(scope, params._second)).toStrictEqual({
      enabled: true,
      element: null,
    })
  })

  it("returns undefined after disabling when element is invalid", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      ImpulseFormUnit(0, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(scope)).toBeNull()

    form.enabled.setInput(false)

    expect(form.getOutput(scope)).toBeUndefined()
    expect(form.getOutput(scope, params._second)).toStrictEqual({
      enabled: false,
      element: null,
    })
  })

  it("returns output after making element valid while enabled is true", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      ImpulseFormUnit(0, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(scope)).toBeNull()

    form.element.setInput(2)

    const concise = 2

    expect(form.getOutput(scope)).toBe(concise)
    expect(form.getOutput(scope, params._first)).toBe(concise)
    expect(form.getOutput(scope, params._second)).toStrictEqual({
      enabled: true,
      element: 2,
    })
  })
})

it("gets disabled nested output", ({ scope }) => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormOptional(ImpulseFormUnit(false), ImpulseFormUnit(0)),
  )

  expect(form.getOutput(scope)).toBeUndefined()
  expect(form.getOutput(scope, params._first)).toBeUndefined()
  expect(form.getOutput(scope, params._second)).toStrictEqual({
    enabled: true,
    element: {
      enabled: false,
      element: 0,
    },
  })
})

describe("stable output value", () => {
  it("subsequently selects equal output", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      ImpulseFormUnit(1 as number, {
        transform: (size) => Array.from({ length: Math.max(1, size) }, (_, index) => index),
      }),
    )

    const output0 = form.getOutput(scope)

    form.element.setInput(0)
    const output1 = form.getOutput(scope)

    expect(output0).not.toBe(output1)
    expect(output0).toStrictEqual(output1)
  })
})
