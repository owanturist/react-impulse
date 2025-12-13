import { params } from "~/tools/params"
import type { Setter } from "~/tools/setter"

import { FormShape, FormUnit } from "../../src"

it("specifies error", ({ monitor }) => {
  const shape = FormShape({
    first: FormUnit("", { error: ["first"] }),
    second: FormUnit(0, { error: ["second"] }),
    third: FormShape(
      {
        one: FormUnit(true, {
          validate: (input) => (input ? [null, input] : ["must be true", null]),
        }),
        two: FormUnit([""], { error: "an error" }),
      },
      {
        error: {
          one: "one",
          two: "two",
        },
      },
    ),
    fourth: ["anything"],
  })

  expect(shape.getError(monitor)).toStrictEqual({
    first: ["first"],
    second: ["second"],
    third: {
      one: "one",
      two: "two",
    },
  })

  shape.setError({
    first: ["another"],
    second: undefined,
    third: null,
  })
  expect(shape.getError(monitor)).toStrictEqual({
    first: ["another"],
    second: ["second"],
    third: null,
  })
  expect(shape.getError(monitor, params._second)).toStrictEqual({
    first: ["another"],
    second: ["second"],
    third: {
      one: null,
      two: null,
    },
  })

  shape.setError({
    third: {
      one: "one",
      two: "two",
    },
  })
  shape.setError((root) => {
    expectTypeOf(root).toEqualTypeOf<{
      readonly first: null | Array<string>
      readonly second: null | Array<string>
      readonly third: {
        readonly one: null | string
        readonly two: null | string
      }
    }>()
    expect(root).toStrictEqual({
      first: ["another"],
      second: ["second"],
      third: {
        one: "one",
        two: "two",
      },
    })

    return {
      first: (first) => {
        expectTypeOf(first).toEqualTypeOf<null | Array<string>>()
        expect(first).toStrictEqual(["another"])

        return [...first!, "1"]
      },
      second: (second) => {
        expectTypeOf(second).toEqualTypeOf<null | Array<string>>()
        expect(second).toStrictEqual(["second"])

        return [...second!, "2"]
      },
      third: (third) => {
        expectTypeOf(third).toEqualTypeOf<{
          readonly one: null | string
          readonly two: null | string
        }>()
        expect(third).toStrictEqual({
          one: "one",
          two: "two",
        })

        return {
          one: (one) => {
            expectTypeOf(one).toEqualTypeOf<null | string>()
            expect(one).toStrictEqual("one")

            return "1"
          },

          two: (two) => {
            expectTypeOf(two).toEqualTypeOf<null | string>()
            expect(two).toStrictEqual("two")

            return "2"
          },
        }
      },
    }
  })

  expect(shape.getError(monitor)).toStrictEqual({
    first: ["another", "1"],
    second: ["second", "2"],
    third: {
      one: "1",
      two: "2",
    },
  })

  expectTypeOf(shape.setError).parameter(0).toEqualTypeOf<
    Setter<
      null | {
        readonly first?: Setter<null | Array<string>>
        readonly second?: Setter<null | Array<string>>
        readonly third?: Setter<
          null | {
            readonly one?: Setter<null | string>
            readonly two?: Setter<null | string>
          },
          [
            {
              readonly one: null | string
              readonly two: null | string
            },
          ]
        >
      },
      [
        {
          readonly first: null | Array<string>
          readonly second: null | Array<string>
          readonly third: {
            readonly one: null | string
            readonly two: null | string
          }
        },
      ]
    >
  >()

  expectTypeOf(shape.fields.third.setError).parameter(0).toEqualTypeOf<
    Setter<
      null | {
        readonly one?: Setter<null | string>
        readonly two?: Setter<null | string>
      },
      [
        {
          readonly one: null | string
          readonly two: null | string
        },
      ]
    >
  >()
})

it("resets all errors", ({ monitor }) => {
  const shape = FormShape({
    first: FormUnit("", { error: ["first"] }),
    second: FormUnit(0, { error: ["second"] }),
    third: FormShape(
      {
        one: FormUnit(true, {
          validate: (input) => (input ? [null, input] : [1, null]),
        }),
        two: FormUnit([""], { error: "an error" }),
      },
      {
        error: {
          one: 0,
          two: "initial error",
        },
      },
    ),
    fourth: ["anything"],
  })

  shape.setError(null)
  expect(shape.getError(monitor)).toBeNull()
})
