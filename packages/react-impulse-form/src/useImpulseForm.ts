import { useEffect } from "./dependencies"
import { isUndefined, useHandler } from "./utils"
import type { GetImpulseFormParam, ImpulseForm } from "./ImpulseForm"

export interface UseImpulseFormOptions<TForm extends ImpulseForm> {
  onSubmit?(
    this: void,
    value: GetImpulseFormParam<TForm, "value.schema">,
    form: TForm,
  ): void | Promise<unknown>
}

export const useImpulseForm = <TForm extends ImpulseForm>(
  form: TForm,
  { onSubmit }: UseImpulseFormOptions<TForm> = {},
): void => {
  const onSubmitStable = useHandler(onSubmit)

  useEffect(() => {
    if (!isUndefined(onSubmitStable)) {
      return form.onSubmit((value) => {
        return onSubmitStable(
          value as GetImpulseFormParam<TForm, "value.schema">,
          form,
        )
      })
    }
  }, [form, onSubmitStable])
}
