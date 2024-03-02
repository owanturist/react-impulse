import { z } from "zod"

import { ImpulseFormValue } from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 3000

beforeAll(() => {
  vi.useFakeTimers()
})

const setupValue = (
  description: string,
  enchant?: (form: ImpulseFormValue<string>) => void,
) => ({
  name: "ImpulseFormValue",
  description,
  setup: () => {
    const form = ImpulseFormValue.of("abc", {
      schema: z.string().max(2),
    })

    enchant?.(form)

    return form
  },
})

describe.each([
  setupValue("without submit listeners"),
  setupValue("with a single sync submit listener", (form) => {
    form.onSubmit(vi.fn())
  }),
  setupValue("with many sync submit listeners", (form) => {
    form.onSubmit(vi.fn())
    form.onSubmit(vi.fn())
    form.onSubmit(vi.fn())
  }),
  setupValue("with a single async submit listener", (form) => {
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
  }),
  setupValue("with many async submit listeners", (form) => {
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 3))
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
  }),
  setupValue("with many (a)sync submit listeners", (form) => {
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
    form.onSubmit(vi.fn())
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
    form.onSubmit(vi.fn())
  }),
])("$name#getSubmitCount(scope) $description", ({ setup }) => {
  it("returns 0 on initial", ({ scope }) => {
    const value = setup()

    expect(value.getSubmitCount(scope)).toBe(0)
  })

  it("increments sync when submits", ({ scope }) => {
    const value = setup()

    void value.submit()
    expect(value.getSubmitCount(scope)).toBe(1)

    void value.submit()
    expect(value.getSubmitCount(scope)).toBe(2)
  })

  it("increments when value is invalid", ({ scope }) => {
    const value = setup()

    expect(value.isInvalid(scope)).toBe(false)

    void value.submit()
    expect(value.isInvalid(scope)).toBe(true)
    expect(value.getSubmitCount(scope)).toBe(1)
  })

  it("keeps the count after async is done", async ({ scope }) => {
    const value = setup()
    const all_done = vi.fn()

    const submits = Promise.all([
      value.submit(),
      value.submit(),
      value.submit(),
    ])

    expect(value.getSubmitCount(scope)).toBe(3)
    void submits.then(all_done)
    expect(all_done).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)
    expect(all_done).toHaveBeenCalledOnce()
    expect(value.getSubmitCount(scope)).toBe(3)
  })
})
