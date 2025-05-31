import { z } from "zod"

import { ImpulseFormShape, ImpulseFormUnit } from "../../src"
import { arg } from "../common"

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
  expect(shape.getOutput(scope, arg(0))).toStrictEqual(value)
  expect(shape.getOutput(scope, arg(1))).toStrictEqual(value)

  shape.setInput({
    second: -1,
    third: {
      two: ["1", "12"],
    },
  })
  expect(shape.getOutput(scope)).toBeNull()
  expect(shape.getOutput(scope, arg(0))).toBeNull()
  expect(shape.getOutput(scope, arg(1))).toStrictEqual({
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
  expectTypeOf(shape.getOutput(scope, arg(0))).toEqualTypeOf<null | {
    readonly first: string
    readonly second: number
    readonly third: {
      readonly one: boolean
      readonly two: Array<string>
    }
    readonly fourth: Array<string>
  }>()
  expectTypeOf(shape.getOutput(scope, arg(1))).toEqualTypeOf<{
    readonly first: null | string
    readonly second: null | number
    readonly third: {
      readonly one: null | boolean
      readonly two: null | Array<string>
    }
    readonly fourth: Array<string>
  }>()
})
