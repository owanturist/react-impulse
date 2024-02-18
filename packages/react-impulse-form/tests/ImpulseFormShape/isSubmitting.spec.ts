import { z } from "zod"

import {
  type ImpulseFormShapeOptions,
  ImpulseFormShape,
  ImpulseFormValue,
} from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 1000

type ShapeFields = {
  _1: ImpulseFormValue<string>
  _2: ImpulseFormValue<number>
  _3: ImpulseFormShape<{
    _1: ImpulseFormValue<boolean>
    _2: ImpulseFormValue<Array<string>>
  }>
  _4: Array<string>
}

const setupShape = (options?: ImpulseFormShapeOptions<ShapeFields>) => {
  return ImpulseFormShape.of(
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
}

beforeAll(() => {
  vi.useFakeTimers()
})

describe.each([
  ["without any submit listeners", () => setupShape()],
  [
    "with only sync submit listeners",
    () => {
      const form = setupShape()

      form.onSubmit(vi.fn())
      form.onSubmit(vi.fn())
      form.onSubmit(vi.fn())

      return form
    },
  ],
  [
    "with only sync submit listeners in nested fields",
    () => {
      const form = setupShape()

      form.onSubmit(vi.fn())
      form.fields._1.onSubmit(vi.fn())
      form.fields._2.onSubmit(vi.fn())
      form.fields._3.onSubmit(vi.fn())
      form.fields._3.fields._1.onSubmit(vi.fn())
      form.fields._3.fields._2.onSubmit(vi.fn())

      return form
    },
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
    (options?: ImpulseFormShapeOptions<ShapeFields>) => {
      const form = setupShape(options)

      form.onSubmit(() => wait(SLOWEST_ASYNC_MS))

      return form
    },
  ],
  [
    "with many async submit listener",
    (options?: ImpulseFormShapeOptions<ShapeFields>) => {
      const form = setupShape(options)

      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS))

      return form
    },
  ],
  [
    "with slowest async submit listener at the root level",
    (options?: ImpulseFormShapeOptions<ShapeFields>) => {
      const form = setupShape(options)

      form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
      form.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.fields._3.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
      form.fields._3.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 8))

      return form
    },
  ],
  [
    "with slowest async submit listener at the field level",
    (options?: ImpulseFormShapeOptions<ShapeFields>) => {
      const form = setupShape(options)

      form.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.fields._3.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
      form.fields._3.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 8))

      return form
    },
  ],
  [
    "with slowest async submit listener at the nested field's root level",
    (options?: ImpulseFormShapeOptions<ShapeFields>) => {
      const form = setupShape(options)

      form.fields._3.onSubmit(() => wait(SLOWEST_ASYNC_MS))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
      form.fields._3.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 8))

      return form
    },
  ],
  [
    "with slowest async submit listener at the nested field's field level",
    (options?: ImpulseFormShapeOptions<ShapeFields>) => {
      const form = setupShape(options)

      form.fields._3.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS))
      form.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.fields._3.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 8))

      return form
    },
  ],
])("isSubmitting(scope) %s", (_, setup) => {
  it("returns false on initial", ({ scope }) => {
    const form = setup()

    expect(form.isSubmitting(scope)).toBe(false)
  })

  describe.each([
    [
      "root.submit()",
      <TShape extends ImpulseFormShape<ShapeFields>>(form: TShape) => {
        return form.submit()
      },
    ],
    [
      "root.fields.<ImpulseFormValue>.submit()",
      <TShape extends ImpulseFormShape<ShapeFields>>(form: TShape) => {
        return form.fields._1.submit()
      },
    ],
    [
      "root.fields.<ImpulseFormShape>.submit()",
      <TShape extends ImpulseFormShape<ShapeFields>>(form: TShape) => {
        return form.fields._3.submit()
      },
    ],
    [
      "root.fields.<ImpulseFormShape>.fields.<ImpulseFormValue>.submit()",
      <TShape extends ImpulseFormShape<ShapeFields>>(form: TShape) => {
        return form.fields._3.fields._1.submit()
      },
    ],
  ])("when submit via", (__, submit) => {
    it("returns true when submitting starts", ({ scope }) => {
      const form = setup()

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

    it("returns false when value is invalid", ({ scope }) => {
      const form = setup({
        originalValue: {
          _1: "abc",
        },
      })

      expect(form.isInvalid(scope)).toBe(false)

      void submit(form)
      expect(form.isInvalid(scope)).toBe(true)
      expect(form.isSubmitting(scope)).toBe(false)
    })

    it("returns false when all submit() resolve", async ({ scope }) => {
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
  })
})
