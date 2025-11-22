import { params } from "~/tools/params"

import { ImpulseFormShape, ImpulseFormUnit } from "../../src"

it("selects touched", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit(""),
    second: ImpulseFormUnit(0),
    third: ImpulseFormShape({
      one: ImpulseFormUnit(true),
      two: ImpulseFormUnit([""]),
    }),
    fourth: ["anything"],
  })

  expect(shape.isTouched(scope)).toBe(false)
  expect(shape.isTouched(scope, params._first)).toBe(false)
  expect(shape.isTouched(scope, params._second)).toStrictEqual({
    first: false,
    second: false,
    third: {
      one: false,
      two: false,
    },
  })
  expect(shape.fields.third.isTouched(scope)).toBe(false)
  expect(shape.fields.third.isTouched(scope, params._first)).toBe(false)
  expect(shape.fields.third.isTouched(scope, params._second)).toStrictEqual({
    one: false,
    two: false,
  })

  shape.fields.third.fields.one.setTouched(true)
  expect(shape.fields.third.isTouched(scope)).toBe(true)
  expect(shape.fields.third.isTouched(scope, params._first)).toStrictEqual({
    one: true,
    two: false,
  })
  expect(shape.fields.third.isTouched(scope, params._second)).toStrictEqual({
    one: true,
    two: false,
  })
  expect(shape.fields.third.fields.one.isTouched(scope)).toBe(true)
  expect(shape.isTouched(scope)).toBe(true)
  expect(shape.isTouched(scope, params._first)).toStrictEqual({
    first: false,
    second: false,
    third: {
      one: true,
      two: false,
    },
  })
  expect(shape.isTouched(scope, params._second)).toStrictEqual({
    first: false,
    second: false,
    third: {
      one: true,
      two: false,
    },
  })

  shape.fields.first.setTouched(true)
  expect(shape.fields.first.isTouched(scope)).toBe(true)
  expect(shape.isTouched(scope)).toBe(true)
  expect(shape.isTouched(scope, params._first)).toStrictEqual({
    first: true,
    second: false,
    third: {
      one: true,
      two: false,
    },
  })

  shape.fields.second.setTouched(true)
  expect(shape.fields.second.isTouched(scope)).toBe(true)
  expect(shape.isTouched(scope)).toBe(true)
  expect(shape.isTouched(scope, params._first)).toStrictEqual({
    first: true,
    second: true,
    third: {
      one: true,
      two: false,
    },
  })

  shape.fields.third.fields.two.setTouched(true)
  expect(shape.fields.third.fields.two.isTouched(scope)).toBe(true)
  expect(shape.fields.third.isTouched(scope)).toBe(true)
  expect(shape.isTouched(scope)).toBe(true)
  expect(shape.isTouched(scope, params._first)).toBe(true)
  expect(shape.isTouched(scope, params._second)).toStrictEqual({
    first: true,
    second: true,
    third: {
      one: true,
      two: true,
    },
  })

  expectTypeOf(
    shape.fields.third.fields.one.isTouched(scope, params._first),
  ).toEqualTypeOf<boolean>()
  expectTypeOf(
    shape.fields.third.fields.one.isTouched(scope, params._second),
  ).toEqualTypeOf<boolean>()

  expectTypeOf(shape.fields.third.isTouched(scope, params._first)).toEqualTypeOf<
    | boolean
    | {
        readonly one: boolean
        readonly two: boolean
      }
  >()
  expectTypeOf(shape.fields.third.isTouched(scope, params._second)).toEqualTypeOf<{
    readonly one: boolean
    readonly two: boolean
  }>()

  expectTypeOf(shape.isTouched(scope, params._first)).toEqualTypeOf<
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
  expectTypeOf(shape.isTouched(scope, params._second)).toEqualTypeOf<{
    readonly first: boolean
    readonly second: boolean
    readonly third: {
      readonly one: boolean
      readonly two: boolean
    }
  }>()
})

it("does not allow to specify isTouched custom type without selector", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit(""),
    second: ImpulseFormUnit(0),
  })

  // @ts-expect-error it should select string to return string
  const isTouched = shape.isTouched<string>(scope)
  expect(isTouched).toBe(false)
  expectTypeOf(isTouched).toEqualTypeOf<boolean>()
})

it("returns false for empty shape", ({ scope }) => {
  const shape = ImpulseFormShape({})

  expect(shape.isTouched(scope)).toBe(false)
})

it("returns false for shape without forms", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: "one",
  })

  expect(shape.isTouched(scope)).toBe(false)
})
