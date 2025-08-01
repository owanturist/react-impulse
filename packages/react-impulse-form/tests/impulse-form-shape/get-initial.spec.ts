import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"

import { ImpulseFormShape, ImpulseFormUnit } from "../../src"

it("selects initial", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit("1", { initial: "2" }),
    second: ImpulseFormUnit(0),
    third: ImpulseFormShape({
      one: ImpulseFormUnit(true, { initial: false }),
      two: ImpulseFormUnit(["1"]),
    }),
    fourth: ["anything"],
  })

  const initial_0 = shape.getInitial(scope)
  expect(initial_0).toStrictEqual({
    first: "2",
    second: 0,
    third: {
      one: false,
      two: ["1"],
    },
    fourth: ["anything"],
  })

  expectTypeOf(initial_0).toEqualTypeOf<{
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

  shape.setInitial({
    first: "12",
  })

  const initial_1 = shape.getInitial(scope)
  expect(initial_1).toStrictEqual({
    first: "12",
    second: 0,
    third: {
      one: false,
      two: ["1"],
    },
    fourth: ["anything"],
  })

  shape.setInitial({
    third: {
      two: ["1", "12"],
    },
  })
  const initial_2 = shape.getInitial(scope)
  expect(initial_2).toStrictEqual({
    first: "12",
    second: 0,
    third: {
      one: false,
      two: ["1", "12"],
    },
    fourth: ["anything"],
  })
})

it("subsequently selects equal initial shapes", ({ scope }) => {
  const shape = ImpulseFormShape(
    {
      first: ImpulseFormUnit("1"),
      second: ImpulseFormUnit(2),
    },
    {
      initial: {
        first: "2",
        second: 3,
      },
    },
  )

  expect(shape.getInitial(scope)).toStrictEqual({
    first: "2",
    second: 3,
  })
  expect(shape.getInitial(scope)).toBe(shape.getInitial(scope))
  expect(shape.getInitial(scope)).toBe(shape.getInitial(scope))
})

it("persists unchanged initial fields between changes", ({ scope }) => {
  const shape = ImpulseFormShape(
    {
      first: ImpulseFormShape({
        _1: ImpulseFormUnit("1", { initial: "1_0" }),
        _2: ImpulseFormUnit("2"),
      }),
      second: ImpulseFormShape({
        _3: ImpulseFormUnit("3"),
        _4: ImpulseFormUnit("4"),
      }),
    },
    {
      initial: {
        first: {
          _1: "1_1",
        },
        second: {
          _3: "3_1",
        },
      },
    },
  )

  const initial_0 = shape.getInitial(scope)
  expect(initial_0).toStrictEqual({
    first: {
      _1: "1_1",
      _2: "2",
    },
    second: {
      _3: "3_1",
      _4: "4",
    },
  })

  shape.setInitial({
    second: {
      _3: "third changed",
    },
  })

  const initial_1 = shape.getInitial(scope)
  expect(initial_1).toStrictEqual({
    first: {
      _1: "1_1",
      _2: "2",
    },
    second: {
      _3: "third changed",
      _4: "4",
    },
  })
  expect(initial_1).not.toBe(initial_0)
  expect(initial_1.first).toBe(initial_0.first)
  expect(initial_1.second).not.toBe(initial_0.second)
})

it("selects unequal initial values when isInputEqual is not specified", ({
  scope,
}) => {
  const shape = ImpulseFormShape({
    field: ImpulseFormUnit([0]),
  })

  const initial_0 = shape.getInitial(scope)

  shape.setInitial({
    field: [0],
  })
  const initial_1 = shape.getInitial(scope)

  expect(initial_0).not.toBe(initial_1)
  expect(initial_0).toStrictEqual(initial_1)
})

it("selects equal initial values when isInputEqual is specified", ({
  scope,
}) => {
  const shape = ImpulseFormShape({
    field: ImpulseFormUnit([0], {
      isInputEqual: isShallowArrayEqual,
    }),
  })

  const initial_0 = shape.getInitial(scope)

  shape.setInitial({
    field: [0],
  })
  const initial_1 = shape.getInitial(scope)

  expect(initial_0).toBe(initial_1)
  expect(initial_0).toStrictEqual(initial_1)
})
