import { z } from "zod"

import { type ImpulseFormValueOptions, ImpulseFormValue } from "../../src"
import { wait } from "../common"

beforeAll(() => {
  vi.useFakeTimers()
})

describe.each([
  [
    "without submit listeners",
    () => {
      /* noop */
    },
  ],
  [
    "with a single sync submit listener",
    (value: ImpulseFormValue<string>) => {
      value.onSubmit(vi.fn())
    },
  ],
  [
    "with many sync submit listener",
    (value: ImpulseFormValue<string>) => {
      value.onSubmit(vi.fn())
      value.onSubmit(vi.fn())
      value.onSubmit(vi.fn())
    },
  ],
  [
    "with a single async submit listener",
    (value: ImpulseFormValue<string>) => {
      value.onSubmit(() => wait(1000))
    },
  ],
  [
    "with many async submit listeners",
    (value: ImpulseFormValue<string>) => {
      value.onSubmit(() => wait(1000))
      value.onSubmit(() => wait(2000))
      value.onSubmit(() => wait(3000))
    },
  ],
  [
    "with many (a)sync submit listeners",
    (value: ImpulseFormValue<string>) => {
      value.onSubmit(() => wait(1000))
      value.onSubmit(vi.fn())
      value.onSubmit(() => wait(2000))
      value.onSubmit(vi.fn())
    },
  ],
])("getSubmitCount(scope) %s", (_, enhance) => {
  const setup = (options?: ImpulseFormValueOptions<string>) => {
    const value = ImpulseFormValue.of("", options)

    enhance(value)

    return value
  }

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
    const value = setup({
      touched: true,
      schema: z.string().min(5),
    })

    expect(value.isInvalid(scope)).toBe(true)

    void value.submit()
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

    await vi.advanceTimersByTimeAsync(3000)
    expect(all_done).toHaveBeenCalledOnce()
    expect(value.getSubmitCount(scope)).toBe(3)
  })
})
