import { ImpulseFormValue } from "../../src"

describe("ImpulseFormValueOptions.isInputDirty", () => {
  it("uses Object.is when not provided", ({ scope }) => {
    const value = ImpulseFormValue.of({ value: "value" })

    expect(value.isDirty(scope)).toBe(false)

    value.setInput({ value: "value" })
    expect(value.isDirty(scope)).toBe(true)
  })

  it("fallbacks to isInputEqual when not provided", ({ scope }) => {
    const value = ImpulseFormValue.of(
      { value: "value" },
      {
        isInputEqual: (left, right) => left.value === right.value,
      },
    )

    expect(value.isDirty(scope)).toBe(false)

    value.setInput({ value: "value" })
    expect(value.isDirty(scope)).toBe(false)
  })

  it("takes isInputDirty over isInputEqual", ({ scope }) => {
    const value = ImpulseFormValue.of(
      { value: "value" },
      {
        isInputEqual: (left, right) => left.value === right.value,
        isInputDirty: (left, right) => left.value.trim() !== right.value.trim(),
      },
    )

    expect(value.isDirty(scope)).toBe(false)

    value.setInput({ value: "value " })
    expect(value.isDirty(scope)).toBe(false)

    value.setInput({ value: "value 1" })
    expect(value.isDirty(scope)).toBe(true)
  })

  it("returns not dirty when isInputDirty returns false", ({ scope }) => {
    const value = ImpulseFormValue.of("", {
      isInputDirty: (left, right) => left.trim() !== right.trim(),
    })

    expect(value.isDirty(scope)).toBe(false)

    value.setInput(" ")
    expect(value.isDirty(scope)).toBe(false)
  })

  it("returns dirty when isInputDirty returns true", ({ scope }) => {
    const value = ImpulseFormValue.of("", {
      isInputDirty: (left, right) => left.trim() !== right.trim(),
    })

    expect(value.isDirty(scope)).toBe(false)

    value.setInput(" s")
    expect(value.isDirty(scope)).toBe(true)
  })
})
