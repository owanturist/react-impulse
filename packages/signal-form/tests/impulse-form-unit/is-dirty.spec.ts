import { ImpulseFormUnit } from "../../src"

it("clean on init", ({ scope }) => {
  const value = ImpulseFormUnit("")

  expect(value.isDirty(scope)).toBe(false)
})

it("dirty on init when initial is different", ({ scope }) => {
  const value = ImpulseFormUnit("", { initial: "1" })

  expect(value.isDirty(scope)).toBe(true)
})

it("clean when original value equals to initial value", ({ scope }) => {
  const value = ImpulseFormUnit("", { initial: "1" })

  value.setInput("1")

  expect(value.isDirty(scope)).toBe(false)
})

it("dirty when original value is different from initial value", ({ scope }) => {
  const value = ImpulseFormUnit("1")

  value.setInput("2")

  expect(value.isDirty(scope)).toBe(true)
})

it("clean when complex value comparably equal to initial value", ({ scope }) => {
  const value = ImpulseFormUnit(
    { type: "zero", value: 0 },
    {
      initial: { type: "zero", value: 0 },
      isInputEqual: (left, right) => left.type === right.type && left.value === right.value,
    },
  )
  expect(value.isDirty(scope)).toBe(false)

  value.setInput({ type: "one", value: 1 })
  expect(value.isDirty(scope)).toBe(true)

  value.setInput({ type: "zero", value: 0 })
  expect(value.isDirty(scope)).toBe(false)
})

it("dirty when complex value comparably unequal to initial value", ({ scope }) => {
  const initial = { type: "zero", value: 0 }
  const value = ImpulseFormUnit({ type: "zero", value: 0 }, { initial })
  expect(value.isDirty(scope)).toBe(true)

  value.setInput({ type: "one", value: 1 })
  expect(value.isDirty(scope)).toBe(true)

  value.setInput({ type: "zero", value: 0 })
  expect(value.isDirty(scope)).toBe(true)

  value.setInput(initial)
  expect(value.isDirty(scope)).toBe(false)
})
