import { useEffect } from "./dependencies"
import { isUndefined, useHandler } from "./utils"
import type { GetImpulseFormParam, ImpulseForm } from "./ImpulseForm"

export interface UseImpulseFormOptions<TForm extends ImpulseForm> {
  onSubmit?(
    this: void,
    output: GetImpulseFormParam<TForm, "output.schema">,
    form: TForm,
  ): void | Promise<unknown>
}

export const useImpulseForm = <TForm extends ImpulseForm>(
  form: TForm,
  { onSubmit }: UseImpulseFormOptions<TForm> = {},
): void => {
  const onSubmitStable = useHandler(onSubmit)

  useEffect(() => {
    if (isUndefined(onSubmitStable)) {
      return undefined
    }

    return form.onSubmit((output) => {
      return onSubmitStable(
        output as GetImpulseFormParam<TForm, "output.schema">,
        form,
      )
    })
  }, [form, onSubmitStable])
}
