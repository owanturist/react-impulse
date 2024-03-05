import { z } from "zod"

import { ImpulseFormValue } from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 3000

const setupValue =
  (enchant?: (form: ImpulseFormValue<string>) => void) => () => {
    const form = ImpulseFormValue.of("abc", {
      schema: z.string().max(2),
    })

    enchant?.(form)

    return form
  }

beforeAll(() => {
  vi.useFakeTimers()
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
])("getSubmitCount(scope) %s", (_, setup) => {
  it("increments sync when submits", ({ scope }) => {
    const form = setup()

    expect(form.getSubmitCount(scope)).toBe(0)

    void form.submit()
    expect(form.getSubmitCount(scope)).toBe(1)

    void form.submit()
    expect(form.getSubmitCount(scope)).toBe(2)
  })

  it("increments when form is invalid", ({ scope }) => {
    const form = setup()

    expect(form.isInvalid(scope)).toBe(false)

    void form.submit()
    expect(form.isInvalid(scope)).toBe(true)
    expect(form.getSubmitCount(scope)).toBe(1)
  })

  it("keeps the count after async is done", async ({ scope }) => {
    const form = setup()

    const all_done = vi.fn()

    const submits = Promise.all([form.submit(), form.submit(), form.submit()])

    expect(form.getSubmitCount(scope)).toBe(3)
    void submits.then(all_done)
    expect(all_done).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)
    expect(all_done).toHaveBeenCalledOnce()
    expect(form.getSubmitCount(scope)).toBe(3)
  })
})
