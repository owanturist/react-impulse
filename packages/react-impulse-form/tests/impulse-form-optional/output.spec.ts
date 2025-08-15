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

    expectTypeOf(
      form.getOutput(scope, params._first),
    ).toEqualTypeOf<null | OutputSchema>()

    expectTypeOf(
      form.getOutput(scope, params._second),
    ).toEqualTypeOf<OutputVerboseSchema>()
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

describe("stable output value", () => {
  it("subsequently selects equal output", ({ scope }) => {
    const form = ImpulseFormOptional(
      ImpulseFormUnit(true, { schema: z.boolean() }),
      ImpulseFormUnit(1 as number, {
        transform: (size) => {
          return Array.from({ length: Math.max(1, size) }, (_, index) => index)
        },
      }),
    )

    const output_0 = form.getOutput(scope)

    form.element.setInput(0)
    const output_1 = form.getOutput(scope)

    expect(output_0).not.toBe(output_1)
    expect(output_0).toStrictEqual(output_1)
  })
})
