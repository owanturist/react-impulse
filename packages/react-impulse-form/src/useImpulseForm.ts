import { type Scope, useEffect, useMemo, isDefined } from "./dependencies"
import { useHandler } from "./utils"
import type { GetImpulseFormParam, ImpulseForm } from "./ImpulseForm"

export interface UseImpulseFormOptions<TForm extends ImpulseForm> {
  onSubmit?(
    value: GetImpulseFormParam<TForm, "value.schema.verbose">,
  ): void | Promise<unknown>
}

export interface UseImpulseFormResult {
  submit(this: void): void
  getSubmitCount(this: void, scope: Scope): number
  isSubmitting(this: void, scope: Scope): boolean
}

export const useImpulseForm = <TForm extends ImpulseForm>(
  form: TForm,
  { onSubmit }: UseImpulseFormOptions<TForm> = {},
): UseImpulseFormResult => {
  const onSubmitStable = useHandler(onSubmit)

  useEffect(() => {
    if (isDefined(onSubmitStable)) {
      return form.onSubmit(
        onSubmitStable as (value: unknown) => void | Promise<unknown>,
      )
    }
  }, [form, onSubmitStable])

  const { getSubmitCount, isSubmitting } = useMemo(
    () => ({
      getSubmitCount: (scope: Scope) => form.getSubmitCount(scope),
      isSubmitting: (scope: Scope) => form.isSubmitting(scope),
    }),
    [form],
  )

  return {
    getSubmitCount,
    isSubmitting,
    submit: useHandler(() => {
      void form.submit()
    }),
  }
}
