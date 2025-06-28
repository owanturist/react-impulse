import { z } from "zod"

import { params } from "~/tools/params"

import { ImpulseFormShape, ImpulseFormUnit } from "../../src"

it("selects value", ({ scope }) => {
  const shape = ImpulseFormShape(
    {
      first: ImpulseFormUnit(""),
      second: ImpulseFormUnit(0, { schema: z.number().nonnegative() }),
      third: ImpulseFormShape({
        one: ImpulseFormUnit(true),
        two: ImpulseFormUnit(["1"], {
          schema: z.array(z.string().max(1)),
        }),
      }),
      fourth: ["anything"],
    },
    {
      validateOn: "onInit",
    },
  )

  const value = shape.getOutput(scope)
  expect(value).toStrictEqual({
    first: "",
    second: 0,
    third: {
      one: true,
      two: ["1"],
    },
    fourth: ["anything"],
  })
  expect(shape.getOutput(scope, params._first)).toStrictEqual(value)
  expect(shape.getOutput(scope, params._second)).toStrictEqual(value)

  shape.setInput({
    second: -1,
    third: {
      two: ["1", "12"],
    },
  })
  expect(shape.getOutput(scope)).toBeNull()
  expect(shape.getOutput(scope, params._first)).toBeNull()
  expect(shape.getOutput(scope, params._second)).toStrictEqual({
    first: "",
    second: null,
    third: {
      one: true,
      two: null,
    },
    fourth: ["anything"],
  })

  expectTypeOf(shape.getOutput(scope)).toEqualTypeOf<null | {
    readonly first: string
    readonly second: number
    readonly third: {
      readonly one: boolean
      readonly two: Array<string>
    }
    readonly fourth: Array<string>
  }>()
  expectTypeOf(shape.getOutput(scope, params._first)).toEqualTypeOf<null | {
    readonly first: string
    readonly second: number
    readonly third: {
      readonly one: boolean
      readonly two: Array<string>
    }
    readonly fourth: Array<string>
  }>()
  expectTypeOf(shape.getOutput(scope, params._second)).toEqualTypeOf<{
    readonly first: null | string
    readonly second: null | number
    readonly third: {
      readonly one: null | boolean
      readonly two: null | Array<string>
    }
    readonly fourth: Array<string>
  }>()
})

console.log(
  "TODO continue from here by adding the same tests as in get-error.spec.ts for get-output.spec.ts",
)
