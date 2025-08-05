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

it("subsequently selects equal output shapes", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit("1"),
    second: ImpulseFormUnit(2),
  })

  expect(shape.getOutput(scope)).toStrictEqual({
    first: "1",
    second: 2,
  })
  expect(shape.getOutput(scope)).toBe(shape.getOutput(scope))
  expect(shape.getOutput(scope)).toBe(shape.getOutput(scope))
  expect(shape.getOutput(scope, params._first)).toBe(
    shape.getOutput(scope, params._first),
  )
  expect(shape.getOutput(scope, params._second)).toBe(
    shape.getOutput(scope, params._second),
  )
})

it("persists unchanged output fields between changes", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormShape({
      _0: ImpulseFormUnit("1"),
      _1: ImpulseFormUnit("2"),
    }),
    second: ImpulseFormShape({
      _3: ImpulseFormUnit("3"),
      _4: ImpulseFormUnit("4"),
    }),
  })

  const output_0 = shape.getOutput(scope)

  expect(output_0).toStrictEqual({
    first: {
      _0: "1",
      _1: "2",
    },
    second: {
      _3: "3",
      _4: "4",
    },
  })

  shape.setInput({
    second: {
      _3: "third changed",
    },
  })

  const output_1 = shape.getOutput(scope)

  expect(output_1).toStrictEqual({
    first: {
      _0: "1",
      _1: "2",
    },
    second: {
      _3: "third changed",
      _4: "4",
    },
  })
  expect(output_1).not.toBe(output_0)
  expect(output_1?.first).toBe(output_0?.first)
  expect(output_1?.second).not.toBe(output_0?.second)
})
