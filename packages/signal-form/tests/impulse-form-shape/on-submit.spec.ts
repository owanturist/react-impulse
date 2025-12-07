import { z } from "zod"

import { ImpulseFormShape, type ImpulseFormShapeOptions, ImpulseFormUnit } from "../../src"
import { wait } from "../common"

const SLOWEST_ASYNC_MS = 3000

interface ValidatedShapeFields {
  _1: ImpulseFormUnit<string, ReadonlyArray<string>>
  _2: ImpulseFormUnit<number>
  _3: ImpulseFormShape<{
    _1: ImpulseFormUnit<boolean>
    _2: ImpulseFormUnit<Array<string>, ReadonlyArray<string>>
  }>
  _4: Array<string>
}

interface ShapeFields {
  _1: ImpulseFormUnit<string>
  _2: ImpulseFormUnit<number>
  _3: ImpulseFormShape<{
    _1: ImpulseFormUnit<boolean>
    _2: ImpulseFormUnit<Array<string>>
  }>
  _4: Array<string>
}

interface ThirdValueVerbose {
  readonly _1: boolean
  readonly _2: Array<string>
}

interface RootValueVerbose {
  readonly _1: string
  readonly _2: number
  readonly _3: ThirdValueVerbose
  readonly _4: Array<string>
}

