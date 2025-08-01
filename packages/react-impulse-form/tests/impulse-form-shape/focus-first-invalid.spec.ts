import { z } from "zod"

import {
  ImpulseFormShape,
  type ImpulseFormShapeOptions,
  ImpulseFormUnit,
} from "../../src"

function setup(
  options?: ImpulseFormShapeOptions<{
    _1: ImpulseFormUnit<string, ReadonlyArray<string>>
    _2: ImpulseFormUnit<number, ReadonlyArray<string>>
    _3: ImpulseFormShape<{
      _1: ImpulseFormUnit<undefined | boolean, ReadonlyArray<string>, boolean>
      _2: ImpulseFormUnit<Array<string>, ReadonlyArray<string>>
    }>
    _4: Array<string>
  }>,
) {
  const form = ImpulseFormShape(
    {
      _1: ImpulseFormUnit("", {
        schema: z.string().min(2),
      }),
      _2: ImpulseFormUnit(0, {
        schema: z.number().min(1),
      }),
      _3: ImpulseFormShape({
        _1: ImpulseFormUnit<undefined | boolean>(undefined, {
          schema: z.boolean(),
        }),
        _2: ImpulseFormUnit([""], {
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

  const listener_1 = vi.fn()
  const listener_2 = vi.fn()
  const listener_3_1 = vi.fn()
  const listener_3_2 = vi.fn()

  form.fields._1.onFocusWhenInvalid(listener_1)
  form.fields._2.onFocusWhenInvalid(listener_2)
  form.fields._3.fields._1.onFocusWhenInvalid(listener_3_1)
  form.fields._3.fields._2.onFocusWhenInvalid(listener_3_2)

  return [
    form,
    {
      listener_1,
      listener_2,
      listener_3_1,
      listener_3_2,
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
    const [form, { listener_1, listener_2, listener_3_1, listener_3_2 }] =
      setup()

    form.focusFirstInvalid()

    expect(listener_1).toHaveBeenCalledOnce()
    expect(listener_2).not.toHaveBeenCalled()
    expect(listener_3_1).not.toHaveBeenCalled()
    expect(listener_3_2).not.toHaveBeenCalled()
  })

  it("calls the first validated field's listener", () => {
    const [form, { listener_1, listener_2, listener_3_1, listener_3_2 }] =
      setup({
        touched: {
          _2: true,
          _3: true,
        },
      })

    form.focusFirstInvalid()

    expect(listener_1).not.toHaveBeenCalled()
    expect(listener_2).toHaveBeenCalledOnce()
    expect(listener_3_1).not.toHaveBeenCalled()
    expect(listener_3_2).not.toHaveBeenCalled()
  })

  it("calls the first validated nested field's listener", () => {
    const [form, { listener_1, listener_2, listener_3_1, listener_3_2 }] =
      setup({
        touched: {
          _3: true,
        },
      })

    form.focusFirstInvalid()

    expect(listener_1).not.toHaveBeenCalled()
    expect(listener_2).not.toHaveBeenCalled()
    expect(listener_3_1).toHaveBeenCalledOnce()
    expect(listener_3_2).not.toHaveBeenCalled()
  })

  it("calls the only validated nested field's listener", () => {
    const [form, { listener_1, listener_2, listener_3_1, listener_3_2 }] =
      setup({
        touched: {
          _3: {
            _2: true,
          },
        },
      })

    form.focusFirstInvalid()

    expect(listener_1).not.toHaveBeenCalled()
    expect(listener_2).not.toHaveBeenCalled()
    expect(listener_3_1).not.toHaveBeenCalled()
    expect(listener_3_2).toHaveBeenCalledOnce()
  })
})

describe("fields.*.focusFirstInvalid()", () => {
  it("calls the first validated field's listener", () => {
    const [form, { listener_1, listener_2, listener_3_1, listener_3_2 }] =
      setup({
        touched: {
          _3: true,
        },
      })

    form.fields._3.focusFirstInvalid()

    expect(listener_1).not.toHaveBeenCalled()
    expect(listener_2).not.toHaveBeenCalled()
    expect(listener_3_1).toHaveBeenCalledOnce()
    expect(listener_3_2).not.toHaveBeenCalled()
  })

  it("does not call parent's validated fields when it is not validated itself", () => {
    const [form, { listener_1, listener_2, listener_3_1, listener_3_2 }] =
      setup({
        touched: {
          _1: true,
          _2: true,
        },
      })

    form.fields._3.focusFirstInvalid()

    expect(listener_1).not.toHaveBeenCalled()
    expect(listener_2).not.toHaveBeenCalled()
    expect(listener_3_1).not.toHaveBeenCalled()
    expect(listener_3_2).not.toHaveBeenCalled()
  })
})

describe("with onFocusWhenInvalid()", () => {
  it("does nothing when fields are empty", () => {
    const form = ImpulseFormShape({})
    const listener_0 = vi.fn()

    form.onFocusWhenInvalid(listener_0)
    form.focusFirstInvalid()
    expect(listener_0).not.toHaveBeenCalled()
  })

  it("does not call a listener when fields are not validated", () => {
    const form = ImpulseFormShape({
      _1: ImpulseFormUnit("", {
        schema: z.string(),
      }),
    })

    const listener_0 = vi.fn()

    form.onFocusWhenInvalid(listener_0)
    form.focusFirstInvalid()
    expect(listener_0).not.toHaveBeenCalled()
  })

  it("does not call a listener when fields are valid", () => {
    const form = ImpulseFormShape({
      _1: ImpulseFormUnit("valid", {
        validateOn: "onInit",
        schema: z.string().min(2),
      }),
    })

    const listener_0 = vi.fn()

    form.onFocusWhenInvalid(listener_0)
    form.focusFirstInvalid()
    expect(listener_0).not.toHaveBeenCalled()
  })

  it("calls a listener when a field is not valid", () => {
    const form = ImpulseFormShape({
      _1: ImpulseFormUnit("", {
        validateOn: "onInit",
        schema: z.string().min(2),
      }),
    })

    const listener_0 = vi.fn()

    form.onFocusWhenInvalid(listener_0)
    form.focusFirstInvalid()
    expect(listener_0).toHaveBeenCalledExactlyOnceWith({
      _1: ["String must contain at least 2 character(s)"],
    })
  })

  it("does not call a listener when a field is invalid and has own listener", () => {
    const form = ImpulseFormShape({
      _1: ImpulseFormUnit("", {
        validateOn: "onInit",
        schema: z.string().min(2),
      }),
    })

    const listener_0 = vi.fn()
    const listener_1 = vi.fn()

    form.onFocusWhenInvalid(listener_0)
    form.fields._1.onFocusWhenInvalid(listener_1)
    form.focusFirstInvalid()

    expect(listener_0).not.toHaveBeenCalled()
    expect(listener_1).toHaveBeenCalledExactlyOnceWith([
      "String must contain at least 2 character(s)",
    ])
  })
})
