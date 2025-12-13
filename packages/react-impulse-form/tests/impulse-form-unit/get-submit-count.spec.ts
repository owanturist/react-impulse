import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { FormUnit } from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 3000

function setupValue(enchant?: (form: FormUnit<string, ReadonlyArray<string>>) => void) {
  return () => {
    const form = FormUnit("abc", {
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

  expectTypeOf(form.getSubmitCount).toEqualTypeOf<(monitor: Monitor) => number>()
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
])("getSubmitCount(monitor) %s", (_, setup) => {
  it("increments sync when submits", ({ monitor }) => {
    const form = setup()

    expect(form.getSubmitCount(monitor)).toBe(0)

    form.submit()
    expect(form.getSubmitCount(monitor)).toBe(1)

    form.submit()
    expect(form.getSubmitCount(monitor)).toBe(2)
  })

  it("increments when form is invalid", ({ monitor }) => {
    const form = setup()

    expect(form.getError(monitor)).toBe(null)
    expect(form.isInvalid(monitor)).toBe(false)

    form.submit()
    expect(form.isInvalid(monitor)).toBe(true)
    expect(form.getSubmitCount(monitor)).toBe(1)
  })

  it("keeps the count after async is done", async ({ monitor }) => {
    const form = setup()

    const allDone = vi.fn()

    const submits = Promise.all([form.submit(), form.submit(), form.submit()])

    expect(form.getSubmitCount(monitor)).toBe(3)
    const whenDone = submits.then(allDone)
    expect(allDone).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)
    expect(allDone).toHaveBeenCalledOnce()
    expect(form.getSubmitCount(monitor)).toBe(3)

    await whenDone
  })
})
