import z from "zod"

import { ImpulseFormUnit } from "../../src"

it("sets the transformer", ({ scope }) => {
  const unit = ImpulseFormUnit("hi")

  expect(unit.getOutput(scope)).toBe("hi")

  unit.setTransform((input) => input + ".")
  expect(unit.getOutput(scope)).toBe("hi.")
})

it("overrides a transformer", ({ scope }) => {
  const unit = ImpulseFormUnit("hi", {
    transform: (input) => input + ".",
  })

  expect(unit.getOutput(scope)).toBe("hi.")

  unit.setTransform((input) => input + "!")
  expect(unit.getOutput(scope)).toBe("hi!")

  unit.setTransform((input) => input + "?")
  expect(unit.getOutput(scope)).toBe("hi?")
})

it("overrides schema", ({ scope }) => {
  const unit = ImpulseFormUnit("hi", {
    schema: z.string().transform((input) => input.length),
  })

  expect(unit.getOutput(scope)).toBe(2)

  unit.setTransform((input) => input.length + 1)
  expect(unit.getOutput(scope)).toBe(3)
})

it("overrides validate", ({ scope }) => {
  const unit = ImpulseFormUnit<string, string, number>("hi", {
    validate: (input) => {
      if (input.length < 1) {
        return ["Input is too short", null]
      }

      return [null, input.length]
    },
  })

  expect(unit.getOutput(scope)).toBe(2)

  unit.setTransform((input) => input.length + 1)
  expect(unit.getOutput(scope)).toBe(3)
})
