import { z } from "zod"

import { ImpulseFormUnit, type ImpulseFormUnitSchemaOptions } from "../../src"

function setup(
  input?: string,
  options?: Partial<ImpulseFormUnitSchemaOptions<string>>,
) {
  return ImpulseFormUnit(input ?? "", {
    touched: true,
    schema: z.string().min(2),
    ...options,
  })
}

it("matches the type signature", () => {
  const form = setup()

  expectTypeOf(form.focusFirstInvalid).toEqualTypeOf<VoidFunction>()
})

describe("focusFirstInvalid() when validated", () => {
  it("nothing happens if a listener is not attached", () => {
    const form = setup()
    const spy = vi.spyOn(form, "focusFirstInvalid")

    expect(() => {
      form.focusFirstInvalid()
    }).not.toThrow()

    expect(spy).toHaveBeenCalledOnce()
  })

  it("does not call a listener on subscribe", () => {
    const form = setup()
    const listener = vi.fn()

    form.onFocusWhenInvalid(listener)

    expect(listener).not.toHaveBeenCalled()
  })

  it("calls a listener function", () => {
    const form = setup()
    const listener = vi.fn()

    form.onFocusWhenInvalid(listener)

    form.focusFirstInvalid()
    expect(listener).toHaveBeenCalledOnce()
  })

  it("calls a listener function with a validation error", () => {
    const form = setup()
    const listener = vi.fn()

    form.onFocusWhenInvalid(listener)

    form.focusFirstInvalid()
    expect(listener).toHaveBeenCalledExactlyOnceWith([
      "String must contain at least 2 character(s)",
    ])
  })

  it("calls a listener with a custom error", () => {
    const form = setup("", { error: ["Custom error"] })
    const listener = vi.fn()

    form.onFocusWhenInvalid(listener)

    form.focusFirstInvalid()
    expect(listener).toHaveBeenCalledExactlyOnceWith(["Custom error"])
  })

  it("calls all listeners", () => {
    const form = setup()
    const listener_1 = vi.fn()
    const listener_2 = vi.fn()

    form.onFocusWhenInvalid(listener_1)
    form.onFocusWhenInvalid(listener_2)

    form.focusFirstInvalid()
    expect(listener_1).toHaveBeenCalledOnce()
    expect(listener_2).toHaveBeenCalledOnce()
  })

  it("calls a listener per each focusFirstInvalid()", () => {
    const form = setup()
    const listener = vi.fn()

    form.onFocusWhenInvalid(listener)

    form.focusFirstInvalid()
    form.focusFirstInvalid()
    form.focusFirstInvalid()
    expect(listener).toHaveBeenCalledTimes(3)
  })

  it("does not call a listener after it is unsubscribed", () => {
    const form = setup()
    const listener = vi.fn()

    const unsubscribe = form.onFocusWhenInvalid(listener)

    form.focusFirstInvalid()
    expect(listener).toHaveBeenCalledTimes(1)
    listener.mockClear()

    unsubscribe()
    form.focusFirstInvalid()
    expect(listener).not.toHaveBeenCalled()
  })

  it("subscribes the same listener only once", () => {
    const form = setup()
    const listener = vi.fn()

    form.onFocusWhenInvalid(listener)
    form.onFocusWhenInvalid(listener)

    form.focusFirstInvalid()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("unsubscribes the same listener as many times as it's been subscribed", () => {
    const form = setup()
    const listener = vi.fn()

    const unsubscribe_1 = form.onFocusWhenInvalid(listener)
    const unsubscribe_2 = form.onFocusWhenInvalid(listener)
    const unsubscribe_3 = form.onFocusWhenInvalid(listener)

    form.focusFirstInvalid()
    expect(listener).toHaveBeenCalled()
    listener.mockClear()

    unsubscribe_1()
    form.focusFirstInvalid()
    expect(listener).toHaveBeenCalled()
    listener.mockClear()

    unsubscribe_2()
    form.focusFirstInvalid()
    expect(listener).toHaveBeenCalled()
    listener.mockClear()

    unsubscribe_3()
    form.focusFirstInvalid()
    expect(listener).not.toHaveBeenCalled()
  })
})

describe("focusFirstInvalid() when not validated", () => {
  it("does not call a listener", () => {
    const form = setup("", { touched: false })
    const listener = vi.fn()

    form.onFocusWhenInvalid(listener)
    form.focusFirstInvalid()

    expect(listener).not.toHaveBeenCalled()
  })
})

describe("focusFirstInvalid() when valid", () => {
  it("does not call a listener", () => {
    const form = setup("123")
    const listener = vi.fn()

    form.onFocusWhenInvalid(listener)
    form.focusFirstInvalid()

    expect(listener).not.toHaveBeenCalled()
  })
})
