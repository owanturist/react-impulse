import { type RefObject, useEffect } from "./dependencies"
import {
  type Func,
  useHandler,
  isHtmlElement,
  isPresent,
  isNull,
  isFunction,
} from "./utils"
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
    | null
    | undefined
    | HTMLElement
    | RefObject<null | undefined | HTMLElement>
    | Func<[errors: ReadonlyArray<string>, form: TForm]>
}

const normalizeOnFocusInvalid = <TArgs extends ReadonlyArray<unknown>>(
  onFocusInvalid:
    | HTMLElement
    | RefObject<null | undefined | HTMLElement>
    | Func<TArgs>,
): null | Func<TArgs> => {
  if (isFunction(onFocusInvalid)) {
    return onFocusInvalid
  }

  return () => {
    if (isHtmlElement(onFocusInvalid)) {
      onFocusInvalid.focus()
    } else if (isHtmlElement(onFocusInvalid.current)) {
      onFocusInvalid.current.focus()
    }
  }
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
    shouldFocusWhenInvalid && isPresent(onFocusInvalid)
      ? normalizeOnFocusInvalid(onFocusInvalid)
      : null,
  )

  useEffect(() => {
    if (!isNull(onFocusInvalidStable)) {
      return form.onFocusWhenInvalid((errors) => {
        onFocusInvalidStable(errors, form)
      })
    }
  }, [form, onFocusInvalidStable])

  useImpulseForm(form, { onSubmit })
}