function setup(options?: ImpulseFormShapeOptions<ValidatedShapeFields>) {
  return ImpulseFormShape(
    {
      _1: ImpulseFormUnit("", {
        schema: z.string().max(2),
      }),
      _2: ImpulseFormUnit(0),
      _3: ImpulseFormShape({
        _1: ImpulseFormUnit(true),
        _2: ImpulseFormUnit([""], {
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

it("matches the type signature", () => {
  const form = setup()

  expectTypeOf(form.onSubmit).toEqualTypeOf<
    (listener: (value: RootValueVerbose) => void | Promise<unknown>) => VoidFunction
  >()

  expectTypeOf(form.fields._3.onSubmit).toEqualTypeOf<
    (listener: (value: ThirdValueVerbose) => void | Promise<unknown>) => VoidFunction
  >()
})

describe.each<
  [
    string,
    (
      form: ImpulseFormShape<ValidatedShapeFields> | ImpulseFormShape<ShapeFields>,
    ) => Promise<unknown>,
  ]
>([
  ["root", (form) => form.submit()],
  ["root.fields.<ImpulseFormUnit>", (form) => form.fields._1.submit()],
  ["root.fields.<ImpulseFormShape>", (form) => form.fields._3.submit()],
  [
    "root.fields.<ImpulseFormShape>.fields.<ImpulseFormUnit>",
    (form) => form.fields._3.fields._1.submit(),
  ],
])("onSubmit(listener) when submitting via %s", (_, submit) => {
  it("provides validated value", () => {
    const form = setup()

    form.onSubmit((value) => {
      expectTypeOf(value).toEqualTypeOf<RootValueVerbose>()
    })
  })

  describe.each([
    // TODO ["root.fields.<ImpulseFormShape>"]
    [
      "root.fields.<ImpulseFormUnit>",
      () =>
        setup({
          input: {
            _1: "abc",
          },
        }),
    ],
    [
      "root.fields.<ImpulseFormShape>.fields.<ImpulseFormUnit>",
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
    it("does not call the listener", ({ monitor }) => {
      const form = setup()

      const listener = vi.fn()

      form.onSubmit(listener)

      submit(form)

      expect(form.isInvalid(monitor)).toBe(true)
      expect(listener).not.toHaveBeenCalled()
    })

    it("calls the focus listener", () => {
      const form = setup()

      const focus = vi.fn()

      form.fields._1.onFocusWhenInvalid(focus)
      form.fields._3.fields._2.onFocusWhenInvalid(focus)

      expect(focus).not.toHaveBeenCalled()

      submit(form)

      expect(focus).toHaveBeenCalledExactlyOnceWith([expect.any(String)])
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
      () =>
        ImpulseFormShape({
          _1: ImpulseFormUnit("value"),
          _2: ImpulseFormUnit(0),
          _3: ImpulseFormShape({
            _1: ImpulseFormUnit(true),
            _2: ImpulseFormUnit(["value"]),
          }),
          _4: ["anything"],
        }),
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
          input: {
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

    submit(form)

    expect(listener).toHaveBeenCalledExactlyOnceWith(value)
  })

  it("calls all listeners", () => {
    const form = setup()

    const listener1 = vi.fn()
    const listener2 = vi.fn()

    form.onSubmit(listener1)
    form.onSubmit(listener2)

    submit(form)

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
  })

  it("subscribes the same listener only once", () => {
    const form = setup()

    const listener = vi.fn()

    form.onSubmit(listener)
    form.onSubmit(listener)

    submit(form)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("calls a listener on every submit", () => {
    const form = setup()

    const listener = vi.fn()

    form.onSubmit(listener)

    submit(form)
    form.submit()
    form.fields._1.submit()
    form.fields._3.submit()
    form.fields._3.fields._1.submit()

    expect(listener).toHaveBeenCalledTimes(5)
  })

  it("does not call a listener after it is unsubscribed", () => {
    const form = setup()

    const listener = vi.fn()

    const unsubscribe = form.onSubmit(listener)

    submit(form)

    expect(listener).toHaveBeenCalledTimes(1)
    listener.mockClear()

    unsubscribe()

    submit(form)

    expect(listener).not.toHaveBeenCalled()
  })

  it("unsubscribes the same listener as many times as it's been subscribed", () => {
    const form = setup()

    const listener = vi.fn()

    const unsubscribe1 = form.onSubmit(listener)
    const unsubscribe2 = form.onSubmit(listener)
    const unsubscribe3 = form.onSubmit(listener)

    submit(form)
    expect(listener).toHaveBeenCalled()
    listener.mockClear()
    unsubscribe1()

    submit(form)
    expect(listener).toHaveBeenCalled()
    listener.mockClear()
    unsubscribe2()

    submit(form)
    expect(listener).toHaveBeenCalled()
    listener.mockClear()
    unsubscribe3()

    submit(form)
    expect(listener).not.toHaveBeenCalled()
  })

  it("waits the slowest listener", async ({ monitor }) => {
    const form = setup()

    const done1 = vi.fn()
    const done2 = vi.fn()
    const done3 = vi.fn()
    const allDone = vi.fn()

    form.onSubmit(() => wait(0.25 * SLOWEST_ASYNC_MS).then(done1))
    form.onSubmit(() => wait(0.5 * SLOWEST_ASYNC_MS).then(done2))
    form.onSubmit(() => wait(SLOWEST_ASYNC_MS).then(done3))

    submit(form).then(allDone)

    await vi.advanceTimersByTimeAsync(0.25 * SLOWEST_ASYNC_MS)
    expect(done1).toHaveBeenCalledOnce()
    expect(done2).not.toHaveBeenCalled()
    expect(done3).not.toHaveBeenCalled()
    expect(allDone).not.toHaveBeenCalled()
    expect(form.isSubmitting(monitor)).toBe(true)

    await vi.advanceTimersByTimeAsync(0.25 * SLOWEST_ASYNC_MS)
    expect(done1).toHaveBeenCalledOnce()
    expect(done2).toHaveBeenCalledOnce()
    expect(done3).not.toHaveBeenCalled()
    expect(allDone).not.toHaveBeenCalled()
    expect(form.isSubmitting(monitor)).toBe(true)

    await vi.advanceTimersByTimeAsync(0.5 * SLOWEST_ASYNC_MS)
    expect(done1).toHaveBeenCalledOnce()
    expect(done2).toHaveBeenCalledOnce()
    expect(done3).toHaveBeenCalledOnce()
    expect(allDone).toHaveBeenCalledOnce()
    expect(form.isSubmitting(monitor)).toBe(false)
  })

  it("calls the listeners for each field", () => {
    const form = setup({
      input: {
        _1: "x",
        _2: 567,
        _3: {
          _1: false,
          _2: ["y"],
        },
      },
    })

    const listener1 = vi.fn()
    const listener2 = vi.fn()
    const listener3 = vi.fn()
    const listener31 = vi.fn()
    const listener32 = vi.fn()

    form.fields._1.onSubmit(listener1)
    form.fields._2.onSubmit(listener2)
    form.fields._3.onSubmit(listener3)
    form.fields._3.fields._1.onSubmit(listener31)
    form.fields._3.fields._2.onSubmit(listener32)

    submit(form)

    expect(listener1).toHaveBeenCalledExactlyOnceWith("x")
    expect(listener2).toHaveBeenCalledExactlyOnceWith(567)
    expect(listener3).toHaveBeenCalledExactlyOnceWith({
      _1: false,
      _2: ["y"],
    })
    expect(listener31).toHaveBeenCalledExactlyOnceWith(false)
    expect(listener32).toHaveBeenCalledExactlyOnceWith(["y"])
  })
})
