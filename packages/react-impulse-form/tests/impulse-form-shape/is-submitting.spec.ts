import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { FormShape, type FormShapeOptions, FormUnit } from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 1000

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
  return (options?: FormShapeOptions<ShapeFields>) => {
    const form = FormShape(
      {
        _1: FormUnit("", {
          schema: z.string().max(2),
        }),
        _2: FormUnit(0),
        _3: FormShape({
          _1: FormUnit(true),
          _2: FormUnit([""], {
            schema: z.array(z.string().max(2)),
          }),
        }),
        _4: ["anything"],
      },
      options,
    )

    enchant?.(form)

    return form
  }
}

beforeAll(() => {
  vi.useFakeTimers()
})

it("matches the type signature", () => {
  const form = setupShape()()

  expectTypeOf(form.isSubmitting).toEqualTypeOf<(monitor: Monitor) => boolean>()

  expectTypeOf(form.fields._3.isSubmitting).toEqualTypeOf<(monitor: Monitor) => boolean>()
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
])("isSubmitting(monitor) %s", (_, setup) => {
  it("returns false on initial", ({ monitor }) => {
    const form = setup()

    expect(form.isSubmitting(monitor)).toBe(false)
  })

  it("returns false when submitting starts", ({ monitor }) => {
    const form = setup()

    form.submit()
    expect(form.isSubmitting(monitor)).toBe(false)
  })

  it("returns false when submitting finishes", async ({ monitor }) => {
    const form = setup()

    await form.submit()
    expect(form.isSubmitting(monitor)).toBe(false)
  })
})

describe.each([
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
])("isSubmitting(monitor) %s", (_, setup) => {
  describe.each<[string, (form: FormShape<ShapeFields>) => Promise<unknown>]>([
    ["root", (form) => form.submit()],
    ["root.fields.<FormUnit>", (form) => form.fields._1.submit()],
    ["root.fields.<FormShape>", (form) => form.fields._3.submit()],
    ["root.fields.<FormShape>.fields.<FormUnit>", (form) => form.fields._3.fields._1.submit()],
  ])("when submitting via %s.submit()", (_, submit) => {
    it("returns true when submitting starts", ({ monitor }) => {
      const form = setup()

      expect(form.isSubmitting(monitor)).toBe(false)
      submit(form)
      expect(form.isSubmitting(monitor)).toBe(true)
    })

    it("returns false when submitting finishes", async ({ monitor }) => {
      const form = setup()

      const allDone = vi.fn()

      submit(form).then(allDone)

      expect(allDone).not.toHaveBeenCalled()
      expect(form.isSubmitting(monitor)).toBe(true)

      await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS - 1)
      expect(allDone).not.toHaveBeenCalled()
      expect(form.isSubmitting(monitor)).toBe(true)

      await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)
      expect(allDone).toHaveBeenCalledOnce()
      expect(form.isSubmitting(monitor)).toBe(false)
    })

    it("returns false when all submitting finish", async ({ monitor }) => {
      const form = setup()

      const firstDone = vi.fn()
      const secondDone = vi.fn()

      submit(form).then(firstDone)

      form.onSubmit(() => wait(2 * SLOWEST_ASYNC_MS))

      submit(form).then(secondDone)

      expect(firstDone).not.toHaveBeenCalled()
      expect(secondDone).not.toHaveBeenCalled()
      expect(form.isSubmitting(monitor)).toBe(true)

      await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)

      expect(firstDone).toHaveBeenCalledOnce()
      expect(secondDone).not.toHaveBeenCalled()
      expect(form.isSubmitting(monitor)).toBe(true)

      await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)

      expect(firstDone).toHaveBeenCalledOnce()
      expect(secondDone).toHaveBeenCalledOnce()
      expect(form.isSubmitting(monitor)).toBe(false)
    })

    describe.each([
      // TODO ["root.fields.<FormShape>"]
      [
        "root.fields.<FormUnit>",
        () =>
          setup({
            input: {
              _1: "abc",
            },
          }),
      ],
      [
        "root.fields.<FormShape>.fields.<FormUnit>",
        () =>
          setup({
            input: {
              _3: {
                _2: ["abc"],
              },
            },
          }),
      ],
    ])("when %s is invalid", (_, setup) => {
      it("returns false", ({ monitor }) => {
        const form = setup()

        expect(form.isInvalid(monitor)).toBe(false)

        submit(form)
        expect(form.isInvalid(monitor)).toBe(true)
        expect(form.isSubmitting(monitor)).toBe(false)
      })
    })
  })
})
