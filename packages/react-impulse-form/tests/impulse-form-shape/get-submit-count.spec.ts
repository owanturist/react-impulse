import type { Scope } from "react-impulse"
import { z } from "zod"

import { ImpulseFormShape, ImpulseFormValue } from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 3000

interface ShapeFields {
  _1: ImpulseFormValue<string, ReadonlyArray<string>>
  _2: ImpulseFormValue<number>
  _3: ImpulseFormShape<{
    _1: ImpulseFormValue<boolean>
    _2: ImpulseFormValue<Array<string>, ReadonlyArray<string>>
  }>
  _4: Array<string>
}

const setupShape =
  (enchant?: (form: ImpulseFormShape<ShapeFields>) => void) => () => {
    const form = ImpulseFormShape.of({
      _1: ImpulseFormValue.of("abc", {
        schema: z.string().max(2),
      }),
      _2: ImpulseFormValue.of(0),
      _3: ImpulseFormShape.of({
        _1: ImpulseFormValue.of(true),
        _2: ImpulseFormValue.of(["abc"], {
          schema: z.array(z.string().max(2)),
        }),
      }),
      _4: ["anything"],
    })

    enchant?.(form)

    return form
  }

beforeAll(() => {
  vi.useFakeTimers()
})

it("matches the type signature", () => {
  const form = setupShape()()

  expectTypeOf(form.getSubmitCount).toEqualTypeOf<(scope: Scope) => number>()

  expectTypeOf(form.fields._3.getSubmitCount).toEqualTypeOf<
    (scope: Scope) => number
  >()
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
])("getSubmitCount(scope) %s", (_, setup) => {
  describe.each<
    [string, (form: ImpulseFormShape<ShapeFields>) => Promise<unknown>]
  >([
    ["root", (form) => form.submit()],
    ["root.fields.<ImpulseFormValue>", (form) => form.fields._1.submit()],
    ["root.fields.<ImpulseFormShape>", (form) => form.fields._3.submit()],
    [
      "root.fields.<ImpulseFormShape>.fields.<ImpulseFormValue>",
      (form) => form.fields._3.fields._1.submit(),
    ],
  ])("when submitting via %s.submit()", (_, submit) => {
    it("increments sync when submits", ({ scope }) => {
      const form = setup()

      expect(form.getSubmitCount(scope)).toBe(0)

      void submit(form)
      expect(form.getSubmitCount(scope)).toBe(1)

      void submit(form)
      expect(form.getSubmitCount(scope)).toBe(2)
    })

    it("increments when form is invalid", ({ scope }) => {
      const form = setup()

      expect(form.isInvalid(scope)).toBe(false)

      void submit(form)
      expect(form.isInvalid(scope)).toBe(true)
      expect(form.getSubmitCount(scope)).toBe(1)
    })

    it("keeps the count after async is done", async ({ scope }) => {
      const form = setup()

      const all_done = vi.fn()

      const submits = Promise.all([submit(form), submit(form), submit(form)])

      expect(form.getSubmitCount(scope)).toBe(3)
      void submits.then(all_done)
      expect(all_done).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)
      expect(all_done).toHaveBeenCalledOnce()
      expect(form.getSubmitCount(scope)).toBe(3)
    })
  })
})
