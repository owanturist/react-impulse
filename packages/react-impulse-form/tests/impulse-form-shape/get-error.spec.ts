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
    first: [expect.any(String)],
    second: null,
    third: null,
  })
  expect(shape.getError(scope, params._first)).toStrictEqual(
    shape.getError(scope),
  )
  expect(shape.getError(scope, params._second)).toStrictEqual({
    first: [expect.any(String)],
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
    first: [expect.any(String)],
    second: null,
    third: {
      one: null,
      two: [expect.any(String)],
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

it("subsequently selects equal error shapes", ({ scope }) => {
  const shape = ImpulseFormShape(
    {
      first: ImpulseFormUnit("1", { error: "first" }),
      second: ImpulseFormUnit(2, { error: "second" }),
    },
    {
      validateOn: "onInit",
    },
  )

  expect(shape.getError(scope)).toStrictEqual({
    first: "first",
    second: "second",
  })
  expect(shape.getError(scope)).toBe(shape.getError(scope))
  expect(shape.getError(scope)).toBe(shape.getError(scope))
  expect(shape.getError(scope, params._first)).toBe(
    shape.getError(scope, params._first),
  )
  expect(shape.getError(scope, params._second)).toBe(
    shape.getError(scope, params._second),
  )
})

it("persists unchanged error fields between changes", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormShape({
      _0: ImpulseFormUnit("1", { error: "first" }),
      _1: ImpulseFormUnit("2", { error: "second" }),
    }),
    second: ImpulseFormShape({
      _3: ImpulseFormUnit("3", { error: "third" }),
      _4: ImpulseFormUnit("4", { error: "fourth" }),
    }),
  })

  const error_0 = shape.getError(scope)

  expect(error_0).toStrictEqual({
    first: {
      _0: "first",
      _1: "second",
    },
    second: {
      _3: "third",
      _4: "fourth",
    },
  })

  shape.setError({
    second: {
      _3: "third changed",
    },
  })

  const error_1 = shape.getError(scope)

  expect(error_1).toStrictEqual({
    first: {
      _0: "first",
      _1: "second",
    },
    second: {
      _3: "third changed",
      _4: "fourth",
    },
  })
  expect(error_1).not.toBe(error_0)
  expect(error_1?.first).toBe(error_0?.first)
  expect(error_1?.second).not.toBe(error_0?.second)
})
