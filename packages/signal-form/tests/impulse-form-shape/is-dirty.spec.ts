import { params } from "~/tools/params"

import { ImpulseFormShape, ImpulseFormUnit } from "../../src"

it("selects touched", ({ monitor }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit(""),
    second: ImpulseFormUnit(0),
    third: ImpulseFormShape({
      one: ImpulseFormUnit(true),
      two: ImpulseFormUnit([""]),
    }),
    fourth: ["anything"],
  })

  expect(shape.isDirty(monitor)).toBe(false)
  expect(shape.isDirty(monitor, params._first)).toBe(false)
  expect(shape.isDirty(monitor, params._second)).toStrictEqual({
    first: false,
    second: false,
    third: {
      one: false,
      two: false,
    },
  })
  expect(shape.fields.third.isDirty(monitor)).toBe(false)
  expect(shape.fields.third.isDirty(monitor, params._first)).toBe(false)
  expect(shape.fields.third.isDirty(monitor, params._second)).toStrictEqual({
    one: false,
    two: false,
  })

  shape.fields.third.fields.one.setInput(false)
  expect(shape.fields.third.isDirty(monitor)).toBe(true)
  expect(shape.fields.third.isDirty(monitor, params._first)).toStrictEqual({
    one: true,
    two: false,
  })
  expect(shape.fields.third.isDirty(monitor, params._second)).toStrictEqual({
    one: true,
    two: false,
  })
  expect(shape.fields.third.fields.one.isDirty(monitor)).toBe(true)
  expect(shape.isDirty(monitor)).toBe(true)
  expect(shape.isDirty(monitor, params._first)).toStrictEqual({
    first: false,
    second: false,
    third: {
      one: true,
      two: false,
    },
  })
  expect(shape.isDirty(monitor, params._second)).toStrictEqual({
    first: false,
    second: false,
    third: {
      one: true,
      two: false,
    },
  })

  shape.fields.first.setInput("1")
  expect(shape.fields.first.isDirty(monitor)).toBe(true)
  expect(shape.isDirty(monitor)).toBe(true)
  expect(shape.isDirty(monitor, params._first)).toStrictEqual({
    first: true,
    second: false,
    third: {
      one: true,
      two: false,
    },
  })

  shape.fields.second.setInput(2)
  expect(shape.fields.second.isDirty(monitor)).toBe(true)
  expect(shape.isDirty(monitor)).toBe(true)
  expect(shape.isDirty(monitor, params._first)).toStrictEqual({
    first: true,
    second: true,
    third: {
      one: true,
      two: false,
    },
  })

  shape.fields.third.fields.two.setInput(["one", "two"])
  expect(shape.fields.third.fields.two.isDirty(monitor)).toBe(true)
  expect(shape.fields.third.isDirty(monitor)).toBe(true)
  expect(shape.isDirty(monitor)).toBe(true)
  expect(shape.isDirty(monitor, params._first)).toBe(true)
  expect(shape.isDirty(monitor, params._second)).toStrictEqual({
    first: true,
    second: true,
    third: {
      one: true,
      two: true,
    },
  })

  expectTypeOf(
    shape.fields.third.fields.one.isDirty(monitor, params._first),
  ).toEqualTypeOf<boolean>()
  expectTypeOf(
    shape.fields.third.fields.one.isDirty(monitor, params._second),
  ).toEqualTypeOf<boolean>()

  expectTypeOf(shape.fields.third.isDirty(monitor, params._first)).toEqualTypeOf<
    | boolean
    | {
        readonly one: boolean
        readonly two: boolean
      }
  >()
  expectTypeOf(shape.fields.third.isDirty(monitor, params._second)).toEqualTypeOf<{
    readonly one: boolean
    readonly two: boolean
  }>()

  expectTypeOf(shape.isDirty(monitor, params._first)).toEqualTypeOf<
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
  expectTypeOf(shape.isDirty(monitor, params._second)).toEqualTypeOf<{
    readonly first: boolean
    readonly second: boolean
    readonly third: {
      readonly one: boolean
      readonly two: boolean
    }
  }>()
})

it("does not allow to specify isDirty custom type without selector", ({ monitor }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit(""),
    second: ImpulseFormUnit(0),
  })

  // @ts-expect-error it should select string to return string
  const isDirty = shape.isDirty<string>(monitor)
  expect(isDirty).toBe(false)
  expectTypeOf(isDirty).toEqualTypeOf<boolean>()
})

it("returns false for empty shape", ({ monitor }) => {
  const shape = ImpulseFormShape({})

  expect(shape.isDirty(monitor)).toBe(false)
})

it("returns false for shape without forms", ({ monitor }) => {
  const shape = ImpulseFormShape({
    first: "one",
  })

  expect(shape.isDirty(monitor)).toBe(false)
})
