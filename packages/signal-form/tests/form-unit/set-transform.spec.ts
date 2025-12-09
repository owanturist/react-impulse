import z from "zod"

import { FormUnit } from "../../src"

it("sets the transformer", ({ monitor }) => {
  const unit = FormUnit("hi")

  expect(unit.getOutput(monitor)).toBe("hi")

  unit.setTransform((input) => `${input}.`)
  expect(unit.getOutput(monitor)).toBe("hi.")
})

it("overrides a transformer", ({ monitor }) => {
  const unit = FormUnit("hi", {
    transform: (input) => `${input}.`,
  })

  expect(unit.getOutput(monitor)).toBe("hi.")

  unit.setTransform((input) => `${input}!`)
  expect(unit.getOutput(monitor)).toBe("hi!")

  unit.setTransform((input) => `${input}?`)
  expect(unit.getOutput(monitor)).toBe("hi?")
})

it("overrides schema", ({ monitor }) => {
  const unit = FormUnit("hi", {
    schema: z.string().transform((input) => input.length),
  })

  expect(unit.getOutput(monitor)).toBe(2)

  unit.setTransform((input) => input.length + 1)
  expect(unit.getOutput(monitor)).toBe(3)
})

it("overrides validate", ({ monitor }) => {
  const unit = FormUnit<string, string, number>("hi", {
    validate: (input) => {
      if (input.length === 0) {
        return ["Input is too short", null]
      }

      return [null, input.length]
    },
  })

  expect(unit.getOutput(monitor)).toBe(2)

  unit.setTransform((input) => input.length + 1)
  expect(unit.getOutput(monitor)).toBe(3)
})
