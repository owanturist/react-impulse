import { z } from "zod"

import { ImpulseFormUnit } from "../../src"
import { arg } from "../common"

it("selects value when not validated", ({ scope }) => {
  const value = ImpulseFormUnit("1", {
    schema: z.string().max(1),
  })

  expect(value.getOutput(scope)).toBe("1")
  expect(value.getError(scope)).toBeNull()

  value.setTouched(true)
  expect(value.getOutput(scope)).toBe("1")
  expect(value.getError(scope)).toBeNull()
})

it("selects value when not validated without schema", ({ scope }) => {
  const value = ImpulseFormUnit("1")

  expect(value.getOutput(scope)).toBe("1")
  expect(value.getError(scope)).toBeNull()
})

it("selects value", ({ scope }) => {
  const value = ImpulseFormUnit("1", {
    schema: z.string().max(1),
    validateOn: "onInit",
  })

  expect(value.getOutput(scope)).toBe("1")
  expect(value.getOutput(scope, arg(0))).toBe("1")
  expect(value.getOutput(scope, (_, verbose) => verbose)).toBe("1")

  value.setInput("12")
  expect(value.getOutput(scope)).toBeNull()
  expect(value.getOutput(scope, arg(0))).toBeNull()
  expect(value.getOutput(scope, (_, verbose) => verbose)).toBeNull()

  expectTypeOf(value.getOutput(scope)).toEqualTypeOf<null | string>()
  expectTypeOf(value.getOutput(scope, arg(0))).toEqualTypeOf<null | string>()
  expectTypeOf(value.getOutput(scope, (_, verbose) => verbose)).toEqualTypeOf<
    null | string
  >()
})

it("transforms value with custom ZodLikeSchema#safeParse", ({ scope }) => {
  const value = ImpulseFormUnit(2, {
    schema: {
      safeParse(input) {
        return { success: true, data: String(input) }
      },
    },
    validateOn: "onInit",
  })

  expect(value.getOutput(scope)).toBe("2")
  expect(value.getError(scope)).toBeNull()
})

it("transforms value with custom ZodLikeSchema#parse", ({ scope }) => {
  const value = ImpulseFormUnit(2, {
    schema: {
      parse(input) {
        return String(input)
      },
    },
    validateOn: "onInit",
  })

  expect(value.getOutput(scope)).toBe("2")
  expect(value.getError(scope)).toBeNull()
})
