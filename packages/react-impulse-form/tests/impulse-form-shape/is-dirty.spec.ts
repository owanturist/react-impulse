import { ImpulseFormShape, ImpulseFormUnit } from "../../src"
import { arg } from "../common"

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

  expect(shape.isDirty(scope)).toBe(false)
  expect(shape.isDirty(scope, arg(0))).toBe(false)
  expect(shape.isDirty(scope, arg(1))).toStrictEqual({
    first: false,
    second: false,
    third: {
      one: false,
      two: false,
    },
  })
  expect(shape.fields.third.isDirty(scope)).toBe(false)
  expect(shape.fields.third.isDirty(scope, arg(0))).toBe(false)
  expect(shape.fields.third.isDirty(scope, arg(1))).toStrictEqual({
    one: false,
    two: false,
  })

  shape.fields.third.fields.one.setInput(false)
  expect(shape.fields.third.isDirty(scope)).toBe(true)
  expect(shape.fields.third.isDirty(scope, arg(0))).toStrictEqual({
    one: true,
    two: false,
  })
  expect(shape.fields.third.isDirty(scope, arg(1))).toStrictEqual({
    one: true,
    two: false,
  })
  expect(shape.fields.third.fields.one.isDirty(scope)).toBe(true)
  expect(shape.isDirty(scope)).toBe(true)
  expect(shape.isDirty(scope, arg(0))).toStrictEqual({
    first: false,
    second: false,
    third: {
      one: true,
      two: false,
    },
  })
  expect(shape.isDirty(scope, arg(1))).toStrictEqual({
    first: false,
    second: false,
    third: {
      one: true,
      two: false,
    },
  })

  shape.fields.first.setInput("1")
  expect(shape.fields.first.isDirty(scope)).toBe(true)
  expect(shape.isDirty(scope)).toBe(true)
  expect(shape.isDirty(scope, arg(0))).toStrictEqual({
    first: true,
    second: false,
    third: {
      one: true,
      two: false,
    },
  })

  shape.fields.second.setInput(2)
  expect(shape.fields.second.isDirty(scope)).toBe(true)
  expect(shape.isDirty(scope)).toBe(true)
  expect(shape.isDirty(scope, arg(0))).toStrictEqual({
    first: true,
    second: true,
    third: {
      one: true,
      two: false,
    },
  })

  shape.fields.third.fields.two.setInput(["one", "two"])
  expect(shape.fields.third.fields.two.isDirty(scope)).toBe(true)
  expect(shape.fields.third.isDirty(scope)).toBe(true)
  expect(shape.isDirty(scope)).toBe(true)
  expect(shape.isDirty(scope, arg(0))).toBe(true)
  expect(shape.isDirty(scope, arg(1))).toStrictEqual({
    first: true,
    second: true,
    third: {
      one: true,
      two: true,
    },
  })

  expectTypeOf(
    shape.fields.third.fields.one.isDirty(scope, arg(0)),
  ).toEqualTypeOf<boolean>()
  expectTypeOf(
    shape.fields.third.fields.one.isDirty(scope, arg(1)),
  ).toEqualTypeOf<boolean>()

  expectTypeOf(shape.fields.third.isDirty(scope, arg(0))).toEqualTypeOf<
    | boolean
    | {
        readonly one: boolean
        readonly two: boolean
      }
  >()
  expectTypeOf(shape.fields.third.isDirty(scope, arg(1))).toEqualTypeOf<{
    readonly one: boolean
    readonly two: boolean
  }>()

  expectTypeOf(shape.isDirty(scope, arg(0))).toEqualTypeOf<
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
  expectTypeOf(shape.isDirty(scope, arg(1))).toEqualTypeOf<{
    readonly first: boolean
    readonly second: boolean
    readonly third: {
      readonly one: boolean
      readonly two: boolean
    }
  }>()
})

it("does not allow to specify isDirty custom type without selector", ({
  scope,
}) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit(""),
    second: ImpulseFormUnit(0),
  })

  // @ts-expect-error it should select string to return string
  const isDirty = shape.isDirty<string>(scope)
  expect(isDirty).toBe(false)
  expectTypeOf(isDirty).toEqualTypeOf<boolean>()
})

it("returns false for empty shape", ({ scope }) => {
  const shape = ImpulseFormShape({})

  expect(shape.isDirty(scope)).toBe(false)
})

it("returns false for shape without forms", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: "one",
  })

  expect(shape.isDirty(scope)).toBe(false)
})
