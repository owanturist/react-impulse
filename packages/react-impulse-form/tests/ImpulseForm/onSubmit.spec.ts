import { z } from "zod"

import { ImpulseFormValue } from "../../src"
import { wait } from "../common"

beforeAll(() => {
  vi.useFakeTimers()
})

describe("onSubmit(listener)", () => {
  it("does not call the listener when the form is not valid", ({ scope }) => {
    const form = ImpulseFormValue.of("value", {
      schema: z.string().min(10),
    })

    const listener = vi.fn()

    form.onSubmit(listener)

    void form.submit()

    expect(form.isInvalid(scope)).toBe(true)
    expect(listener).not.toHaveBeenCalled()
  })

  it("calls the focus listener when the form is not valid", () => {
    const form = ImpulseFormValue.of("value", {
      schema: z.string().min(10),
    })

    const focus = vi.fn()

    form.onFocusWhenInvalid(focus)

    expect(focus).not.toHaveBeenCalled()

    void form.submit()

    expect(focus).toHaveBeenCalledTimes(1)
    expect(focus).toHaveBeenLastCalledWith([
      "String must contain at least 10 character(s)",
    ])
  })

  it.each([
    ["schema is not defined", "value", () => ImpulseFormValue.of("value")],
    [
      "schema is defined and value is valid",
      1234,
      () => {
        return ImpulseFormValue.of("1234", {
          schema: z.string().pipe(z.coerce.number()),
        })
      },
    ],
  ])("passes the form value to the listener when %s", (_, value, setup) => {
    const form = setup()

    const listener = vi.fn()

    form.onSubmit(listener)

    expect(listener).not.toHaveBeenCalled()

    void form.submit()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenLastCalledWith(value)
  })

  it("calls all listeners", () => {
    const form = ImpulseFormValue.of("value")

    const listener_1 = vi.fn()
    const listener_2 = vi.fn()

    form.onSubmit(listener_1)
    form.onSubmit(listener_2)

    void form.submit()

    expect(listener_1).toHaveBeenCalledTimes(1)
    expect(listener_2).toHaveBeenCalledTimes(1)
  })

  it("subscribes the same listener only once", () => {
    const form = ImpulseFormValue.of("value")

    const listener = vi.fn()

    form.onSubmit(listener)
    form.onSubmit(listener)

    void form.submit()

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("calls a listener on every submit", () => {
    const form = ImpulseFormValue.of("value")

    const listener = vi.fn()

    form.onSubmit(listener)

    void form.submit()
    void form.submit()
    void form.submit()

    expect(listener).toHaveBeenCalledTimes(3)
  })

  it("does not call a listener after it is unsubscribed", () => {
    const form = ImpulseFormValue.of("value")

    const listener = vi.fn()

    const unsubscribe = form.onSubmit(listener)

    void form.submit()

    expect(listener).toHaveBeenCalledTimes(1)
    listener.mockClear()

    unsubscribe()

    void form.submit()

    expect(listener).not.toHaveBeenCalled()
  })

  it('unsubscribes the same listener as many times as it"s been subscribed', () => {
    const form = ImpulseFormValue.of("value")

    const listener = vi.fn()

    const unsubscribe_1 = form.onSubmit(listener)
    const unsubscribe_2 = form.onSubmit(listener)
    const unsubscribe_3 = form.onSubmit(listener)

    void form.submit()
    expect(listener).toHaveBeenCalled()
    listener.mockClear()
    unsubscribe_1()

    void form.submit()
    expect(listener).toHaveBeenCalled()
    listener.mockClear()
    unsubscribe_2()

    void form.submit()
    expect(listener).toHaveBeenCalled()
    listener.mockClear()
    unsubscribe_3()

    void form.submit()
    expect(listener).not.toHaveBeenCalled()
  })

  it("waits the slowest listener", async ({ scope }) => {
    const form = ImpulseFormValue.of("value")

    const done_1 = vi.fn()
    const done_2 = vi.fn()
    const done_3 = vi.fn()
    const all_done = vi.fn()

    form.onSubmit(() => wait(1000).then(done_1))
    form.onSubmit(() => wait(2000).then(done_2))
    form.onSubmit(() => wait(3000).then(done_3))

    void form.submit().then(all_done)

    await vi.advanceTimersByTimeAsync(1000)
    expect(done_1).toHaveBeenCalledOnce()
    expect(done_2).not.toHaveBeenCalled()
    expect(done_3).not.toHaveBeenCalled()
    expect(all_done).not.toHaveBeenCalled()
    expect(form.isSubmitting(scope)).toBe(true)

    await vi.advanceTimersByTimeAsync(1000)
    expect(done_1).toHaveBeenCalledOnce()
    expect(done_2).toHaveBeenCalledOnce()
    expect(done_3).not.toHaveBeenCalled()
    expect(all_done).not.toHaveBeenCalled()
    expect(form.isSubmitting(scope)).toBe(true)

    await vi.advanceTimersByTimeAsync(1000)
    expect(done_1).toHaveBeenCalledOnce()
    expect(done_2).toHaveBeenCalledOnce()
    expect(done_3).toHaveBeenCalledOnce()
    expect(all_done).toHaveBeenCalledOnce()
    expect(form.isSubmitting(scope)).toBe(false)
  })
})
