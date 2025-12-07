import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import { ImpulseFormShape, ImpulseFormUnit } from "../../src"

it("specifies touched", ({ monitor }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit(""),
    second: ImpulseFormUnit(0),
    third: ImpulseFormShape({
      one: ImpulseFormUnit(true),
      two: ImpulseFormUnit([""]),
    }),
    fourth: ["anything"],
  })

  shape.setTouched(true)
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

  shape.fields.third.setTouched(false)
  expect(shape.isTouched(monitor)).toBe(true)
  expect(shape.isTouched(monitor, params._first)).toStrictEqual({
    first: true,
    second: true,
    third: false,
  })
  expect(shape.isTouched(monitor, params._second)).toStrictEqual({
    first: true,
    second: true,
    third: {
      one: false,
      two: false,
    },
  })

  shape.setTouched({
    third: {
      one: true,
      two: undefined,
    },
  })
  expect(shape.isTouched(monitor)).toBe(true)
  expect(shape.isTouched(monitor, params._first)).toStrictEqual({
    first: true,
    second: true,
    third: {
      one: true,
      two: false,
    },
  })
  expect(shape.isTouched(monitor, params._second)).toStrictEqual({
    first: true,
    second: true,
    third: {
      one: true,
      two: false,
    },
  })

  shape.setTouched((root) => {
    expect(root).toStrictEqual({
      first: true,
      second: true,
      third: {
        one: true,
        two: false,
      },
    })

    return {
      third: (third) => {
        expect(third).toStrictEqual({
          one: true,
          two: false,
        })

        return {
          two: (two) => {
            expect(two).toBe(false)

            return true
          },
        }
      },
    }
  })
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

  expectTypeOf(shape.fields.third.fields.one.setTouched)
    .parameter(0)
    .toEqualTypeOf<Setter<boolean>>()

  expectTypeOf(shape.fields.third.setTouched).parameter(0).toEqualTypeOf<
    Setter<
      | boolean
      | {
          readonly one?: Setter<boolean>
          readonly two?: Setter<boolean>
        },
      [
        {
          readonly one: boolean
          readonly two: boolean
        },
      ]
    >
  >()

  expectTypeOf(shape.setTouched).parameter(0).toEqualTypeOf<
    Setter<
      | boolean
      | {
          readonly first?: Setter<boolean>
          readonly second?: Setter<boolean>
          readonly third?: Setter<
            | boolean
            | {
                readonly one?: Setter<boolean>
                readonly two?: Setter<boolean>
              },
            [
              {
                readonly one: boolean
                readonly two: boolean
              },
            ]
          >
        },
      [
        {
          readonly first: boolean
          readonly second: boolean
          readonly third: {
            readonly one: boolean
            readonly two: boolean
          }
        },
      ]
    >
  >()
})
