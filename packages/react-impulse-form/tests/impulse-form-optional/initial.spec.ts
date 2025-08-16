import type { Scope } from "react-impulse"
import z from "zod"

import { ImpulseFormOptional, ImpulseFormUnit } from "../../src"

describe("types", () => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean(), initial: false }),
    ImpulseFormUnit(0, { schema: z.number(), initial: 1 }),
  )

  interface InitialSchema {
    readonly enabled: boolean
    readonly element: number
  }

  it("matches schema type for getInitial(scope)", () => {
    expectTypeOf(form.getInitial).toEqualTypeOf<
      (scope: Scope) => InitialSchema
    >()
  })
})

it("initiates with children initial", ({ scope }) => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit(1, { schema: z.number() }),
  )

  expect(form.getInitial(scope)).toStrictEqual({ enabled: true, element: 1 })
})

it("initiates with overridden initial", ({ scope }) => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit(1, { schema: z.number() }),
    {
      initial: {
        enabled: false,
        element: 2,
      },
    },
  )

  expect(form.getInitial(scope)).toStrictEqual({ enabled: false, element: 2 })
})

it("setInitial replaces initial only", ({ scope }) => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit(1, { schema: z.number() }),
  )

  form.setInitial({ enabled: false })
  expect(form.getInitial(scope)).toStrictEqual({ enabled: false, element: 1 })

  form.setInitial({ element: 10 })
  expect(form.getInitial(scope)).toStrictEqual({ enabled: false, element: 10 })
})

it("getInitial stable identity", ({ scope }) => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit({ a: 1 }),
  )

  const initial_0 = form.getInitial(scope)

  form.setInitial({ element: { a: 1 } })
  const initial_1 = form.getInitial(scope)

  expect(initial_0).not.toBe(initial_1)
  expect(initial_0).toStrictEqual(initial_1)
})
