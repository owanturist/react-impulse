import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { ImpulseFormUnit } from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 1000

function setupValue(enchant?: (form: ImpulseFormUnit<string, ReadonlyArray<string>>) => void) {
  return (initial = "") => {
    const form = ImpulseFormUnit(initial, {
      schema: z.string().max(2),
    })

    enchant?.(form)

    return form
  }
}

beforeAll(() => {
  vi.useFakeTimers()
})

it("matches the type signature", () => {
  const form = setupValue()()

  expectTypeOf(form.isSubmitting).toEqualTypeOf<(monitor: Monitor) => boolean>()
})

describe.each([
  ["without any submit listeners", setupValue()],

  [
    "with only sync submit listeners",
    setupValue((form) => {
      form.onSubmit(vi.fn())
      form.onSubmit(vi.fn())
      form.onSubmit(vi.fn())
    }),
  ],
])("isSubmitting(monitor) %s", (_, setup) => {
  it("returns false on initial", ({ monitor }) => {
    const form = setup()

    expect(form.isSubmitting(monitor)).toBe(false)
  })

  it("returns false when submitting starts", ({ monitor }) => {
    const form = setup()

    form.submit()
    expect(form.isSubmitting(monitor)).toBe(false)
  })

  it("returns false when submitting finishes", async ({ monitor }) => {
    const form = setup()

    await form.submit()
    expect(form.isSubmitting(monitor)).toBe(false)
  })
})

describe.each([
  [
    "with async submit listener",
    setupValue((form) => {
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
    }),
  ],

  [
    "with many async submit listeners",
    setupValue((form) => {
      form.onSubmit(vi.fn())
      form.onSubmit(vi.fn())
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
    }),
  ],
])("isSubmitting(monitor) %s", (_, setup) => {
  it("returns true when submitting starts", ({ monitor }) => {
    const form = setup()

    expect(form.isSubmitting(monitor)).toBe(false)
    form.submit()
    expect(form.isSubmitting(monitor)).toBe(true)
  })

  it("returns false when submitting finishes", async ({ monitor }) => {
    const form = setup()

    const allDone = vi.fn()

    form.submit().then(allDone)

    expect(allDone).not.toHaveBeenCalled()
    expect(form.isSubmitting(monitor)).toBe(true)

    await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS - 1)
    expect(allDone).not.toHaveBeenCalled()
    expect(form.isSubmitting(monitor)).toBe(true)

    await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)
    expect(allDone).toHaveBeenCalledOnce()
    expect(form.isSubmitting(monitor)).toBe(false)
  })

  it("returns false when all submitting finish", async ({ monitor }) => {
    const form = setup()

    const firstDone = vi.fn()
    const secondDone = vi.fn()

    form.submit().then(firstDone)

    form.onSubmit(() => wait(2 * SLOWEST_ASYNC_MS))

    form.submit().then(secondDone)

    expect(firstDone).not.toHaveBeenCalled()
    expect(secondDone).not.toHaveBeenCalled()
    expect(form.isSubmitting(monitor)).toBe(true)

    await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)

    expect(firstDone).toHaveBeenCalledOnce()
    expect(secondDone).not.toHaveBeenCalled()
    expect(form.isSubmitting(monitor)).toBe(true)

    await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)

    expect(firstDone).toHaveBeenCalledOnce()
    expect(secondDone).toHaveBeenCalledOnce()
    expect(form.isSubmitting(monitor)).toBe(false)
  })

  it("returns false when value is invalid", ({ monitor }) => {
    const form = setup("abc")

    expect(form.isInvalid(monitor)).toBe(false)

    form.submit()
    expect(form.isInvalid(monitor)).toBe(true)
    expect(form.isSubmitting(monitor)).toBe(false)
  })
})
