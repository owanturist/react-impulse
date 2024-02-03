import {
  type Scope,
  useEffect,
  useMemo,
  useScoped,
  untrack,
  isDefined,
} from "./dependencies"
import { useHandler } from "./utils"
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
  const context = useScoped((scope) => form._getContext(scope), [form])

  useEffect(() => {
    if (context == null) {
      // TODO make sure the context setup only to the root
      form._setContext(new ImpulseFormContext(form))
    }
  }, [context, form])

  useEffect(() => {
    if (!isDefined(context) || !isDefined(onSubmitStable)) {
      return
    }

    context._onSubmit(async () => {
      return untrack((scope) => {
        form.setTouched(true)

        if (form.isValid(scope)) {
          return onSubmitStable(
            form.getValue(scope) as GetImpulseFormParam<TForm, "value.schema">,
            form,
          )
        }

        context._focusFirstInvalidValue()
      })
    })
  }, [context, form, onSubmitStable])

  const { getSubmitCount, isSubmitting } = useMemo(
    () => ({
      getSubmitCount: (scope: Scope) => context?._getSubmitCount(scope) ?? 0,
      isSubmitting: (scope: Scope) => context?._isSubmitting(scope) ?? false,
    }),
    [context],
  )

  return {
    getSubmitCount,
    isSubmitting,
    submit: useHandler(() => {
      void context?._submit()
    }),
  }
}
