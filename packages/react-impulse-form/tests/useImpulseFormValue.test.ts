import { renderHook } from "@testing-library/react"
import { z } from "zod"

import {
  type UseImpulseFormValueOptions,
  ImpulseFormValue,
  useImpulseFormValue,
} from "../src"

const setup = <TInput, TOutput = TInput>(
  form: ImpulseFormValue<TInput, TOutput>,
  options?: UseImpulseFormValueOptions<ImpulseFormValue<TInput, TOutput>>,
) => {
  return renderHook((props) => useImpulseFormValue(props.form, props.options), {
    initialProps: { form, options },
  })
}

it("passes valid types to onFocusInvalid", () => {
  const form = ImpulseFormValue.of("", {
    schema: z.string().pipe(z.coerce.number()),
  })

  setup(form, {
    onFocusInvalid: (errors, form) => {
      expectTypeOf(errors).toEqualTypeOf<ReadonlyArray<string>>()

      expectTypeOf(form).toEqualTypeOf<ImpulseFormValue<string, number>>()
    },
  })
})

it("passes valid types to onSubmit", () => {
  const form = ImpulseFormValue.of("", {
    schema: z.string().pipe(z.coerce.number()),
  })

  setup(form, {
    onSubmit: (value, form) => {
      expectTypeOf(value).toEqualTypeOf<number>()

      expectTypeOf(form).toEqualTypeOf<ImpulseFormValue<string, number>>()
    },
  })
})

it("passes valid values and form to onSubmit", () => {
  const form = ImpulseFormValue.of("1", {
    schema: z.string().pipe(z.coerce.number()),
  })

  const onSubmit = vi.fn()

  setup(form, { onSubmit })

  expect(onSubmit).not.toHaveBeenCalled()

  void form.submit()

  expect(onSubmit).toHaveBeenCalledOnce()
  expect(onSubmit).toHaveBeenCalledWith(1, form)
})

it("passes errors and form to onFocusInvalid", () => {
  const form = ImpulseFormValue.of("1234", {
    schema: z.string().max(2),
    touched: true,
  })

  const onFocusInvalid = vi.fn()

  setup(form, { onFocusInvalid })

  expect(onFocusInvalid).not.toHaveBeenCalled()

  form.focusFirstInvalidValue()

  expect(onFocusInvalid).toHaveBeenCalledOnce()
  expect(onFocusInvalid).toHaveBeenCalledWith(
    ["String must contain at most 2 character(s)"],
    form,
  )
})

it("does not subscribe the listener when shouldFocusWhenInvalid=false", () => {
  const form = ImpulseFormValue.of("1234", {
    schema: z.string().max(2),
    touched: true,
  })

  const listener = vi.fn()

  const { rerender } = setup(form, {
    shouldFocusWhenInvalid: false,
    onFocusInvalid: listener,
  })

  form.focusFirstInvalidValue()
  expect(listener).not.toHaveBeenCalled()

  rerender({
    form,
    options: { shouldFocusWhenInvalid: true, onFocusInvalid: listener },
  })
  form.focusFirstInvalidValue()
  expect(listener).toHaveBeenCalledOnce()
  vi.clearAllMocks()

  rerender({
    form,
    options: { shouldFocusWhenInvalid: false, onFocusInvalid: listener },
  })
  form.focusFirstInvalidValue()
  expect(listener).not.toHaveBeenCalled()

  rerender({
    form,
    options: { onFocusInvalid: listener },
  })
  form.focusFirstInvalidValue()
  expect(listener).toHaveBeenCalledOnce()
})

it("unsubscribes the listener when the component is unmounted", () => {
  const form = ImpulseFormValue.of("1234", {
    schema: z.string().max(2),
    touched: true,
  })

  const listener = vi.fn()

  const { unmount } = setup(form, { onFocusInvalid: listener })

  unmount()

  form.focusFirstInvalidValue()

  expect(listener).not.toHaveBeenCalled()
})

