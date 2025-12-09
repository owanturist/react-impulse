import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { FormShape, FormUnit } from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 3000

interface ShapeFields {
  _1: FormUnit<string, ReadonlyArray<string>>
  _2: FormUnit<number>
  _3: FormShape<{
    _1: FormUnit<boolean>
    _2: FormUnit<Array<string>, ReadonlyArray<string>>
  }>
  _4: Array<string>
}

function setupShape(enchant?: (form: FormShape<ShapeFields>) => void) {
  return () => {
    const form = FormShape({
      _1: FormUnit("abc", {
        schema: z.string().max(2),
      }),
      _2: FormUnit(0),
      _3: FormShape({
        _1: FormUnit(true),
        _2: FormUnit(["abc"], {
          schema: z.array(z.string().max(2)),
        }),
      }),
      _4: ["anything"],
    })

    enchant?.(form)

    return form
  }
}

beforeAll(() => {
  vi.useFakeTimers()
})

it("matches the type signature", () => {
  const form = setupShape()()

  expectTypeOf(form.getSubmitCount).toEqualTypeOf<(monitor: Monitor) => number>()

  expectTypeOf(form.fields._3.getSubmitCount).toEqualTypeOf<(monitor: Monitor) => number>()
})

describe.each([
  ["without any submit listeners", setupShape()],

  [
    "with only sync submit listeners",
    setupShape((form) => {
      form.onSubmit(vi.fn())
      form.onSubmit(vi.fn())
      form.onSubmit(vi.fn())
    }),
  ],

  [
    "with only sync submit listeners in nested fields",
    setupShape((form) => {
      form.onSubmit(vi.fn())
      form.fields._1.onSubmit(vi.fn())
      form.fields._2.onSubmit(vi.fn())
      form.fields._3.onSubmit(vi.fn())
      form.fields._3.fields._1.onSubmit(vi.fn())
      form.fields._3.fields._2.onSubmit(vi.fn())
    }),
  ],

  [
    "with an async submit listener",
    setupShape((form) => {
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
    }),
  ],

  [
    "with many async submit listener",
    setupShape((form) => {
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
    }),
  ],

  [
    "with slowest async submit listener at the root level",
    setupShape((form) => {
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
      form.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.fields._3.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
      form.fields._3.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 8))
    }),
  ],

  [
    "with slowest async submit listener at the field level",
    setupShape((form) => {
      form.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.fields._3.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
      form.fields._3.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 8))
    }),
  ],

  [
    "with slowest async submit listener at the nested field's root level",
    setupShape((form) => {
      form.fields._3.onSubmit(() => wait(SLOWEST_ASYNC_MS))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
      form.fields._3.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 8))
    }),
  ],

  [
    "with slowest async submit listener at the nested field's field level",

    setupShape((form) => {
      form.fields._3.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS))
      form.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.fields._3.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 8))
    }),
  ],
])("getSubmitCount(monitor) %s", (_, setup) => {
  describe.each<[string, (form: FormShape<ShapeFields>) => Promise<unknown>]>([
    ["root", (form) => form.submit()],
    ["root.fields.<FormUnit>", (form) => form.fields._1.submit()],
    ["root.fields.<FormShape>", (form) => form.fields._3.submit()],
    ["root.fields.<FormShape>.fields.<FormUnit>", (form) => form.fields._3.fields._1.submit()],
  ])("when submitting via %s.submit()", (_, submit) => {
    it("increments sync when submits", ({ monitor }) => {
      const form = setup()

      expect(form.getSubmitCount(monitor)).toBe(0)

      submit(form)
      expect(form.getSubmitCount(monitor)).toBe(1)

      submit(form)
      expect(form.getSubmitCount(monitor)).toBe(2)
    })

    it("increments when form is invalid", ({ monitor }) => {
      const form = setup()

      expect(form.isInvalid(monitor)).toBe(false)

      submit(form)
      expect(form.isInvalid(monitor)).toBe(true)
      expect(form.getSubmitCount(monitor)).toBe(1)
    })

    it("keeps the count after async is done", async ({ monitor }) => {
      const form = setup()

      const allDone = vi.fn()

      const submits = Promise.all([submit(form), submit(form), submit(form)])

      expect(form.getSubmitCount(monitor)).toBe(3)
      const whenDone = submits.then(allDone)
      expect(allDone).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)
      expect(allDone).toHaveBeenCalledOnce()
      expect(form.getSubmitCount(monitor)).toBe(3)

      await whenDone
    })
  })
})
