import { z } from "zod"

import { FormShape, type FormShapeOptions, FormUnit } from "../../src"

function setup(
  options?: FormShapeOptions<{
    _1: FormUnit<string, ReadonlyArray<string>>
    _2: FormUnit<number, ReadonlyArray<string>>
    _3: FormShape<{
      _1: FormUnit<undefined | boolean, ReadonlyArray<string>, boolean>
      _2: FormUnit<Array<string>, ReadonlyArray<string>>
    }>
    _4: Array<string>
  }>,
) {
  const form = FormShape(
    {
      _1: FormUnit("", {
        schema: z.string().min(2),
      }),
      _2: FormUnit(0, {
        schema: z.number().min(1),
      }),
      _3: FormShape({
        _1: FormUnit<undefined | boolean>(undefined, {
          schema: z.boolean(),
        }),
        _2: FormUnit([""], {
          schema: z.array(z.string()).min(2),
        }),
      }),
      _4: ["anything"],
    },
    {
      touched: true,
      ...options,
    },
  )

  const listener1 = vi.fn()
  const listener2 = vi.fn()
  const listener3x1 = vi.fn()
  const listener3x2 = vi.fn()

  form.fields._1.onFocusWhenInvalid(listener1)
  form.fields._2.onFocusWhenInvalid(listener2)
  form.fields._3.fields._1.onFocusWhenInvalid(listener3x1)
  form.fields._3.fields._2.onFocusWhenInvalid(listener3x2)

  return [
    form,
    {
      listener1,
      listener2,
      listener3x1,
      listener3x2,
    },
  ] as const
}

it("matches the type signature", () => {
  const [form] = setup()

  expectTypeOf(form.focusFirstInvalid).toEqualTypeOf<VoidFunction>()
  expectTypeOf(form.fields._3.focusFirstInvalid).toEqualTypeOf<VoidFunction>()
})

describe("focusFirstInvalid()", () => {
  it("calls a single validated field's listener", () => {
    const [form, { listener1, listener2, listener3x1, listener3x2 }] = setup()

    form.focusFirstInvalid()

    expect(listener1).toHaveBeenCalledOnce()
    expect(listener2).not.toHaveBeenCalled()
    expect(listener3x1).not.toHaveBeenCalled()
    expect(listener3x2).not.toHaveBeenCalled()
  })

  it("calls the first validated field's listener", () => {
    const [form, { listener1, listener2, listener3x1, listener3x2 }] = setup({
      touched: {
        _2: true,
        _3: true,
      },
    })

    form.focusFirstInvalid()

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).toHaveBeenCalledOnce()
    expect(listener3x1).not.toHaveBeenCalled()
    expect(listener3x2).not.toHaveBeenCalled()
  })

  it("calls the first validated nested field's listener", () => {
    const [form, { listener1, listener2, listener3x1, listener3x2 }] = setup({
      touched: {
        _3: true,
      },
    })

    form.focusFirstInvalid()

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).not.toHaveBeenCalled()
    expect(listener3x1).toHaveBeenCalledOnce()
    expect(listener3x2).not.toHaveBeenCalled()
  })

  it("calls the only validated nested field's listener", () => {
    const [form, { listener1, listener2, listener3x1, listener3x2 }] = setup({
      touched: {
        _3: {
          _2: true,
        },
      },
    })

    form.focusFirstInvalid()

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).not.toHaveBeenCalled()
    expect(listener3x1).not.toHaveBeenCalled()
    expect(listener3x2).toHaveBeenCalledOnce()
  })
})

describe("fields.*.focusFirstInvalid()", () => {
  it("calls the first validated field's listener", () => {
    const [form, { listener1, listener2, listener3x1, listener3x2 }] = setup({
      touched: {
        _3: true,
      },
    })

    form.fields._3.focusFirstInvalid()

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).not.toHaveBeenCalled()
    expect(listener3x1).toHaveBeenCalledOnce()
    expect(listener3x2).not.toHaveBeenCalled()
  })

  it("does not call parent's validated fields when it is not validated itself", () => {
    const [form, { listener1, listener2, listener3x1, listener3x2 }] = setup({
      touched: {
        _1: true,
        _2: true,
      },
    })

    form.fields._3.focusFirstInvalid()

    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).not.toHaveBeenCalled()
    expect(listener3x1).not.toHaveBeenCalled()
    expect(listener3x2).not.toHaveBeenCalled()
  })
})

describe("with onFocusWhenInvalid()", () => {
  it("does nothing when fields are empty", () => {
    const form = FormShape({})
    const listener0 = vi.fn()

    form.onFocusWhenInvalid(listener0)
    form.focusFirstInvalid()
    expect(listener0).not.toHaveBeenCalled()
  })

  it("does not call a listener when fields are not validated", () => {
    const form = FormShape({
      _1: FormUnit("", {
        schema: z.string(),
      }),
    })

    const listener0 = vi.fn()

    form.onFocusWhenInvalid(listener0)
    form.focusFirstInvalid()
    expect(listener0).not.toHaveBeenCalled()
  })

  it("does not call a listener when fields are valid", () => {
    const form = FormShape({
      _1: FormUnit("valid", {
        validateOn: "onInit",
        schema: z.string().min(2),
      }),
    })

    const listener0 = vi.fn()

    form.onFocusWhenInvalid(listener0)
    form.focusFirstInvalid()
    expect(listener0).not.toHaveBeenCalled()
  })

  it("calls a listener when a field is not valid", () => {
    const form = FormShape({
      _1: FormUnit("", {
        validateOn: "onInit",
        schema: z.string().min(2),
      }),
    })

    const listener0 = vi.fn()

    form.onFocusWhenInvalid(listener0)
    form.focusFirstInvalid()
    expect(listener0).toHaveBeenCalledExactlyOnceWith({
      _1: [expect.any(String)],
    })
  })

  it("does not call a listener when a field is invalid and has own listener", () => {
    const form = FormShape({
      _1: FormUnit("", {
        validateOn: "onInit",
        schema: z.string().min(2),
      }),
    })

    const listener0 = vi.fn()
    const listener1 = vi.fn()

    form.onFocusWhenInvalid(listener0)
    form.fields._1.onFocusWhenInvalid(listener1)
    form.focusFirstInvalid()

    expect(listener0).not.toHaveBeenCalled()
    expect(listener1).toHaveBeenCalledExactlyOnceWith([expect.any(String)])
  })
})
