import { z } from "zod"

import {
  type ImpulseFormShapeOptions,
  type ImpulseFormValueOptions,
  ImpulseFormShape,
  ImpulseFormValue,
} from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 1000

const setupValue = (
  description: string,
  enchant?: (form: ImpulseFormValue<string>) => void,
) => {
  const setup = (options?: ImpulseFormValueOptions<string>) => {
    const form = ImpulseFormValue.of("", options)

    enchant?.(form)

    return form
  }

  return [
    "ImpulseFormValue",
    description,
    setup,
    [
      [
        "root.submit()",
        (options) => {
          const form = setup(options)

          return [form, () => form.submit()]
        },
      ],
    ] as Array<
      [
        string,
        (
          options?: ImpulseFormValueOptions<string>,
        ) => [ImpulseFormValue<string>, () => Promise<unknown>],
      ]
    >,
  ] as const
}

type ShapeFields = {
  _1: ImpulseFormValue<string>
  _2: ImpulseFormValue<number>
  _3: ImpulseFormShape<{
    _1: ImpulseFormValue<boolean>
    _2: ImpulseFormValue<Array<string>>
  }>
  _4: Array<string>
}

const setupShape = (
  description: string,
  enchant?: (form: ImpulseFormShape<ShapeFields>) => void,
) => {
  const setup = (options?: ImpulseFormShapeOptions<ShapeFields>) => {
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

  const submits = [
    [
      "root.submit()",
      (form: ImpulseFormShape<ShapeFields>) => {
        return form.submit()
      },
    ],
    [
      "root.fields.<ImpulseFormValue>.submit()",
      (form: ImpulseFormShape<ShapeFields>) => {
        return form.fields._1.submit()
      },
    ],
    [
      "root.fields.<ImpulseFormShape>.submit()",
      (form: ImpulseFormShape<ShapeFields>) => {
        return form.fields._3.submit()
      },
    ],
    [
      "root.fields.<ImpulseFormShape>.fields.<ImpulseFormValue>.submit()",
      (form: ImpulseFormShape<ShapeFields>) => {
        return form.fields._3.fields._1.submit()
      },
    ],
  ] as const

  return [
    "ImpulseFormShape",
    description,
    setup,
    submits.map(
      ([desc, submit]): [
        string,
        (
          options?: ImpulseFormShapeOptions<ShapeFields>,
        ) => [ImpulseFormShape<ShapeFields>, () => Promise<unknown>],
      ] => [
        desc,
        (options) => {
          const form = setup(options)

          return [form, () => submit(form)]
        },
      ],
    ),
  ] as const
}

beforeAll(() => {
  vi.useFakeTimers()
})

describe.each([
  // ImpulseFormValue
  setupValue("without any submit listeners"),

  setupValue("with only sync submit listeners", (form) => {
    form.onSubmit(vi.fn())
    form.onSubmit(vi.fn())
    form.onSubmit(vi.fn())
  }),

  // ImpulseFormShape
  setupShape("without any submit listeners"),

  setupShape("with only sync submit listeners", (form) => {
    form.onSubmit(vi.fn())
    form.onSubmit(vi.fn())
    form.onSubmit(vi.fn())
  }),

  setupShape("with only sync submit listeners in nested fields", (form) => {
    form.onSubmit(vi.fn())
    form.fields._1.onSubmit(vi.fn())
    form.fields._2.onSubmit(vi.fn())
    form.fields._3.onSubmit(vi.fn())
    form.fields._3.fields._1.onSubmit(vi.fn())
    form.fields._3.fields._2.onSubmit(vi.fn())
  }),
])("%s#isSubmitting(scope) %s", (_, __, setup) => {
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
  // ImpulseFormValue
  setupValue("with async submit listener", (form) => {
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
  }),

  setupValue("with many async submit listeners", (form) => {
    form.onSubmit(vi.fn())
    form.onSubmit(vi.fn())
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
  }),

  // ImpulseFormShape
  setupShape("with an async submit listener", (form) => {
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
  }),

  setupShape("with many async submit listener", (form) => {
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
  }),

  setupShape("with slowest async submit listener at the root level", (form) => {
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
    form.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
    form.fields._3.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
    form.fields._3.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 8))

    return form
  }),

  setupShape(
    "with slowest async submit listener at the field level",
    (form) => {
      form.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.fields._3.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
      form.fields._3.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 8))
    },
  ),

  setupShape(
    "with slowest async submit listener at the nested field's root level",
    (form) => {
      form.fields._3.onSubmit(() => wait(SLOWEST_ASYNC_MS))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
      form.fields._3.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 8))
    },
  ),

  setupShape(
    "with slowest async submit listener at the nested field's field level",
    (form) => {
      form.fields._3.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS))
      form.fields._1.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
      form.fields._3.onSubmit(() => wait(SLOWEST_ASYNC_MS / 4))
      form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 8))
    },
  ),
])("%s#isSubmitting(scope) %s", (_, __, setup, submits) => {
  it("returns false on initial", ({ scope }) => {
    const form = setup()

    expect(form.isSubmitting(scope)).toBe(false)
  })

  describe.each(submits)("when submit via", (___, setupWithSubmit) => {
    it("returns true when submitting starts", ({ scope }) => {
      const [form, submit] = setupWithSubmit()

      void submit()
      expect(form.isSubmitting(scope)).toBe(true)
    })

    it.skip("returns false when submitting finishes", async ({ scope }) => {
      const [form, submit] = setupWithSubmit()
      const all_done = vi.fn()

      void submit().then(all_done)

      expect(all_done).not.toHaveBeenCalled()
      expect(form.isSubmitting(scope)).toBe(true)

      await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS - 1)
      expect(all_done).not.toHaveBeenCalled()
      expect(form.isSubmitting(scope)).toBe(true)

      await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)
      expect(all_done).toHaveBeenCalledOnce()
      expect(form.isSubmitting(scope)).toBe(false)
    })

    it.skip("returns false when value is invalid", ({ scope }) => {
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

    it.skip("returns false when all submit() resolve", async ({ scope }) => {
      const [form, submit] = setupWithSubmit()
      const first_done = vi.fn()
      const second_done = vi.fn()

      void submit().then(first_done)

      form.onSubmit(() => wait(2 * SLOWEST_ASYNC_MS))

      void submit().then(second_done)

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
