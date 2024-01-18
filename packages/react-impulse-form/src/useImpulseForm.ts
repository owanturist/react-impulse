import { isDefined, useHandler } from "./utils"
import {
  type Scope,
  useEffect,
  useMemo,
  useScoped,
  untrack,
} from "./dependencies"
import type { GetImpulseFormParam, ImpulseForm } from "./ImpulseForm"
import { ImpulseFormContext } from "./ImpulseFormContext"

export interface UseImpulseFormOptions<TForm extends ImpulseForm> {
  onSubmit?(
    value: GetImpulseFormParam<TForm, "value.schema">,
    form: TForm,
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
  const context = useScoped((scope) => form.getContext(scope), [form])

  useEffect(() => {
    if (context == null) {
      // TODO make sure the context setup only to the root
      form.setContext(new ImpulseFormContext(form))
    }
  }, [context, form])

  useEffect(() => {
    if (!isDefined(context) || !isDefined(onSubmitStable)) {
      return
    }

    context.onSubmit(async () => {
      form.setTouched(true)

      return untrack((scope) => {
        if (form.isValid(scope)) {
          return onSubmitStable(
            form.getValue(scope) as GetImpulseFormParam<TForm, "value.schema">,
            form,
          )
        }

        context.focusFirstInvalidValue()
      })
    })
  }, [context, form, onSubmitStable])

  const { getSubmitCount, isSubmitting } = useMemo(
    () => ({
      getSubmitCount: (scope: Scope) => context?.getSubmitCount(scope) ?? 0,
      isSubmitting: (scope: Scope) => context?.isSubmitting(scope) ?? false,
    }),
    [context],
  )

  return {
    getSubmitCount,
    isSubmitting,
    submit: useHandler(() => {
      void context?.submit()
    }),
  }
}
