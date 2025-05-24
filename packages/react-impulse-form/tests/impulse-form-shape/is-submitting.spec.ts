import { z } from "zod"
import type { Scope } from "react-impulse"

import {
  type ImpulseFormShapeOptions,
  ImpulseFormShape,
  ImpulseFormValue,
} from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 1000

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
  (enchant?: (form: ImpulseFormShape<ShapeFields>) => void) =>
  (options?: ImpulseFormShapeOptions<ShapeFields>) => {
    const form = ImpulseFormShape.of(
      {
        _1: ImpulseFormValue.of("", {
          schema: z.string().max(2),
        }),
        _2: ImpulseFormValue.of(0),
        _3: ImpulseFormShape.of({
          _1: ImpulseFormValue.of(true),
          _2: ImpulseFormValue.of([""], {
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

beforeAll(() => {
  vi.useFakeTimers()
})

it("matches the type signature", () => {
  const form = setupShape()()

  expectTypeOf(form.isSubmitting).toEqualTypeOf<(scope: Scope) => boolean>()

  expectTypeOf(form.fields._3.isSubmitting).toEqualTypeOf<
    (scope: Scope) => boolean
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
])("isSubmitting(scope) %s", (_, setup) => {
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
    it("returns true when submitting starts", ({ scope }) => {
      const form = setup()

      expect(form.isSubmitting(scope)).toBe(false)
      void submit(form)
      expect(form.isSubmitting(scope)).toBe(true)
    })

    it("returns false when submitting finishes", async ({ scope }) => {
      const form = setup()

      const all_done = vi.fn()

      void submit(form).then(all_done)

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

      void submit(form).then(first_done)

      form.onSubmit(() => wait(2 * SLOWEST_ASYNC_MS))

      void submit(form).then(second_done)

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

    describe.each([
      // TODO ["root.fields.<ImpulseFormShape>"]
      [
        "root.fields.<ImpulseFormValue>",
        () =>
          setup({
            input: {
              _1: "abc",
            },
          }),
      ],
      [
        "root.fields.<ImpulseFormShape>.fields.<ImpulseFormValue>",
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
      it("returns false", ({ scope }) => {
        const form = setup()

        expect(form.isInvalid(scope)).toBe(false)

        void submit(form)
        expect(form.isInvalid(scope)).toBe(true)
        expect(form.isSubmitting(scope)).toBe(false)
      })
    })
  })
})
