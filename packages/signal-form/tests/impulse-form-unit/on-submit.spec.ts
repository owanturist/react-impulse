import { z } from "zod"

import { ImpulseFormUnit } from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 3000

beforeAll(() => {
  vi.useFakeTimers()
})

it("matches the type signature", () => {
  const form = ImpulseFormUnit("value")

  expectTypeOf(form.onSubmit).toEqualTypeOf<
    (listener: (value: string) => void | Promise<unknown>) => VoidFunction
  >()
})

describe("onSubmit(listener)", () => {
  it("provides validated value", () => {
    const form = ImpulseFormUnit("value", {
      schema: z.string().min(2),
    })

    form.onSubmit((value) => {
      expectTypeOf(value).toEqualTypeOf<string>()
    })
  })

  it("does not call the listener when the form is not valid", ({ monitor }) => {
    const form = ImpulseFormUnit("value", {
      schema: z.string().min(10),
    })

    const listener = vi.fn()

    form.onSubmit(listener)

    form.submit()

    expect(form.isInvalid(monitor)).toBe(true)
    expect(listener).not.toHaveBeenCalled()
  })

  it("calls the focus listener when the form is not valid", () => {
    const form = ImpulseFormUnit("value", {
      schema: z.string().min(10),
    })

    const focus = vi.fn()

    form.onFocusWhenInvalid(focus)

    expect(focus).not.toHaveBeenCalled()

    form.submit()

    expect(focus).toHaveBeenCalledExactlyOnceWith([expect.any(String)])
  })

  it.each([
    ["schema is not defined", "value", () => ImpulseFormUnit("value")],
    [
      "schema is defined and value is valid",
      1234,
      () =>
        ImpulseFormUnit("1234", {
          schema: z.string().pipe(z.coerce.number()),
        }),
    ],
  ])("passes the form value to the listener when %s", (_, value, setup) => {
    const form = setup()

    const listener = vi.fn()

    form.onSubmit(listener)

    expect(listener).not.toHaveBeenCalled()

    form.submit()

    expect(listener).toHaveBeenCalledExactlyOnceWith(value)
  })

  it("calls all listeners", () => {
    const form = ImpulseFormUnit("value")

    const listener1 = vi.fn()
    const listener2 = vi.fn()

    form.onSubmit(listener1)
    form.onSubmit(listener2)

    form.submit()

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
  })

  it("subscribes the same listener only once", () => {
    const form = ImpulseFormUnit("value")

    const listener = vi.fn()

    form.onSubmit(listener)
    form.onSubmit(listener)

    form.submit()

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("calls a listener on every submit", () => {
    const form = ImpulseFormUnit("value")

    const listener = vi.fn()

    form.onSubmit(listener)

    form.submit()
    form.submit()
    form.submit()

    expect(listener).toHaveBeenCalledTimes(3)
  })

  it("does not call a listener after it is unsubscribed", () => {
    const form = ImpulseFormUnit("value")

    const listener = vi.fn()

    const unsubscribe = form.onSubmit(listener)

    form.submit()

    expect(listener).toHaveBeenCalledTimes(1)
    listener.mockClear()

    unsubscribe()

    form.submit()

    expect(listener).not.toHaveBeenCalled()
  })

  it("unsubscribes the same listener as many times as it's been subscribed", () => {
    const form = ImpulseFormUnit("value")

    const listener = vi.fn()

    const unsubscribe1 = form.onSubmit(listener)
    const unsubscribe2 = form.onSubmit(listener)
    const unsubscribe3 = form.onSubmit(listener)

    form.submit()
    expect(listener).toHaveBeenCalled()
    listener.mockClear()
    unsubscribe1()

    form.submit()
    expect(listener).toHaveBeenCalled()
    listener.mockClear()
    unsubscribe2()

    form.submit()
    expect(listener).toHaveBeenCalled()
    listener.mockClear()
    unsubscribe3()

    form.submit()
    expect(listener).not.toHaveBeenCalled()
  })

  it("waits the slowest listener", async ({ monitor }) => {
    const form = ImpulseFormUnit("value")

    const done1 = vi.fn()
    const done2 = vi.fn()
    const done3 = vi.fn()
    const allDone = vi.fn()

    form.onSubmit(() => wait(0.25 * SLOWEST_ASYNC_MS).then(done1))
    form.onSubmit(() => wait(0.5 * SLOWEST_ASYNC_MS).then(done2))
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS).then(done3))

    form.submit().then(allDone)

    await vi.advanceTimersByTimeAsync(0.25 * SLOWEST_ASYNC_MS)
    expect(done1).toHaveBeenCalledOnce()
    expect(done2).not.toHaveBeenCalled()
    expect(done3).not.toHaveBeenCalled()
    expect(allDone).not.toHaveBeenCalled()
    expect(form.isSubmitting(monitor)).toBe(true)

    await vi.advanceTimersByTimeAsync(0.25 * SLOWEST_ASYNC_MS)
    expect(done1).toHaveBeenCalledOnce()
    expect(done2).toHaveBeenCalledOnce()
    expect(done3).not.toHaveBeenCalled()
    expect(allDone).not.toHaveBeenCalled()
    expect(form.isSubmitting(monitor)).toBe(true)

    await vi.advanceTimersByTimeAsync(0.5 * SLOWEST_ASYNC_MS)
    expect(done1).toHaveBeenCalledOnce()
    expect(done2).toHaveBeenCalledOnce()
    expect(done3).toHaveBeenCalledOnce()
    expect(allDone).toHaveBeenCalledOnce()
    expect(form.isSubmitting(monitor)).toBe(false)
  })
})
