import { z } from "zod"

import { ImpulseFormShape, ImpulseFormUnit } from "../../src"
import { arg } from "../common"

it("selects error", ({ scope }) => {
  const shape = ImpulseFormShape(
    {
      first: ImpulseFormUnit("1", { schema: z.string().max(1) }),
      second: ImpulseFormUnit(0, { schema: z.number().nonnegative() }),
      third: ImpulseFormShape({
        one: ImpulseFormUnit(true),
        two: ImpulseFormUnit(["1"], {
          schema: z.array(z.string().max(1)),
        }),
      }),
      fourth: ["anything"],
    },
    { touched: true },
  )

  expect(shape.getError(scope)).toBeNull()
  expect(shape.getError(scope, arg(0))).toBeNull()
  expect(shape.getError(scope, arg(1))).toStrictEqual({
    first: null,
    second: null,
    third: {
      one: null,
      two: null,
    },
  })

  shape.setInput({
    first: "12",
  })
  expect(shape.getError(scope)).toStrictEqual({
    first: ["String must contain at most 1 character(s)"],
    second: null,
    third: null,
  })
  expect(shape.getError(scope, arg(0))).toStrictEqual(shape.getError(scope))
  expect(shape.getError(scope, arg(1))).toStrictEqual({
    first: ["String must contain at most 1 character(s)"],
    second: null,
    third: {
      one: null,
      two: null,
    },
  })

  shape.setInput({
    third: {
      two: ["1", "12"],
    },
  })
  expect(shape.getError(scope)).toStrictEqual({
    first: ["String must contain at most 1 character(s)"],
    second: null,
    third: {
      one: null,
      two: ["String must contain at most 1 character(s)"],
    },
  })
  expect(shape.getError(scope, arg(0))).toStrictEqual(shape.getError(scope))
  expect(shape.getError(scope, arg(1))).toStrictEqual(shape.getError(scope))

  const error = shape.getError(scope)

  expectTypeOf(error).toEqualTypeOf<null | {
    readonly first: null | ReadonlyArray<string>
    readonly second: null | ReadonlyArray<string>
    readonly third: null | {
      readonly one: null
      readonly two: null | ReadonlyArray<string>
    }
  }>()

  expectTypeOf(shape.fields.third.getError(scope)).toEqualTypeOf<null | {
    readonly one: null
    readonly two: null | ReadonlyArray<string>
  }>()
})
