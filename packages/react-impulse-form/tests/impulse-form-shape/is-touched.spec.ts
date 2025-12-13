import { params } from "~/tools/params"

import { FormShape, FormUnit } from "../../src"

it("selects touched", ({ monitor }) => {
  const shape = FormShape({
    first: FormUnit(""),
    second: FormUnit(0),
    third: FormShape({
      one: FormUnit(true),
      two: FormUnit([""]),
    }),
    fourth: ["anything"],
  })

  expect(shape.isTouched(monitor)).toBe(false)
  expect(shape.isTouched(monitor, params._first)).toBe(false)
  expect(shape.isTouched(monitor, params._second)).toStrictEqual({
    first: false,
    second: false,
    third: {
      one: false,
      two: false,
    },
  })
  expect(shape.fields.third.isTouched(monitor)).toBe(false)
  expect(shape.fields.third.isTouched(monitor, params._first)).toBe(false)
  expect(shape.fields.third.isTouched(monitor, params._second)).toStrictEqual({
    one: false,
    two: false,
  })

  shape.fields.third.fields.one.setTouched(true)
  expect(shape.fields.third.isTouched(monitor)).toBe(true)
  expect(shape.fields.third.isTouched(monitor, params._first)).toStrictEqual({
    one: true,
    two: false,
  })
  expect(shape.fields.third.isTouched(monitor, params._second)).toStrictEqual({
    one: true,
    two: false,
  })
  expect(shape.fields.third.fields.one.isTouched(monitor)).toBe(true)
  expect(shape.isTouched(monitor)).toBe(true)
  expect(shape.isTouched(monitor, params._first)).toStrictEqual({
    first: false,
    second: false,
    third: {
      one: true,
      two: false,
    },
  })
  expect(shape.isTouched(monitor, params._second)).toStrictEqual({
    first: false,
    second: false,
    third: {
      one: true,
      two: false,
    },
  })

  shape.fields.first.setTouched(true)
  expect(shape.fields.first.isTouched(monitor)).toBe(true)
  expect(shape.isTouched(monitor)).toBe(true)
  expect(shape.isTouched(monitor, params._first)).toStrictEqual({
    first: true,
    second: false,
    third: {
      one: true,
      two: false,
    },
  })

  shape.fields.second.setTouched(true)
  expect(shape.fields.second.isTouched(monitor)).toBe(true)
  expect(shape.isTouched(monitor)).toBe(true)
  expect(shape.isTouched(monitor, params._first)).toStrictEqual({
    first: true,
    second: true,
    third: {
      one: true,
      two: false,
    },
  })

  shape.fields.third.fields.two.setTouched(true)
  expect(shape.fields.third.fields.two.isTouched(monitor)).toBe(true)
  expect(shape.fields.third.isTouched(monitor)).toBe(true)
  expect(shape.isTouched(monitor)).toBe(true)
  expect(shape.isTouched(monitor, params._first)).toBe(true)
  expect(shape.isTouched(monitor, params._second)).toStrictEqual({
    first: true,
    second: true,
    third: {
      one: true,
      two: true,
    },
  })

  expectTypeOf(
    shape.fields.third.fields.one.isTouched(monitor, params._first),
  ).toEqualTypeOf<boolean>()
  expectTypeOf(
    shape.fields.third.fields.one.isTouched(monitor, params._second),
  ).toEqualTypeOf<boolean>()

  expectTypeOf(shape.fields.third.isTouched(monitor, params._first)).toEqualTypeOf<
    | boolean
    | {
        readonly one: boolean
        readonly two: boolean
      }
  >()
  expectTypeOf(shape.fields.third.isTouched(monitor, params._second)).toEqualTypeOf<{
    readonly one: boolean
    readonly two: boolean
  }>()

  expectTypeOf(shape.isTouched(monitor, params._first)).toEqualTypeOf<
    | boolean
    | {
        readonly first: boolean
        readonly second: boolean
        readonly third:
          | boolean
          | {
              readonly one: boolean
              readonly two: boolean
            }
      }
  >()
  expectTypeOf(shape.isTouched(monitor, params._second)).toEqualTypeOf<{
    readonly first: boolean
    readonly second: boolean
    readonly third: {
      readonly one: boolean
      readonly two: boolean
    }
  }>()
})

it("does not allow to specify isTouched custom type without selector", ({ monitor }) => {
  const shape = FormShape({
    first: FormUnit(""),
    second: FormUnit(0),
  })

  // @ts-expect-error it should select string to return string
  const isTouched = shape.isTouched<string>(monitor)
  expect(isTouched).toBe(false)
  expectTypeOf(isTouched).toEqualTypeOf<boolean>()
})

it("returns false for empty shape", ({ monitor }) => {
  const shape = FormShape({})

  expect(shape.isTouched(monitor)).toBe(false)
})

it("returns false for shape without forms", ({ monitor }) => {
  const shape = FormShape({
    first: "one",
  })

  expect(shape.isTouched(monitor)).toBe(false)
})
