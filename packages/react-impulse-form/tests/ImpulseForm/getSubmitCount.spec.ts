import { z } from "zod"
import type { Scope } from "react-impulse"

import { type ImpulseForm, ImpulseFormValue, ImpulseFormShape } from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 3000

beforeAll(() => {
  vi.useFakeTimers()
})

const setupValue = (
  description: string,
  enchant?: (form: ImpulseFormValue<string>) => void,
) => ({
  description,
  setup: () => {
    const form = ImpulseFormValue.of("abc", {
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
  description,
  setup: () => {
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
  },
})

interface ExpectImpulseFormPayload<TForm> {
  scope: Scope
  form: TForm
  submit: (form: TForm) => Promise<unknown>
}

const expectIncrementSyncWhenSubmits = <TForm extends ImpulseForm>({
  scope,
  form,
  submit,
}: ExpectImpulseFormPayload<TForm>) => {
  expect(form.getSubmitCount(scope)).toBe(0)

  void submit(form)
  expect(form.getSubmitCount(scope)).toBe(1)

  void submit(form)
  expect(form.getSubmitCount(scope)).toBe(2)
}

const expectIncrementWhenInvalid = <TForm extends ImpulseForm>({
  scope,
  form,
  submit,
}: ExpectImpulseFormPayload<TForm>) => {
  expect(form.isInvalid(scope)).toBe(false)

  void submit(form)
  expect(form.isInvalid(scope)).toBe(true)
  expect(form.getSubmitCount(scope)).toBe(1)
}

const expectKeepsCountAfterSubmitIdDone = async <TForm extends ImpulseForm>({
  scope,
  form,
  submit,
}: ExpectImpulseFormPayload<TForm>) => {
  const all_done = vi.fn()

  const submits = Promise.all([submit(form), submit(form), submit(form)])

  expect(form.getSubmitCount(scope)).toBe(3)
  void submits.then(all_done)
  expect(all_done).not.toHaveBeenCalled()

  await vi.advanceTimersByTimeAsync(SLOWEST_ASYNC_MS)
  expect(all_done).toHaveBeenCalledOnce()
  expect(form.getSubmitCount(scope)).toBe(3)
}

describe.each([
  setupValue("without any submit listeners"),

  setupValue("with only sync submit listeners", (form) => {
    form.onSubmit(vi.fn())
    form.onSubmit(vi.fn())
    form.onSubmit(vi.fn())
  }),

  setupValue("with async submit listener", (form) => {
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
  }),

  setupValue("with many async submit listeners", (form) => {
    form.onSubmit(vi.fn())
    form.onSubmit(vi.fn())
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS / 2))
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS))
  }),
])("ImpulseFormValue#getSubmitCount(scope) $description", ({ setup }) => {
  it("increments sync when submits", ({ scope }) => {
    expectIncrementSyncWhenSubmits({
      scope,
      form: setup(),
      submit: (form) => form.submit(),
    })
  })

  it("increments when form is invalid", ({ scope }) => {
    expectIncrementWhenInvalid({
      scope,
      form: setup(),
      submit: (form) => form.submit(),
    })
  })

  it("keeps the count after async is done", async ({ scope }) => {
    await expectKeepsCountAfterSubmitIdDone({
      scope,
      form: setup(),
      submit: (form) => form.submit(),
    })
  })
})

describe.each([
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
])("ImpulseFormShape#getSubmitCount(scope) $description", ({ setup }) => {
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
      expectIncrementSyncWhenSubmits({
        scope,
        form: setup(),
        submit,
      })
    })

    it("increments when form is invalid", ({ scope }) => {
      expectIncrementWhenInvalid({
        scope,
        form: setup(),
        submit,
      })
    })

    it("keeps the count after async is done", async ({ scope }) => {
      await expectKeepsCountAfterSubmitIdDone({
        scope,
        form: setup(),
        submit,
      })
    })
  })
})
