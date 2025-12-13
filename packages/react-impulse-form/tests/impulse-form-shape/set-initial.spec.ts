import type { Setter } from "~/tools/setter"

import { FormShape, FormUnit } from "../../src"

it("updates initial value", ({ monitor }) => {
  const shape = FormShape({
    first: FormUnit(""),
    second: FormUnit(0),
    third: FormShape({
      one: FormUnit(true),
      two: FormUnit([""]),
    }),
    fourth: ["anything"],
  })

  expect(shape.getInitial(monitor)).toStrictEqual({
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
  expect(shape.getInitial(monitor)).toStrictEqual({
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
  expect(shape.getInitial(monitor)).toStrictEqual({
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
  expect(shape.getInitial(monitor)).toStrictEqual({
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

  expect(shape.getInitial(monitor)).toStrictEqual({
    first: "one",
    second: 3,
    third: {
      one: false,
      two: ["two", "three"],
    },
    fourth: ["anything"],
  })

  expectTypeOf(shape.getInitial(monitor)).toEqualTypeOf<{
    readonly first: string
    readonly second: number
    readonly third: {
      readonly one: boolean
      readonly two: Array<string>
    }
    readonly fourth: Array<string>
  }>()

  expectTypeOf(shape.fields.third.getInitial(monitor)).toEqualTypeOf<{
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

it("fields initial values are independent", ({ monitor }) => {
  const unit = FormUnit("0")
  const shape = FormShape({
    first: unit,
    second: unit,
  })

  expect(shape.getInitial(monitor)).toStrictEqual({
    first: "0",
    second: "0",
  })

  shape.setInitial({
    first: "1",
  })
  expect(shape.getInitial(monitor)).toStrictEqual({
    first: "1",
    second: "0",
  })
})
