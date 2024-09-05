import { z } from "zod"
import type { Scope } from "react-impulse"

import { ImpulseFormValue } from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 1000

const setupValue =
  (enchant?: (form: ImpulseFormValue<string>) => void) =>
  (initial = "") => {
    const form = ImpulseFormValue.of(initial, {
      schema: z.string().max(2),
    })

    enchant?.(form)

    return form
  }

beforeAll(() => {
  vi.useFakeTimers()
})

it("matches the type signature", () => {
  const form = setupValue()()

  expectTypeOf(form.isSubmitting).toEqualTypeOf<(scope: Scope) => boolean>()
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
])("isSubmitting(scope) %s", (_, setup) => {
  it("returns false on initial", ({ scope }) => {
    const form = setup()

    expect(form.isSubmitting(scope)).toBe(false)
  })

  it("returns false when submitting starts", ({ scope }) => {
    const form = setup()

    void form.submit()
    expect(form.isSubmitting(scope)).toBe(false)
  })

  it("returns false when submitting finishes", async ({ scope }) => {
    const form = setup()

    await form.submit()
    expect(form.isSubmitting(scope)).toBe(false)
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
])("isSubmitting(scope) %s", (_, setup) => {
  it("returns true when submitting starts", ({ scope }) => {
    const form = setup()

    expect(form.isSubmitting(scope)).toBe(false)
    void form.submit()
    expect(form.isSubmitting(scope)).toBe(true)
  })

  it("returns false when submitting finishes", async ({ scope }) => {
    const form = setup()

    const all_done = vi.fn()

    void form.submit().then(all_done)

    expect(all_done).not.toHaveBeenCalled()
    expect(form.isSubmitting(scope)).toBe(true)

    await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS - 1)
    expect(all_done).not.toHaveBeenCalled()
    expect(form.isSubmitting(scope)).toBe(true)

    await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)
    expect(all_done).toHaveBeenCalledOnce()
    expect(form.isSubmitting(scope)).toBe(false)
  })

  it("returns false when all submitting finish", async ({ scope }) => {
    const form = setup()

    const first_done = vi.fn()
    const second_done = vi.fn()

    void form.submit().then(first_done)

    form.onSubmit(() => wait(2 * SLOWEST_ASYNC_MS))

    void form.submit().then(second_done)

    expect(first_done).not.toHaveBeenCalled()
    expect(second_done).not.toHaveBeenCalled()
    expect(form.isSubmitting(scope)).toBe(true)

    await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)

    expect(first_done).toHaveBeenCalledOnce()
    expect(second_done).not.toHaveBeenCalled()
    expect(form.isSubmitting(scope)).toBe(true)

    await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)

    expect(first_done).toHaveBeenCalledOnce()
    expect(second_done).toHaveBeenCalledOnce()
    expect(form.isSubmitting(scope)).toBe(false)
  })

  it("returns false when value is invalid", ({ scope }) => {
    const form = setup("abc")

    expect(form.isInvalid(scope)).toBe(false)

    void form.submit()
    expect(form.isInvalid(scope)).toBe(true)
    expect(form.isSubmitting(scope)).toBe(false)
  })
})
