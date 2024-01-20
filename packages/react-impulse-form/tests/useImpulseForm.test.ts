import { renderHook } from "@testing-library/react"
import { z } from "zod"

import {
  type UseImpulseFormOptions,
  type ImpulseForm,
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

it("passes valid values to onSubmit", () => {
  setup(
    ImpulseFormShape.of({
      first: ImpulseFormValue.of("1", { schema: z.string().pipe(z.number()) }),
      second: ImpulseFormValue.of(true),
    }),
    {
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
    },
  )

  setup(ImpulseFormValue.of("1"), {
    onFocus(errors, form) {
      expectTypeOf(errors).toEqualTypeOf<ReadonlyArray<string>>()
      expectTypeOf(form).toEqualTypeOf<ImpulseFormValue<string>>()
    },
  })
})
