import { z } from "zod"

import { type ImpulseFormValueOptions, ImpulseFormValue } from "../../src"
import { wait } from "../common"

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
      value.onSubmit(() => wait(1))
    },
  ],
  [
    "with many async submit listeners",
    (value: ImpulseFormValue<string>) => {
      value.onSubmit(() => wait(1))
      value.onSubmit(() => wait(2))
      value.onSubmit(() => wait(3))
    },
  ],
  [
    "with many (a)sync submit listeners",
    (value: ImpulseFormValue<string>) => {
      value.onSubmit(() => wait(1))
      value.onSubmit(vi.fn())
      value.onSubmit(() => wait(2))
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

    const submits = Promise.all([
      value.submit(),
      value.submit(),
      value.submit(),
    ])

    expect(value.getSubmitCount(scope)).toBe(3)
    await submits
    expect(value.getSubmitCount(scope)).toBe(3)
  })
})
