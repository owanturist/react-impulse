import { params } from "~/tools/params"

import { type ImpulseForm, ImpulseFormShape, ImpulseFormUnit } from "../../src"

function setup() {
  return ImpulseFormShape(
    {
      first: ImpulseFormUnit(""),
      second: ImpulseFormUnit(0),
      third: ImpulseFormShape({
        one: ImpulseFormUnit(true),
        two: ImpulseFormUnit([""]),
      }),
      fourth: ["anything"],
    },
    {
      initial: {
        first: "1",
        second: 2,
        third: {
          one: false,
          two: ["two"],
        },
      },
    },
  )
}

describe.each([
  ["without arguments", (form: ImpulseForm) => form.reset()],
  ["with resetter=params._first", (form: ImpulseForm) => form.reset(params._first)],
])("%s", (_, reset) => {
  it("resets the shape", ({ monitor }) => {
    const shape = setup()

    reset(shape)
    const input = shape.getInput(monitor)
    expect(input).toStrictEqual({
      first: "1",
      second: 2,
      third: {
        one: false,
        two: ["two"],
      },
      fourth: ["anything"],
    })
    expect(shape.getInitial(monitor)).toStrictEqual(input)
    expect(shape.isDirty(monitor)).toBe(false)
  })
})

it("resets to initial value by consuming current original value with resetter", ({ monitor }) => {
  const shape = setup()

  shape.reset((_, current) => current)
  const input = shape.getInput(monitor)
  expect(input).toStrictEqual({
    first: "",
    second: 0,
    third: {
      one: true,
      two: [""],
    },
    fourth: ["anything"],
  })
  expect(shape.getInitial(monitor)).toStrictEqual(input)
  expect(shape.isDirty(monitor)).toBe(false)
})

it("resets to new initial value", ({ monitor }) => {
  const shape = setup()

  shape.reset({
    first: "3",
    third: {
      one: true,
      two: undefined,
    },
  })
  const input = shape.getInput(monitor)
  expect(input).toStrictEqual({
    first: "3",
    second: 2,
    third: {
      one: true,
      two: ["two"],
    },
    fourth: ["anything"],
  })
  expect(shape.getInitial(monitor)).toStrictEqual(input)
  expect(shape.isDirty(monitor)).toBe(false)
})

it("resets with callback on each field", ({ monitor }) => {
  const shape = setup()

  shape.reset((initial, current) => {
    expect(initial).toStrictEqual({
      first: "1",
      second: 2,
      third: {
        one: false,
        two: ["two"],
      },
      fourth: ["anything"],
    })
    expect(current).toStrictEqual({
      first: "",
      second: 0,
      third: {
        one: true,
        two: [""],
      },
      fourth: ["anything"],
    })

    return {
      first: (x, y) => {
        expect(x).toBe("1")
        expect(y).toBe("")

        return "3"
      },
      second: (x, y) => {
        expect(x).toBe(2)
        expect(y).toBe(0)

        return 4
      },
      third: (x, y) => {
        expect(x).toStrictEqual({
          one: false,
          two: ["two"],
        })
        expect(y).toStrictEqual({
          one: true,
          two: [""],
        })

        return {
          one: (a, b) => {
            expect(a).toBe(false)
            expect(b).toBe(true)

            return true
          },
          two: (a, b) => {
            expect(a).toStrictEqual(["two"])
            expect(b).toStrictEqual([""])

            return ["three"]
          },
        }
      },
    }
  })

  const input = shape.getInput(monitor)
  expect(input).toStrictEqual({
    first: "3",
    second: 4,
    third: {
      one: true,
      two: ["three"],
    },
    fourth: ["anything"],
  })
  expect(shape.getInitial(monitor)).toStrictEqual(input)
  expect(shape.isDirty(monitor)).toBe(false)
})
