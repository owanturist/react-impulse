import { z } from "zod"
import type { Scope } from "react-impulse"

import {
  type ImpulseFormShapeOptions,
  ImpulseFormShape,
  ImpulseFormValue,
  type ImpulseForm,
} from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 1000

const setupValue = (
  description: string,
  enchant?: (form: ImpulseFormValue<string>) => void,
) => ({
  name: "ImpulseFormValue",
  description,
  setup: (initialValue = "") => {
    const form = ImpulseFormValue.of(initialValue, {
      schema: z.string().max(2),
    })

    enchant?.(form)

    return form
  },
})

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
) => ({
  name: "ImpulseFormShape",
  description,
  setup: (options?: ImpulseFormShapeOptions<ShapeFields>) => {
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
  },
})

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
])("$name#isSubmitting(scope) $description", ({ setup }) => {
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

interface ExpectImpulseFormPayload<TForm> {
  scope: Scope
  form: TForm
  submit: (form: TForm) => Promise<unknown>
}

const expectTrueWhenSubmittingStarts = <TForm extends ImpulseForm>({
  scope,
  form,
  submit,
}: ExpectImpulseFormPayload<TForm>) => {
  expect(form.isSubmitting(scope)).toBe(false)
  void submit(form)
  expect(form.isSubmitting(scope)).toBe(true)
}

const expectFalseWhenAllSubmittingFinish = async <TForm extends ImpulseForm>({
  scope,
  form,
  submit,
}: ExpectImpulseFormPayload<TForm>) => {
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
}

const expectFalseWhenSingleSubmitFinishes = async <TForm extends ImpulseForm>({
  scope,
  form,
  submit,
}: ExpectImpulseFormPayload<TForm>) => {
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
}

const expectFalseWhenInvalid = <TForm extends ImpulseForm>({
  scope,
  form,
  submit,
}: ExpectImpulseFormPayload<TForm>) => {
  expect(form.isInvalid(scope)).toBe(false)

  void submit(form)
  expect(form.isInvalid(scope)).toBe(true)
  expect(form.isSubmitting(scope)).toBe(false)
}

describe.each([
  setupValue("with async submit listener", (form) => {
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
  }),

  setupValue("with many async submit listeners", (form) => {
    form.onSubmit(vi.fn())
    form.onSubmit(vi.fn())
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
  }),
])("ImpulseFormValue#isSubmitting(scope) $description", ({ setup }) => {
  it("returns true when submitting starts", ({ scope }) => {
    expectTrueWhenSubmittingStarts({
      scope,
      form: setup(),
      submit: (form) => form.submit(),
    })
  })

  it("returns false when submitting finishes", async ({ scope }) => {
    await expectFalseWhenSingleSubmitFinishes({
      scope,
      form: setup(),
      submit: (form) => form.submit(),
    })
  })

  it("returns false when all submitting finish", async ({ scope }) => {
    await expectFalseWhenAllSubmittingFinish({
      scope,
      form: setup(),
      submit: (form) => form.submit(),
    })
  })

  it("returns false when value is invalid", ({ scope }) => {
    expectFalseWhenInvalid({
      scope,
      form: setup("abc"),
      submit: (form) => form.submit(),
    })
  })
})

describe.each([
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
])("ImpulseFormShape#isSubmitting(scope) $description", ({ setup }) => {
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
      expectTrueWhenSubmittingStarts({
        scope,
        submit,
        form: setup(),
      })
    })

    it("returns false when submitting finishes", async ({ scope }) => {
      await expectFalseWhenSingleSubmitFinishes({
        scope,
        submit,
        form: setup(),
      })
    })

    it("returns false when all submitting finish", async ({ scope }) => {
      await expectFalseWhenAllSubmittingFinish({
        scope,
        form: setup(),
        submit,
      })
    })

    it("returns false when root.fields.<ImpulseFormValue> is invalid", ({
      scope,
    }) => {
      expectFalseWhenInvalid({
        scope,
        submit,
        form: setup({
          originalValue: {
            _1: "abc",
          },
        }),
      })
    })

    it.todo("returns false when root.fields.<ImpulseFormShape> is invalid")

    it("returns false when root.fields.<ImpulseFormShape>.fields.<ImpulseFormValue> is invalid", ({
      scope,
    }) => {
      expectFalseWhenInvalid({
        scope,
        submit,
        form: setup({
          originalValue: {
            _3: {
              _2: ["abc"],
            },
          },
        }),
      })
    })
  })
})