it("unsubscribes the listener when the form re-renders with nullable listener", () => {
  const form = ImpulseFormValue.of("1234", {
    schema: z.string().max(2),
    touched: true,
  })

  const listener = vi.fn()

  const { rerender } = setup(form, { onFocusInvalid: listener })

  rerender({ form, options: { onFocusInvalid: undefined } })

  form.focusFirstInvalidValue()

  expect(listener).not.toHaveBeenCalled()
})

it("changes listener when the form re-renders", () => {
  const form = ImpulseFormValue.of("1234", {
    schema: z.string().max(2),
    touched: true,
  })

  const listener_1 = vi.fn()
  const listener_2 = vi.fn()

  const { rerender } = setup(form, { onFocusInvalid: listener_1 })

  rerender({ form, options: { onFocusInvalid: listener_2 } })

  form.focusFirstInvalidValue()

  expect(listener_1).not.toHaveBeenCalled()
  expect(listener_2).toHaveBeenCalledOnce()
})

it("subscribes only ones when the form re-renders with the same listener", () => {
  const form = ImpulseFormValue.of("1234", {
    schema: z.string().max(2),
    touched: true,
  })
  const spy_onFocusInvalid = vi.spyOn(form, "onFocusWhenInvalid")

  const listener = vi.fn()

  const { rerender } = setup(form, { onFocusInvalid: listener })
  expect(spy_onFocusInvalid).toHaveBeenCalledTimes(1)

  rerender({ form, options: { onFocusInvalid: listener } })
  expect(spy_onFocusInvalid).toHaveBeenCalledTimes(1)

  form.focusFirstInvalidValue()
  expect(spy_onFocusInvalid).toHaveBeenCalledTimes(1)
})

it("subscribes only ones when the form re-renders with different listener", () => {
  const form = ImpulseFormValue.of("1234", {
    schema: z.string().max(2),
    touched: true,
  })
  const spy_onFocusInvalid = vi.spyOn(form, "onFocusWhenInvalid")

  const listener_1 = vi.fn()
  const listener_2 = vi.fn()

  const { rerender } = setup(form, { onFocusInvalid: listener_1 })
  expect(spy_onFocusInvalid).toHaveBeenCalledTimes(1)

  rerender({ form, options: { onFocusInvalid: listener_2 } })
  expect(spy_onFocusInvalid).toHaveBeenCalledTimes(1)

  form.focusFirstInvalidValue()
  expect(spy_onFocusInvalid).toHaveBeenCalledTimes(1)
})

it("calls ref.current.focus() when onFocusInvalid is a ref", () => {
  const form = ImpulseFormValue.of("1234", {
    schema: z.string().max(2),
    touched: true,
  })

  const node = document.createElement("input")
  const spy_focus = vi.spyOn(node, "focus")

  setup(form, { onFocusInvalid: { current: node } })

  expect(spy_focus).not.toHaveBeenCalled()

  form.focusFirstInvalidValue()

  expect(spy_focus).toHaveBeenCalledOnce()
})

it("calls node.focus() when onFocusInvalid is a HTMLElement", () => {
  const form = ImpulseFormValue.of("1234", {
    schema: z.string().max(2),
    touched: true,
  })

  const node = document.createElement("input")
  const spy_focus = vi.spyOn(node, "focus")

  setup(form, { onFocusInvalid: node })

  expect(spy_focus).not.toHaveBeenCalled()

  form.focusFirstInvalidValue()

  expect(spy_focus).toHaveBeenCalledOnce()
})

it.each([null, undefined, { current: null }, { current: undefined }])(
  "does not throw when onFocusInvalid is %j",
  (ref) => {
    const form = ImpulseFormValue.of("1234", {
      schema: z.string().max(2),
      touched: true,
    })

    setup(form, { onFocusInvalid: ref })

    expect(() => form.focusFirstInvalidValue()).not.toThrow()
  },
)
