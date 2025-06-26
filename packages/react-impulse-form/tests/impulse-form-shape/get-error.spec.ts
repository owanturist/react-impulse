import { z } from "zod"

import { params } from "~/tools/params"

import { ImpulseFormShape, ImpulseFormUnit } from "../../src"

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
  expect(shape.getError(scope, params._first)).toBeNull()
  expect(shape.getError(scope, params._second)).toStrictEqual({
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
  expect(shape.getError(scope, params._first)).toStrictEqual(
    shape.getError(scope),
  )
  expect(shape.getError(scope, params._second)).toStrictEqual({
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
  expect(shape.getError(scope, params._first)).toStrictEqual(
    shape.getError(scope),
  )
  expect(shape.getError(scope, params._second)).toStrictEqual(
    shape.getError(scope),
  )

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

console.log("TODO continue from here")

it("selects the same subsequent error", ({ scope }) => {
  const shape = ImpulseFormShape(
    {
      first: ImpulseFormUnit("", { error: ["first"] }),
      second: ImpulseFormUnit(0, { error: ["second"] }),
      third: ImpulseFormShape(
        {
          one: ImpulseFormUnit(true, {
            validate: (input) =>
              input ? [null, input] : ["must be true", null],
          }),
          two: ImpulseFormUnit([""], { error: "an error" }),
        },
        {
          error: {
            one: "one",
            two: "two",
          },
        },
      ),
      fourth: ["anything"],
    },
    {
      validateOn: "onInit",
    },
  )

  expect(shape.getError(scope)).not.toBeNull()
  expect(shape.getError(scope)).toBe(shape.getError(scope))
  expect(shape.getError(scope, params._first)).toBe(
    shape.getError(scope, params._first),
  )
  expect(shape.getError(scope, params._second)).toBe(
    shape.getError(scope, params._second),
  )
})
