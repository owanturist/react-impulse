import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"

import { ImpulseFormShape, ImpulseFormUnit } from "../../src"

it("selects initial", ({ monitor }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit("1", { initial: "2" }),
    second: ImpulseFormUnit(0),
    third: ImpulseFormShape({
      one: ImpulseFormUnit(true, { initial: false }),
      two: ImpulseFormUnit(["1"]),
    }),
    fourth: ["anything"],
  })

  const initial0 = shape.getInitial(monitor)
  expect(initial0).toStrictEqual({
    first: "2",
    second: 0,
    third: {
      one: false,
      two: ["1"],
    },
    fourth: ["anything"],
  })

  expectTypeOf(initial0).toEqualTypeOf<{
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

  shape.setInitial({
    first: "12",
  })

  const initial1 = shape.getInitial(monitor)
  expect(initial1).toStrictEqual({
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
  const initial2 = shape.getInitial(monitor)
  expect(initial2).toStrictEqual({
    first: "12",
    second: 0,
    third: {
      one: false,
      two: ["1", "12"],
    },
    fourth: ["anything"],
  })
})

it("subsequently selects equal initial shapes", ({ monitor }) => {
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

  expect(shape.getInitial(monitor)).toStrictEqual({
    first: "2",
    second: 3,
  })
  expect(shape.getInitial(monitor)).toBe(shape.getInitial(monitor))
  expect(shape.getInitial(monitor)).toBe(shape.getInitial(monitor))
})

it("persists unchanged initial fields between changes", ({ monitor }) => {
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

  const initial0 = shape.getInitial(monitor)
  expect(initial0).toStrictEqual({
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

  const initial1 = shape.getInitial(monitor)
  expect(initial1).toStrictEqual({
    first: {
      _1: "1_1",
      _2: "2",
    },
    second: {
      _3: "third changed",
      _4: "4",
    },
  })
  expect(initial1).not.toBe(initial0)
  expect(initial1.first).toBe(initial0.first)
  expect(initial1.second).not.toBe(initial0.second)
})

it("selects unequal initial values when isInputEqual is not specified", ({ monitor }) => {
  const shape = ImpulseFormShape({
    field: ImpulseFormUnit([0]),
  })

  const initial0 = shape.getInitial(monitor)

  shape.setInitial({
    field: [0],
  })
  const initial1 = shape.getInitial(monitor)

  expect(initial0).not.toBe(initial1)
  expect(initial0).toStrictEqual(initial1)
})

it("selects equal initial values when isInputEqual is specified", ({ monitor }) => {
  const shape = ImpulseFormShape({
    field: ImpulseFormUnit([0], {
      isInputEqual: isShallowArrayEqual,
    }),
  })

  const initial0 = shape.getInitial(monitor)

  shape.setInitial({
    field: [0],
  })
  const initial1 = shape.getInitial(monitor)

  expect(initial0).toBe(initial1)
  expect(initial0).toStrictEqual(initial1)
})
