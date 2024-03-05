import {
  type RefObject,
  useEffect,
  isFunction,
  isDefined,
} from "./dependencies"
import { type Func, useHandler } from "./utils"
import type { ImpulseForm } from "./ImpulseForm"
import type { ImpulseFormValue } from "./ImpulseFormValue"
import { type UseImpulseFormOptions, useImpulseForm } from "./useImpulseForm"

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

export const useImpulseFormValue = <TOriginalValue, TValue = TOriginalValue>(
  form: ImpulseFormValue<TOriginalValue, TValue>,
  {
    shouldFocusWhenInvalid = true,
    onFocusInvalid,
    onSubmit,
  }: UseImpulseFormValueOptions<typeof form> = {},
): void => {
  const onFocusInvalidStable = useHandler(
    !shouldFocusWhenInvalid
      ? null
      : isFunction(onFocusInvalid)
        ? onFocusInvalid
        : isDefined(onFocusInvalid)
          ? () => onFocusInvalid.current?.focus()
          : null,
  )

  useEffect(() => {
    if (isDefined(onFocusInvalidStable)) {
      return form.onFocusWhenInvalid((errors) => {
        onFocusInvalidStable(errors, form)
      })
    }
  }, [form, onFocusInvalidStable])

  useImpulseForm(form, { onSubmit })
}
