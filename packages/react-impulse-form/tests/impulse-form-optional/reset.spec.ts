import z from "zod"

import { ImpulseFormOptional, ImpulseFormUnit } from "../../src"

it("reset without resetter resets to initial", ({ scope }) => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit(1, { schema: z.number() }),
  )

  form.setInput({ element: 2 })
  expect(form.getInput(scope)).toStrictEqual({ enabled: true, element: 2 })

  form.reset()
  expect(form.getInput(scope)).toStrictEqual({ enabled: true, element: 1 })
})

it("reset with resetter sets initial recursively then resets", ({ scope }) => {
  const form = ImpulseFormOptional(
    ImpulseFormUnit(true, { schema: z.boolean() }),
    ImpulseFormUnit(1, { schema: z.number() }),
  )

  form.setInput({ element: 2 })
  expect(form.getInput(scope)).toStrictEqual({ enabled: true, element: 2 })

  form.reset({ element: 5 })
  expect(form.getInput(scope)).toStrictEqual({ enabled: true, element: 1 })
  expect(form.getInitial(scope)).toStrictEqual({ enabled: true, element: 5 })
})
