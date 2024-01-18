import { identity, isDefined } from "./utils"
import {
  type Scope,
  useEffect,
  useMemo,
  useScoped,
  batch,
} from "./dependencies"
import type { GetImpulseFormParam, ImpulseForm } from "./ImpulseForm"
import { ImpulseFormContext } from "./ImpulseFormContext"

export interface UseImpulseFormOptions<TForm extends ImpulseForm> {
  onSubmit?(
    value: GetImpulseFormParam<TForm, "value.schema">,
    form: TForm,
  ): void | Promise<unknown>
}

export interface UseImpulseFormResult<TForm extends ImpulseForm> {
  getErrors<TResult = GetImpulseFormParam<TForm, "errors.schema">>(
    this: void,
    scope: Scope,
    filters?: {
      touched?: boolean
      select?: (
        concise: GetImpulseFormParam<TForm, "errors.schema">,
        verbose: GetImpulseFormParam<TForm, "value.schema.verbose">,
      ) => TResult
    },
  ): null | TResult

  submit(this: void): void
  getSubmitCount(this: void, scope: Scope): number
  isSubmitting(this: void, scope: Scope): boolean
}

export const useImpulseForm = <TForm extends ImpulseForm>(
  form: TForm,
  { onSubmit }: UseImpulseFormOptions<TForm> = {},
): UseImpulseFormResult<TForm> => {
  const onSubmitStable = useStableCallback(onSubmit)
  const context = useScoped((localScope) => form.getContext(localScope), [form])

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

    return context.onSubmit(() => {
      let value

      // TODO [react-impulse@>=2.0.0]: Use untrack
      batch((localScope) => {
        form.setTouched(true)

        if (form.isValid(localScope)) {
          value = onSubmitStable(
            form.getValue(localScope) as GetImpulseFormParam<
              TForm,
              "value.schema"
            >,
            form,
          )
        } else {
          context.focusFirstInvalidValue()
        }
      })

      return Promise.resolve(value)
    })
  }, [context, form, onSubmitStable])

  const { getSubmitCount, isSubmitting } = useMemo(
    () => ({
      getSubmitCount: (scope: Scope) => context?.getSubmitCount(scope) ?? 0,
      isSubmitting: (scope: Scope) => context?.isSubmitting(scope) ?? false,
    }),
    [context],
  )

  const { getErrors } = useMemo(
    () => ({
      getErrors: <TResult = GetImpulseFormParam<TForm, "errors.schema">>(
        scope: Scope,
        {
          touched,
          select = identity,
        }: {
          touched?: boolean
          select?: (
            concise: GetImpulseFormParam<TForm, "errors.schema">,
            verbose: GetImpulseFormParam<TForm, "value.schema.verbose">,
          ) => TResult
        } = {},
      ) => {
        if (isDefined(touched) && touched !== form.isTouched(scope)) {
          return null
        }

        return form.getErrors(
          scope,
          (
            concise: GetImpulseFormParam<TForm, "errors.schema">,
            verbose: GetImpulseFormParam<TForm, "value.schema.verbose">,
          ) => {
            if (concise == null) {
              return null
            }

            return select(concise, verbose)
          },
        )
      },
    }),
    [form],
  )

  return {
    getErrors,
    getSubmitCount,
    isSubmitting,
    submit: useStableCallback(() => void context?.submit()),
  }
}
