import { z } from "zod"

import {
  type ImpulseFormShapeOptions,
  ImpulseFormShape,
  ImpulseFormValue,
} from "../../src"

const setup = (
  options?: ImpulseFormShapeOptions<{
    _1: ImpulseFormValue<string>
    _2: ImpulseFormValue<number>
    _3: ImpulseFormShape<{
      _1: ImpulseFormValue<undefined | boolean, boolean>
      _2: ImpulseFormValue<Array<string>>
    }>
    _4: Array<string>
  }>,
) => {
  const form = ImpulseFormShape.of(
    {
      _1: ImpulseFormValue.of("", {
        schema: z.string().min(2),
      }),
      _2: ImpulseFormValue.of(0, {
        schema: z.number().min(1),
      }),
      _3: ImpulseFormShape.of({
        _1: ImpulseFormValue.of<undefined | boolean>(undefined, {
          schema: z.boolean(),
        }),
        _2: ImpulseFormValue.of([""], {
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

describe("focusFirstInvalidValue()", () => {
  it("calls a single validated field's listener", () => {
    const [form, { listener_1, listener_2, listener_3_1, listener_3_2 }] =
      setup()

    form.focusFirstInvalidValue()

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

    form.focusFirstInvalidValue()

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

    form.focusFirstInvalidValue()

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

    form.focusFirstInvalidValue()

    expect(listener_1).not.toHaveBeenCalled()
    expect(listener_2).not.toHaveBeenCalled()
    expect(listener_3_1).not.toHaveBeenCalled()
    expect(listener_3_2).toHaveBeenCalledOnce()
  })
})

describe("fields.*.focusFirstInvalidValue()", () => {
  it("calls the first validated field's listener", () => {
    const [form, { listener_1, listener_2, listener_3_1, listener_3_2 }] =
      setup({
        touched: {
          _3: true,
        },
      })

    form.fields._3.focusFirstInvalidValue()

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

    form.fields._3.focusFirstInvalidValue()

    expect(listener_1).not.toHaveBeenCalled()
    expect(listener_2).not.toHaveBeenCalled()
    expect(listener_3_1).not.toHaveBeenCalled()
    expect(listener_3_2).not.toHaveBeenCalled()
  })
})
