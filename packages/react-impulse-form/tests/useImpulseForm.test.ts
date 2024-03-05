import { renderHook } from "@testing-library/react"
import { z } from "zod"

import {
  type ImpulseForm,
  type UseImpulseFormOptions,
  ImpulseFormShape,
  useImpulseForm,
  ImpulseFormValue,
} from "../src"

const setup = <TForm extends ImpulseForm>(
  form: TForm,
  options?: UseImpulseFormOptions<TForm>,
) => {
  return renderHook((props) => useImpulseForm(props.form, props.options), {
    initialProps: { form, options },
  })
}

it("passes valid types to onSubmit", () => {
  const form = ImpulseFormShape.of({
    first: ImpulseFormValue.of("1", {
      schema: z.string().pipe(z.coerce.number()),
    }),
    second: ImpulseFormValue.of(true),
  })

  setup(form, {
    onSubmit: (value, form) => {
      expectTypeOf(value).toEqualTypeOf<{
        readonly first: number
        readonly second: boolean
      }>()

      expectTypeOf(form).toEqualTypeOf<
        ImpulseFormShape<{
          first: ImpulseFormValue<string, number>
          second: ImpulseFormValue<boolean>
        }>
      >()
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

it("unsubscribes the listener when the component is unmounted", () => {
  const form = ImpulseFormValue.of("value")

  const listener = vi.fn()

  const { unmount } = setup(form, { onSubmit: listener })

  unmount()

  void form.submit()

  expect(listener).not.toHaveBeenCalled()
})

it("unsubscribes the listener when the form re-renders with nullable listener", () => {
  const form = ImpulseFormValue.of("value")

  const listener = vi.fn()

  const { rerender } = setup(form, { onSubmit: listener })

  rerender({ form, options: { onSubmit: undefined } })

  void form.submit()

  expect(listener).not.toHaveBeenCalled()
})

it("changes listener when the form re-renders", () => {
  const form = ImpulseFormValue.of("value")

  const listener_1 = vi.fn()
  const listener_2 = vi.fn()

  const { rerender } = setup(form, { onSubmit: listener_1 })

  rerender({ form, options: { onSubmit: listener_2 } })

  void form.submit()

  expect(listener_1).not.toHaveBeenCalled()
  expect(listener_2).toHaveBeenCalledOnce()
})

it("subscribes only ones when the form re-renders with the same listener", () => {
  const form = ImpulseFormValue.of("value")
  const spy_onSubmit = vi.spyOn(form, "onSubmit")

  const listener = vi.fn()

  const { rerender } = setup(form, { onSubmit: listener })
  expect(spy_onSubmit).toHaveBeenCalledTimes(1)

  rerender({ form, options: { onSubmit: listener } })
  expect(spy_onSubmit).toHaveBeenCalledTimes(1)

  void form.submit()
  expect(spy_onSubmit).toHaveBeenCalledTimes(1)
})

it("subscribes only ones when the form re-renders with different listener", () => {
  const form = ImpulseFormValue.of("value")
  const spy_onSubmit = vi.spyOn(form, "onSubmit")

  const listener_1 = vi.fn()
  const listener_2 = vi.fn()

  const { rerender } = setup(form, { onSubmit: listener_1 })
  expect(spy_onSubmit).toHaveBeenCalledTimes(1)

  rerender({ form, options: { onSubmit: listener_2 } })
  expect(spy_onSubmit).toHaveBeenCalledTimes(1)

  void form.submit()
  expect(spy_onSubmit).toHaveBeenCalledTimes(1)
})
