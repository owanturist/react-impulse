import {
  type RefObject,
  useEffect,
  isFunction,
  isDefined,
} from "./dependencies"
import { type Func, useHandler } from "./utils"
import type { ImpulseForm } from "./ImpulseForm"
import type { ImpulseFormValue } from "./ImpulseFormValue"
import {
  type UseImpulseFormOptions,
  type UseImpulseFormResult,
  useImpulseForm,
} from "./useImpulseForm"

export interface UseImpulseFormValueOptions<TForm extends ImpulseForm>
  extends UseImpulseFormOptions<TForm> {
  /**
   * @default true
   */
  shouldFocusWhenInvalid?: boolean
  onFocusInvalid?:
    | RefObject<null | undefined | HTMLElement>
    | Func<[errors: ReadonlyArray<string>, form: TForm]>
}

export interface UseImpulseFormValueResult extends UseImpulseFormResult {}

export const useImpulseFormValue = <TOriginalValue, TValue = TOriginalValue>(
  form: ImpulseFormValue<TOriginalValue, TValue>,
  {
    shouldFocusWhenInvalid = true,
    onFocusInvalid,
    ...options
  }: UseImpulseFormValueOptions<typeof form> = {},
): UseImpulseFormValueResult => {
  const onFocusInvalidStable = useHandler(
    isFunction(onFocusInvalid)
      ? onFocusInvalid
      : isDefined(onFocusInvalid)
        ? () => onFocusInvalid.current?.focus()
        : null,
  )

  useEffect(() => {
    if (shouldFocusWhenInvalid && isDefined(onFocusInvalidStable)) {
      return form.onFocusWhenInvalid((errors) => {
        onFocusInvalidStable(errors, form)
      })
    }
  }, [form, onFocusInvalidStable, shouldFocusWhenInvalid])

  return useImpulseForm(form, options)
}
