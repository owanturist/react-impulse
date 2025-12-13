import { FormShape, FormUnit } from "../../src"

it("selects input", ({ monitor }) => {
  const shape = FormShape({
    first: FormUnit("1"),
    second: FormUnit(0),
    third: FormShape({
      one: FormUnit(true),
      two: FormUnit(["1"]),
    }),
    fourth: ["anything"],
  })

  const input0 = shape.getInput(monitor)
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
  expectTypeOf(shape.fields.third.getInput(monitor)).toEqualTypeOf<{
    readonly one: boolean
    readonly two: Array<string>
  }>()

  shape.setInput({
    first: "12",
  })
  const input1 = shape.getInput(monitor)
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
  const input2 = shape.getInput(monitor)
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

it("subsequently selects equal input shapes", ({ monitor }) => {
  const shape = FormShape({
    first: FormUnit("1"),
    second: FormUnit(2),
  })

  expect(shape.getInput(monitor)).toStrictEqual({
    first: "1",
    second: 2,
  })
  expect(shape.getInput(monitor)).toBe(shape.getInput(monitor))
})

it("persists unchanged input fields between changes", ({ monitor }) => {
  const shape = FormShape({
    first: FormShape({
      _1: FormUnit("1"),
      _2: FormUnit("2"),
    }),
    second: FormShape({
      _3: FormUnit("3"),
      _4: FormUnit("4"),
    }),
  })

  const input0 = shape.getInput(monitor)
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

  const input1 = shape.getInput(monitor)
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
