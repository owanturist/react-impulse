import { z } from "zod"

import { params } from "~/tools/params"

import { FormShape, FormUnit } from "../../src"

it("selects error", ({ monitor }) => {
  const shape = FormShape(
    {
      first: FormUnit("1", { schema: z.string().max(1) }),
      second: FormUnit(0, { schema: z.number().nonnegative() }),
      third: FormShape({
        one: FormUnit(true),
        two: FormUnit(["1"], {
          schema: z.array(z.string().max(1)),
        }),
      }),
      fourth: ["anything"],
    },
    { touched: true },
  )

  expect(shape.getError(monitor)).toBeNull()
  expect(shape.getError(monitor, params._first)).toBeNull()
  expect(shape.getError(monitor, params._second)).toStrictEqual({
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
  expect(shape.getError(monitor)).toStrictEqual({
    first: [expect.any(String)],
    second: null,
    third: null,
  })
  expect(shape.getError(monitor, params._first)).toStrictEqual(shape.getError(monitor))
  expect(shape.getError(monitor, params._second)).toStrictEqual({
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
  expect(shape.getError(monitor)).toStrictEqual({
    first: [expect.any(String)],
    second: null,
    third: {
      one: null,
      two: [expect.any(String)],
    },
  })
  expect(shape.getError(monitor, params._first)).toStrictEqual(shape.getError(monitor))
  expect(shape.getError(monitor, params._second)).toStrictEqual(shape.getError(monitor))

  const error = shape.getError(monitor)

  expectTypeOf(error).toEqualTypeOf<null | {
    readonly first: null | ReadonlyArray<string>
    readonly second: null | ReadonlyArray<string>
    readonly third: null | {
      readonly one: null
      readonly two: null | ReadonlyArray<string>
    }
  }>()

  expectTypeOf(shape.fields.third.getError(monitor)).toEqualTypeOf<null | {
    readonly one: null
    readonly two: null | ReadonlyArray<string>
  }>()
})

it("subsequently selects equal error shapes", ({ monitor }) => {
  const shape = FormShape(
    {
      first: FormUnit("1", { error: "first" }),
      second: FormUnit(2, { error: "second" }),
    },
    {
      validateOn: "onInit",
    },
  )

  expect(shape.getError(monitor)).toStrictEqual({
    first: "first",
    second: "second",
  })
  expect(shape.getError(monitor)).toBe(shape.getError(monitor))
  expect(shape.getError(monitor)).toBe(shape.getError(monitor))
  expect(shape.getError(monitor, params._first)).toBe(shape.getError(monitor, params._first))
  expect(shape.getError(monitor, params._second)).toBe(shape.getError(monitor, params._second))
})

it("persists unchanged error fields between changes", ({ monitor }) => {
  const shape = FormShape({
    first: FormShape({
      _0: FormUnit("1", { error: "first" }),
      _1: FormUnit("2", { error: "second" }),
    }),
    second: FormShape({
      _3: FormUnit("3", { error: "third" }),
      _4: FormUnit("4", { error: "fourth" }),
    }),
  })

  const error0 = shape.getError(monitor)

  expect(error0).toStrictEqual({
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

  const error1 = shape.getError(monitor)

  expect(error1).toStrictEqual({
    first: {
      _0: "first",
      _1: "second",
    },
    second: {
      _3: "third changed",
      _4: "fourth",
    },
  })
  expect(error1).not.toBe(error0)
  expect(error1?.first).toBe(error0?.first)
  expect(error1?.second).not.toBe(error0?.second)
})
