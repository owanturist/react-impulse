import type { Scope } from "react-impulse"
import { z } from "zod"

import { ImpulseFormUnit } from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 3000

function setupValue(enchant?: (form: ImpulseFormUnit<string, ReadonlyArray<string>>) => void) {
  return () => {
    const form = ImpulseFormUnit("abc", {
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

  expectTypeOf(form.getSubmitCount).toEqualTypeOf<(scope: Scope) => number>()
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

    form.submit()
    expect(form.getSubmitCount(scope)).toBe(1)

    form.submit()
    expect(form.getSubmitCount(scope)).toBe(2)
  })

  it("increments when form is invalid", ({ scope }) => {
    const form = setup()

    expect(form.getError(scope)).toBe(null)
    expect(form.isInvalid(scope)).toBe(false)

    form.submit()
    expect(form.isInvalid(scope)).toBe(true)
    expect(form.getSubmitCount(scope)).toBe(1)
  })

  it("keeps the count after async is done", async ({ scope }) => {
    const form = setup()

    const allDone = vi.fn()

    const submits = Promise.all([form.submit(), form.submit(), form.submit()])

    expect(form.getSubmitCount(scope)).toBe(3)
    const whenDone = submits.then(allDone)
    expect(allDone).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)
    expect(allDone).toHaveBeenCalledOnce()
    expect(form.getSubmitCount(scope)).toBe(3)

    await whenDone
  })
})
