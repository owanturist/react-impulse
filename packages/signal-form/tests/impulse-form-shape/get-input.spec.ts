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

  const input0 = shape.getInput(scope)
  expect(input0).toStrictEqual({
    first: "1",
    second: 0,
    third: {
      one: true,
      two: ["1"],
    },
    fourth: ["anything"],
  })

  expectTypeOf(input0).toEqualTypeOf<{
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
  const input1 = shape.getInput(scope)
  expect(input1).toStrictEqual({
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
  const input2 = shape.getInput(scope)
  expect(input2).toStrictEqual({
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

  const input0 = shape.getInput(scope)
  expect(input0).toStrictEqual({
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

  const input1 = shape.getInput(scope)
  expect(input1).toStrictEqual({
    first: {
      _1: "1",
      _2: "2",
    },
    second: {
      _3: "third changed",
      _4: "4",
    },
  })
  expect(input1).not.toBe(input0)
  expect(input1.first).toBe(input0.first)
  expect(input1.second).not.toBe(input0.second)
})
