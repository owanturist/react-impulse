import { ImpulseFormShape, ImpulseFormUnit } from "../../src"

it("selects input", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit("1"),
    second: ImpulseFormUnit(0),
    third: ImpulseFormShape({
      one: ImpulseFormUnit(true),
      two: ImpulseFormUnit(["1"]),
    }),
    fourth: ["anything"],
  })

  const input_0 = shape.getInput(scope)
  expect(input_0).toStrictEqual({
    first: "1",
    second: 0,
    third: {
      one: true,
      two: ["1"],
    },
    fourth: ["anything"],
  })

  expectTypeOf(input_0).toEqualTypeOf<{
    readonly first: string
    readonly second: number
    readonly third: {
      readonly one: boolean
      readonly two: Array<string>
    }
    readonly fourth: Array<string>
  }>()
  expectTypeOf(shape.fields.third.getInput(scope)).toEqualTypeOf<{
    readonly one: boolean
    readonly two: Array<string>
  }>()

  shape.setInput({
    first: "12",
  })
  const input_1 = shape.getInput(scope)
  expect(input_1).toStrictEqual({
    first: "12",
    second: 0,
    third: {
      one: true,
      two: ["1"],
    },
    fourth: ["anything"],
  })

  shape.setInput({
    third: {
      two: ["1", "12"],
    },
  })
  const input_2 = shape.getInput(scope)
  expect(input_2).toStrictEqual({
    first: "12",
    second: 0,
    third: {
      one: true,
      two: ["1", "12"],
    },
    fourth: ["anything"],
  })
})

it("subsequently selects equal input shapes", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormUnit("1"),
    second: ImpulseFormUnit(2),
  })

  expect(shape.getInput(scope)).toStrictEqual({
    first: "1",
    second: 2,
  })
  expect(shape.getInput(scope)).toBe(shape.getInput(scope))
})

it("persists unchanged input fields between changes", ({ scope }) => {
  const shape = ImpulseFormShape({
    first: ImpulseFormShape({
      _1: ImpulseFormUnit("1"),
      _2: ImpulseFormUnit("2"),
    }),
    second: ImpulseFormShape({
      _3: ImpulseFormUnit("3"),
      _4: ImpulseFormUnit("4"),
    }),
  })

  const input_0 = shape.getInput(scope)
  expect(input_0).toStrictEqual({
    first: {
      _1: "1",
      _2: "2",
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

  const input_1 = shape.getInput(scope)
  expect(input_1).toStrictEqual({
    first: {
      _1: "1",
      _2: "2",
    },
    second: {
      _3: "third changed",
      _4: "4",
    },
  })
  expect(input_1).not.toBe(input_0)
  expect(input_1.first).toBe(input_0.first)
  expect(input_1.second).not.toBe(input_0.second)
})
