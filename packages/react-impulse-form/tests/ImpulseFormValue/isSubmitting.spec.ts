import { z } from "zod"

import { type ImpulseFormValueOptions, ImpulseFormValue } from "../../src"
import { wait } from "../common"

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
    value.onSubmit(() => wait(1))

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

    await value.submit()
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

  it("returns true when only one of requests finishes", async ({ scope }) => {
    const value = setup()

    const promise = value.submit()
    void value.submit()

    expect(value.isSubmitting(scope)).toBe(true)

    await promise
    expect(value.isSubmitting(scope)).toBe(true)
  })

  it("returns false when all of requests finish", async ({ scope }) => {
    const value = setup()

    const promise = Promise.all([value.submit(), value.submit()])

    expect(value.isSubmitting(scope)).toBe(true)

    await promise
    expect(value.isSubmitting(scope)).toBe(false)
  })
})
