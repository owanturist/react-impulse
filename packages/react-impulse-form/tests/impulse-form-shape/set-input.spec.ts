import type { Setter } from "~/tools/setter"

import { ImpulseFormShape, ImpulseFormUnit } from "../../src"

it("updates original value", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit(""),
    second: ImpulseFormUnit(0),
    third: ImpulseFormShape({
      one: ImpulseFormUnit(true),
      two: ImpulseFormUnit([""]),
    }),
    fourth: ["anything"],
  })

  expect(shape.getInput(scope)).toStrictEqual({
    first: "",
    second: 0,
    third: {
      one: true,
      two: [""],
    },
    fourth: ["anything"],
  })

  shape.setInput({
    third: {
      one: false,
      two: undefined,
    },
  })
  expect(shape.getInput(scope)).toStrictEqual({
    first: "",
    second: 0,
    third: {
      one: false,
      two: [""],
    },
    fourth: ["anything"],
  })

  shape.setInput({
    third: {
      two: (two) => [...two, "hi"],
    },
  })
  expect(shape.getInput(scope)).toStrictEqual({
    first: "",
    second: 0,
    third: {
      one: false,
      two: ["", "hi"],
    },
    fourth: ["anything"],
  })

  shape.setInput({
    first: "1",
    second: 2,
    third: {
      one: true,
      two: ["two"],
    },
  })
  expect(shape.getInput(scope)).toStrictEqual({
    first: "1",
    second: 2,
    third: {
      one: true,
      two: ["two"],
    },
    fourth: ["anything"],
  })

  shape.setInput((root) => {
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
  expect(shape.getInput(scope)).toStrictEqual({
    first: "one",
    second: 3,
    third: {
      one: false,
      two: ["two", "three"],
    },
    fourth: ["anything"],
  })

  expectTypeOf(shape.getInput(scope)).toEqualTypeOf<{
    readonly first: string
    readonly second: number
    readonly third: {
      readonly one: boolean
      readonly two: Array<string>
    }
    readonly fourth: Array<string>
  }>()

  expect(shape.fields.third.getInput(scope)).toStrictEqual({
    one: false,
    two: ["two", "three"],
  })

  expectTypeOf(shape.fields.third.getInput(scope)).toEqualTypeOf<{
    readonly one: boolean
    readonly two: Array<string>
  }>()

  expectTypeOf(shape.setInput).parameter(0).toEqualTypeOf<
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

  expectTypeOf(shape.fields.third.setInput).parameter(0).toEqualTypeOf<
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
