import { FormUnit } from "../../src"

it("clean on init", ({ monitor }) => {
  const value = FormUnit("")

  expect(value.isDirty(monitor)).toBe(false)
})

it("dirty on init when initial is different", ({ monitor }) => {
  const value = FormUnit("", { initial: "1" })

  expect(value.isDirty(monitor)).toBe(true)
})

it("clean when original value equals to initial value", ({ monitor }) => {
  const value = FormUnit("", { initial: "1" })

  value.setInput("1")

  expect(value.isDirty(monitor)).toBe(false)
})

it("dirty when original value is different from initial value", ({ monitor }) => {
  const value = FormUnit("1")

  value.setInput("2")

  expect(value.isDirty(monitor)).toBe(true)
})

it("clean when complex value comparably equal to initial value", ({ monitor }) => {
  const value = FormUnit(
    { type: "zero", value: 0 },
    {
      initial: { type: "zero", value: 0 },
      isInputEqual: (left, right) => left.type === right.type && left.value === right.value,
    },
  )
  expect(value.isDirty(monitor)).toBe(false)

  value.setInput({ type: "one", value: 1 })
  expect(value.isDirty(monitor)).toBe(true)

  value.setInput({ type: "zero", value: 0 })
  expect(value.isDirty(monitor)).toBe(false)
})

it("dirty when complex value comparably unequal to initial value", ({ monitor }) => {
  const initial = { type: "zero", value: 0 }
  const value = FormUnit({ type: "zero", value: 0 }, { initial })
  expect(value.isDirty(monitor)).toBe(true)

  value.setInput({ type: "one", value: 1 })
  expect(value.isDirty(monitor)).toBe(true)

  value.setInput({ type: "zero", value: 0 })
  expect(value.isDirty(monitor)).toBe(true)

  value.setInput(initial)
  expect(value.isDirty(monitor)).toBe(false)
})
