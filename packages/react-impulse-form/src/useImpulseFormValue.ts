import { type RefObject, useEffect } from "react"
import { isDefined, isFunction } from "remeda"

import type { Func } from "~/tools/func"
import { useStableCallback } from "~/tools/use-stable-callback"

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

export interface UseImpulseFormValueResult<TForm extends ImpulseForm>
  extends UseImpulseFormResult<TForm> {}

export const useImpulseFormValue = <TOriginalValue, TValue = TOriginalValue>(
  form: ImpulseFormValue<TOriginalValue, TValue>,
  {
    shouldFocusWhenInvalid = true,
    onFocusInvalid,
    ...options
  }: UseImpulseFormValueOptions<typeof form> = {},
): UseImpulseFormValueResult<typeof form> => {
  const tools = useImpulseForm(form, options)

  const onFocusInvalidStable = useStableCallback(
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
