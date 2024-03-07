import { z } from "zod"

import {
  type ImpulseFormShapeOptions,
  ImpulseFormValue,
  ImpulseFormShape,
} from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 3000

type ShapeFields = {
  _1: ImpulseFormValue<string>
  _2: ImpulseFormValue<number>
  _3: ImpulseFormShape<{
    _1: ImpulseFormValue<boolean>
    _2: ImpulseFormValue<Array<string>>
  }>
  _4: Array<string>
}

const setup = (options?: ImpulseFormShapeOptions<ShapeFields>) => {
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
])("onSubmit(listener) when submitting via %s", (_, submit) => {
  it("provides validated value", () => {
    const form = setup()

    form.onSubmit((value) => {
      expectTypeOf(value).toEqualTypeOf<{
        readonly _1: string
        readonly _2: number
        readonly _3: {
          readonly _1: boolean
          readonly _2: Array<string>
        }
        readonly _4: Array<string>
      }>()
    })
  })

  describe.each([
    // TODO ["root.fields.<ImpulseFormShape>"]
    [
      "root.fields.<ImpulseFormValue>",
      () =>
        setup({
          originalValue: {
            _1: "abc",
          },
        }),
    ],
    [
      "root.fields.<ImpulseFormShape>.fields.<ImpulseFormValue>",
      () =>
        setup({
          originalValue: {
            _3: {
              _2: ["abc"],
            },
          },
        }),
    ],
  ])("when %s is invalid", (_, setup) => {
    it("does not call the listener", ({ scope }) => {
      const form = setup()

      const listener = vi.fn()

      form.onSubmit(listener)

      void submit(form)

      expect(form.isInvalid(scope)).toBe(true)
      expect(listener).not.toHaveBeenCalled()
    })

    it("calls the focus listener", () => {
      const form = setup()

      const focus = vi.fn()

      form.fields._1.onFocusWhenInvalid(focus)
      form.fields._3.fields._2.onFocusWhenInvalid(focus)

      expect(focus).not.toHaveBeenCalled()

      void submit(form)

      expect(focus).toHaveBeenCalledTimes(1)
      expect(focus).toHaveBeenLastCalledWith([
        "String must contain at most 2 character(s)",
      ])
    })
  })

  it.each([
    [
      "schema is not defined",
      {
        _1: "value",
        _2: 0,
        _3: {
          _1: true,
          _2: ["value"],
        },
        _4: ["anything"],
      },
      () => {
        const form = setup({
          originalValue: {
            _1: "value",
            _3: {
              _2: ["value"],
            },
          },
        })

        form.fields._1.setSchema(null)
        form.fields._3.fields._2.setSchema(null)

        return form
      },
    ],
    [
      "schema is defined and value is valid",
      {
        _1: "x",
        _2: 567,
        _3: {
          _1: false,
          _2: ["y"],
        },
        _4: ["anything"],
      },
      () =>
        setup({
          originalValue: {
            _1: "x",
            _2: 567,
            _3: {
              _1: false,
              _2: ["y"],
            },
          },
        }),
    ],
  ])("passes the form value to the listener when %s", (_, value, setup) => {
    const form = setup()

    const listener = vi.fn()

    form.onSubmit(listener)

    expect(listener).not.toHaveBeenCalled()

    void submit(form)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenLastCalledWith(value)
  })

  it("calls all listeners", () => {
    const form = setup()

    const listener_1 = vi.fn()
    const listener_2 = vi.fn()

    form.onSubmit(listener_1)
    form.onSubmit(listener_2)

    void submit(form)

    expect(listener_1).toHaveBeenCalledTimes(1)
    expect(listener_2).toHaveBeenCalledTimes(1)
  })

  it("subscribes the same listener only once", () => {
    const form = setup()

    const listener = vi.fn()

    form.onSubmit(listener)
    form.onSubmit(listener)

    void submit(form)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("calls a listener on every submit", () => {
    const form = setup()

    const listener = vi.fn()

    form.onSubmit(listener)

    void submit(form)
    void form.submit()
    void form.fields._1.submit()
    void form.fields._3.submit()
    void form.fields._3.fields._1.submit()

    expect(listener).toHaveBeenCalledTimes(5)
  })

  it("does not call a listener after it is unsubscribed", () => {
    const form = setup()

    const listener = vi.fn()

    const unsubscribe = form.onSubmit(listener)

    void submit(form)

    expect(listener).toHaveBeenCalledTimes(1)
    listener.mockClear()

    unsubscribe()

    void submit(form)

    expect(listener).not.toHaveBeenCalled()
  })

  it("unsubscribes the same listener as many times as it's been subscribed", () => {
    const form = setup()

    const listener = vi.fn()

    const unsubscribe_1 = form.onSubmit(listener)
    const unsubscribe_2 = form.onSubmit(listener)
    const unsubscribe_3 = form.onSubmit(listener)

    void submit(form)
    expect(listener).toHaveBeenCalled()
    listener.mockClear()
    unsubscribe_1()

    void submit(form)
    expect(listener).toHaveBeenCalled()
    listener.mockClear()
    unsubscribe_2()

    void submit(form)
    expect(listener).toHaveBeenCalled()
    listener.mockClear()
    unsubscribe_3()

    void submit(form)
    expect(listener).not.toHaveBeenCalled()
  })

  it("waits the slowest listener", async ({ scope }) => {
    const form = setup()

    const done_1 = vi.fn()
    const done_2 = vi.fn()
    const done_3 = vi.fn()
    const all_done = vi.fn()

    form.onSubmit(() => wait(0.25 * SLOWEST_ASYNC_MS).then(done_1))
    form.onSubmit(() => wait(0.5 * SLOWEST_ASYNC_MS).then(done_2))
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS).then(done_3))

    void submit(form).then(all_done)

    await vi.advanceTimersByTimeAsync(0.25 * SLOWEST_ASYNC_MS)
    expect(done_1).toHaveBeenCalledOnce()
    expect(done_2).not.toHaveBeenCalled()
    expect(done_3).not.toHaveBeenCalled()
    expect(all_done).not.toHaveBeenCalled()
    expect(form.isSubmitting(scope)).toBe(true)

    await vi.advanceTimersByTimeAsync(0.25 * SLOWEST_ASYNC_MS)
    expect(done_1).toHaveBeenCalledOnce()
    expect(done_2).toHaveBeenCalledOnce()
    expect(done_3).not.toHaveBeenCalled()
    expect(all_done).not.toHaveBeenCalled()
    expect(form.isSubmitting(scope)).toBe(true)

    await vi.advanceTimersByTimeAsync(0.5 * SLOWEST_ASYNC_MS)
    expect(done_1).toHaveBeenCalledOnce()
    expect(done_2).toHaveBeenCalledOnce()
    expect(done_3).toHaveBeenCalledOnce()
    expect(all_done).toHaveBeenCalledOnce()
    expect(form.isSubmitting(scope)).toBe(false)
  })

  it("calls the listeners for each field", () => {
    const form = setup({
      originalValue: {
        _1: "x",
        _2: 567,
        _3: {
          _1: false,
          _2: ["y"],
        },
      },
    })

    const listener_1 = vi.fn()
    const listener_2 = vi.fn()
    const listener_3 = vi.fn()
    const listener_3_1 = vi.fn()
    const listener_3_2 = vi.fn()

    form.fields._1.onSubmit(listener_1)
    form.fields._2.onSubmit(listener_2)
    form.fields._3.onSubmit(listener_3)
    form.fields._3.fields._1.onSubmit(listener_3_1)
    form.fields._3.fields._2.onSubmit(listener_3_2)

    void submit(form)

    expect(listener_1).toHaveBeenCalledOnce()
    expect(listener_1).toHaveBeenLastCalledWith("x")

    expect(listener_2).toHaveBeenCalledOnce()
    expect(listener_2).toHaveBeenLastCalledWith(567)

    expect(listener_3).toHaveBeenCalledOnce()
    expect(listener_3).toHaveBeenLastCalledWith({
      _1: false,
      _2: ["y"],
    })

    expect(listener_3_1).toHaveBeenCalledOnce()
    expect(listener_3_1).toHaveBeenLastCalledWith(false)

    expect(listener_3_2).toHaveBeenCalledOnce()
    expect(listener_3_2).toHaveBeenLastCalledWith(["y"])
  })
})
