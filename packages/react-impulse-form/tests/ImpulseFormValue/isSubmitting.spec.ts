import { z } from "zod"

import { type ImpulseFormValueOptions, ImpulseFormValue } from "../../src"
import { wait } from "../common"

beforeAll(() => {
  vi.useFakeTimers()
})

describe.each([
  [
    "without any submit listeners",
    (options?: ImpulseFormValueOptions<string>) => {
      return ImpulseFormValue.of("", options)
    },
  ],
  [
    "without only sync submit listeners",
    (options?: ImpulseFormValueOptions<string>) => {
      const value = ImpulseFormValue.of("", options)

      value.onSubmit(vi.fn())
      value.onSubmit(vi.fn())
      value.onSubmit(vi.fn())

      return value
    },
  ],
])("isSubmitting(scope) %s", (_, setup) => {
  it("returns false on initial", ({ scope }) => {
    const value = setup()

    expect(value.isSubmitting(scope)).toBe(false)
  })

  it("returns false when submitting starts", ({ scope }) => {
    const value = setup()

    void value.submit()
    expect(value.isSubmitting(scope)).toBe(false)
  })

  it("returns false when submitting finishes", async ({ scope }) => {
    const value = setup()

    await value.submit()
    expect(value.isSubmitting(scope)).toBe(false)
  })
})

describe("isSubmitting(scope) with async submit listeners", () => {
  const setup = (options?: ImpulseFormValueOptions<string>) => {
    const value = ImpulseFormValue.of("", options)

    value.onSubmit(vi.fn())
    value.onSubmit(vi.fn())
    value.onSubmit(() => wait(1000))

    return value
  }

  it("returns false on initial", ({ scope }) => {
    const value = setup()

    expect(value.isSubmitting(scope)).toBe(false)
  })

  it("returns true when submitting starts", ({ scope }) => {
    const value = setup()

    void value.submit()
    expect(value.isSubmitting(scope)).toBe(true)
  })

  it("returns false when submitting finishes", async ({ scope }) => {
    const value = setup()
    const all_done = vi.fn()

    void value.submit().then(all_done)

    expect(all_done).not.toHaveBeenCalled()
    expect(value.isSubmitting(scope)).toBe(true)

    await vi.advanceTimersByTimeAsync(1000)

    expect(all_done).toHaveBeenCalledOnce()
    expect(value.isSubmitting(scope)).toBe(false)
  })

  it("returns false when value is invalid", ({ scope }) => {
    const value = setup({
      touched: true,
      schema: z.string().min(5),
    })

    expect(value.isInvalid(scope)).toBe(true)

    void value.submit()
    expect(value.isSubmitting(scope)).toBe(false)
  })

  it("returns false when all submit() resolve", async ({ scope }) => {
    const value = setup()
    const first_done = vi.fn()
    const second_done = vi.fn()

    void value.submit().then(first_done)

    value.onSubmit(() => wait(2000))

    void value.submit().then(second_done)

    expect(first_done).not.toHaveBeenCalled()
    expect(second_done).not.toHaveBeenCalled()
    expect(value.isSubmitting(scope)).toBe(true)

    await vi.advanceTimersByTimeAsync(1000)

    expect(first_done).toHaveBeenCalledOnce()
    expect(second_done).not.toHaveBeenCalled()
    expect(value.isSubmitting(scope)).toBe(true)

    await vi.advanceTimersByTimeAsync(1000)

    expect(first_done).toHaveBeenCalledOnce()
    expect(second_done).toHaveBeenCalledOnce()
    expect(value.isSubmitting(scope)).toBe(false)
  })
})
