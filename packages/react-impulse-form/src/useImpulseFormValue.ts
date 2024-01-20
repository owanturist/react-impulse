import {
  type RefObject,
  useEffect,
  isDefined,
  isFunction,
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
  const tools = useImpulseForm(form, options)

  const onFocusInvalidStable = useHandler(
    isFunction(onFocusInvalid)
      ? onFocusInvalid
      : isDefined(onFocusInvalid)
        ? () => onFocusInvalid.current?.focus()
        : null,
  )

  useEffect(() => {
    if (isDefined(onFocusInvalidStable) && shouldFocusWhenInvalid) {
      form.setOnFocus((errors) => {
        onFocusInvalidStable(errors, form)
      })

      return () => {
        form.setOnFocus(null)
      }
    }
  }, [form, onFocusInvalidStable, shouldFocusWhenInvalid])

  return tools
}
