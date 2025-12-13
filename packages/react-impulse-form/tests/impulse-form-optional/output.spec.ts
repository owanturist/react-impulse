import z from "zod"

import { params } from "~/tools/params"

import { FormOptional, FormUnit } from "../../src"

describe("types", () => {
  const form = FormOptional(
    FormUnit(true, { schema: z.boolean() }),
    FormUnit(0, { schema: z.number().min(1) }),
  )

  type OutputSchema = undefined | number

  interface OutputVerboseSchema {
    readonly enabled: null | boolean
    readonly element: null | number
  }

  it("matches schema type for getOutput(monitor, select?)", ({ monitor }) => {
    expectTypeOf(form.getOutput(monitor)).toEqualTypeOf<null | OutputSchema>()

    expectTypeOf(form.getOutput(monitor, params._first)).toEqualTypeOf<null | OutputSchema>()

    expectTypeOf(form.getOutput(monitor, params._second)).toEqualTypeOf<OutputVerboseSchema>()
  })

  describe("nested", () => {
    const parent = FormOptional(FormUnit(true, { schema: z.boolean() }), form)

    type ParentOutputSchema = undefined | number

    interface ParentOutputVerboseSchema {
      readonly enabled: null | boolean
      readonly element: {
        readonly enabled: null | boolean
        readonly element: null | number
      }
    }

    it("matches schema type for getOutput(monitor, select?)", ({ monitor }) => {
      expectTypeOf(parent.getOutput(monitor)).toEqualTypeOf<null | ParentOutputSchema>()

      expectTypeOf(
        parent.getOutput(monitor, params._first),
      ).toEqualTypeOf<null | ParentOutputSchema>()

      expectTypeOf(
        parent.getOutput(monitor, params._second),
      ).toEqualTypeOf<ParentOutputVerboseSchema>()
    })
  })
})

describe("when element is initially invalid", () => {
  it("returns null when enabled is true", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, { schema: z.boolean() }),
      FormUnit(0, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(monitor)).toBeNull()
    expect(form.getOutput(monitor, params._first)).toBeNull()
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: null,
    })
  })

  it("returns undefined when enabled is false", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(false, { schema: z.boolean() }),
      FormUnit(0, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(monitor)).toBeUndefined()
    expect(form.getOutput(monitor, params._first)).toBeUndefined()
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: null,
    })
  })
})

describe("when element is initially valid", () => {
  it("returns undefined when enabled is false", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(false, { schema: z.boolean() }),
      FormUnit(1, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(monitor)).toBeUndefined()
    expect(form.getOutput(monitor, params._first)).toBeUndefined()
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: 1,
    })
  })

  it("returns output when enabled is true", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, { schema: z.boolean() }),
      FormUnit(1, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(monitor)).toBe(1)
    expect(form.getOutput(monitor, params._first)).toBe(1)
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: 1,
    })
  })
})

describe("getOutput after enabling/disabling", () => {
  it("returns output after enabling when element is valid", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(false, { schema: z.boolean() }),
      FormUnit(5, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(monitor)).toBeUndefined()
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: 5,
    })

    form.enabled.setInput(true)

    const concise = 5

    expect(form.getOutput(monitor)).toBe(concise)
    expect(form.getOutput(monitor, params._first)).toBe(concise)
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: 5,
    })
  })

  it("returns undefined after disabling when element is valid", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, { schema: z.boolean() }),
      FormUnit(3, { schema: z.number().min(1) }),
    )

    const concise = 3

    expect(form.getOutput(monitor)).toBe(concise)

    form.enabled.setInput(false)

    expect(form.getOutput(monitor)).toBeUndefined()
    expect(form.getOutput(monitor, params._first)).toBeUndefined()
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: 3,
    })
  })

  it("returns null after enabling when element is invalid", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(false, { schema: z.boolean() }),
      FormUnit(0, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(monitor)).toBeUndefined()

    form.enabled.setInput(true)

    expect(form.getOutput(monitor)).toBeNull()
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: null,
    })
  })

  it("returns undefined after disabling when element is invalid", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, { schema: z.boolean() }),
      FormUnit(0, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(monitor)).toBeNull()

    form.enabled.setInput(false)

    expect(form.getOutput(monitor)).toBeUndefined()
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      enabled: false,
      element: null,
    })
  })

  it("returns output after making element valid while enabled is true", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, { schema: z.boolean() }),
      FormUnit(0, { schema: z.number().min(1) }),
    )

    expect(form.getOutput(monitor)).toBeNull()

    form.element.setInput(2)

    const concise = 2

    expect(form.getOutput(monitor)).toBe(concise)
    expect(form.getOutput(monitor, params._first)).toBe(concise)
    expect(form.getOutput(monitor, params._second)).toStrictEqual({
      enabled: true,
      element: 2,
    })
  })
})

it("gets disabled nested output", ({ monitor }) => {
  const form = FormOptional(
    FormUnit(true, { schema: z.boolean() }),
    FormOptional(FormUnit(false), FormUnit(0)),
  )

  expect(form.getOutput(monitor)).toBeUndefined()
  expect(form.getOutput(monitor, params._first)).toBeUndefined()
  expect(form.getOutput(monitor, params._second)).toStrictEqual({
    enabled: true,
    element: {
      enabled: false,
      element: 0,
    },
  })
})

describe("stable output value", () => {
  it("subsequently selects equal output", ({ monitor }) => {
    const form = FormOptional(
      FormUnit(true, { schema: z.boolean() }),
      FormUnit(1 as number, {
        transform: (size) => Array.from({ length: Math.max(1, size) }, (_, index) => index),
      }),
    )

    const output0 = form.getOutput(monitor)

    form.element.setInput(0)
    const output1 = form.getOutput(monitor)

    expect(output0).not.toBe(output1)
    expect(output0).toStrictEqual(output1)
  })
})
