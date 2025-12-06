import type { Setter } from "~/tools/setter"

import { ImpulseFormShape, ImpulseFormUnit } from "../../src"

it("updates initial value", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit(""),
    second: ImpulseFormUnit(0),
    third: ImpulseFormShape({
      one: ImpulseFormUnit(true),
      two: ImpulseFormUnit([""]),
    }),
    fourth: ["anything"],
  })

  expect(shape.getInitial(scope)).toStrictEqual({
    first: "",
    second: 0,
    third: {
      one: true,
      two: [""],
    },
    fourth: ["anything"],
  })

  shape.setInitial({
    third: {
      one: false,
      two: undefined,
    },
  })
  expect(shape.getInitial(scope)).toStrictEqual({
    first: "",
    second: 0,
    third: {
      one: false,
      two: [""],
    },
    fourth: ["anything"],
  })

  shape.setInitial({
    third: {
      two: (two) => [...two, "hi"],
    },
  })
  expect(shape.getInitial(scope)).toStrictEqual({
    first: "",
    second: 0,
    third: {
      one: false,
      two: ["", "hi"],
    },
    fourth: ["anything"],
  })

  shape.setInitial({
    first: "1",
    second: 2,
    third: {
      one: true,
      two: ["two"],
    },
  })
  expect(shape.getInitial(scope)).toStrictEqual({
    first: "1",
    second: 2,
    third: {
      one: true,
      two: ["two"],
    },
    fourth: ["anything"],
  })

  shape.setInitial((root) => {
    expect(root).toStrictEqual({
      first: "1",
      second: 2,
      third: {
        one: true,
        two: ["two"],
      },
      fourth: ["anything"],
    })

    return {
      first: (first) => {
        expect(first).toBe("1")

        return "one"
      },
      second: (second) => {
        expect(second).toBe(2)

        return 3
      },
      third: (third) => {
        expect(third).toStrictEqual({
          one: true,
          two: ["two"],
        })

        return {
          one: (one) => {
            expect(one).toBe(true)

            return false
          },
          two: (two) => {
            expect(two).toStrictEqual(["two"])

            return [...two, "three"]
          },
        }
      },
    }
  })

  expect(shape.getInitial(scope)).toStrictEqual({
    first: "one",
    second: 3,
    third: {
      one: false,
      two: ["two", "three"],
    },
    fourth: ["anything"],
  })

  expectTypeOf(shape.getInitial(scope)).toEqualTypeOf<{
    readonly first: string
    readonly second: number
    readonly third: {
      readonly one: boolean
      readonly two: Array<string>
    }
    readonly fourth: Array<string>
  }>()

  expectTypeOf(shape.fields.third.getInitial(scope)).toEqualTypeOf<{
    readonly one: boolean
    readonly two: Array<string>
  }>()

  expectTypeOf(shape.setInitial).parameter(0).toEqualTypeOf<
    Setter<
      {
        readonly first?: Setter<string, [string, string]>
        readonly second?: Setter<number, [number, number]>
        readonly third?: Setter<
          {
            readonly one?: Setter<boolean, [boolean, boolean]>
            readonly two?: Setter<Array<string>, [Array<string>, Array<string>]>
          },
          [
            {
              readonly one: boolean
              readonly two: Array<string>
            },
            {
              readonly one: boolean
              readonly two: Array<string>
            },
          ]
        >
      },
      [
        {
          readonly first: string
          readonly second: number
          readonly third: {
            readonly one: boolean
            readonly two: Array<string>
          }
          readonly fourth: Array<string>
        },
        {
          readonly first: string
          readonly second: number
          readonly third: {
            readonly one: boolean
            readonly two: Array<string>
          }
          readonly fourth: Array<string>
        },
      ]
    >
  >()

  expectTypeOf(shape.fields.third.setInitial).parameter(0).toEqualTypeOf<
    Setter<
      {
        readonly one?: Setter<boolean, [boolean, boolean]>
        readonly two?: Setter<Array<string>, [Array<string>, Array<string>]>
      },
      [
        {
          readonly one: boolean
          readonly two: Array<string>
        },
        {
          readonly one: boolean
          readonly two: Array<string>
        },
      ]
    >
  >()
})

it("fields initial values are independent", ({ scope }) => {
  const unit = ImpulseFormUnit("0")
  const shape = ImpulseFormShape({
    first: unit,
    second: unit,
  })

  expect(shape.getInitial(scope)).toStrictEqual({
    first: "0",
    second: "0",
  })

  shape.setInitial({
    first: "1",
  })
  expect(shape.getInitial(scope)).toStrictEqual({
    first: "1",
    second: "0",
  })
})
