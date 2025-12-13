import { batch } from "@owanturist/signal"

import type { IsEqualType } from "~/tools/is-type-equal"
import { isUndefined } from "~/tools/is-undefined"

import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormOptionalErrorSetter } from "./impulse-form-optional-error-setter"
import type { FormOptionalFlagSetter } from "./impulse-form-optional-flag-setter"
import type { FormOptionalInputSetter } from "./impulse-form-optional-input-setter"
import type { FormOptionalValidateOnSetter } from "./impulse-form-optional-validate-on-setter"
import { FormOptional as FormOptionalImpl } from "./_internal/impulse-form-optional"
import { FormOptionalState } from "./_internal/impulse-form-optional-state"

type FormOptional<TEnabled extends SignalForm, TElement extends SignalForm> = FormOptionalImpl<
  TEnabled,
  TElement
>

interface FormOptionalOptions<TEnabled extends SignalForm, TElement extends SignalForm> {
  input?: FormOptionalInputSetter<TEnabled, TElement>
  initial?: FormOptionalInputSetter<TEnabled, TElement>
  touched?: FormOptionalFlagSetter<TEnabled, TElement>
  validateOn?: FormOptionalValidateOnSetter<TEnabled, TElement>
  error?: FormOptionalErrorSetter<TEnabled, TElement>
}

function FormOptional<TEnabled extends SignalForm, TElement extends SignalForm>(
  enabled: IsEqualType<GetSignalFormParam<TEnabled, "output.schema">, boolean> extends true
    ? TEnabled
    : never,
  element: TElement,
  { input, initial, touched, validateOn, error }: FormOptionalOptions<TEnabled, TElement> = {},
): FormOptional<TEnabled, TElement> {
  const optional = new FormOptionalState<TEnabled, TElement>(
    null,
    FormOptionalImpl._getState(enabled),
    FormOptionalImpl._getState(element),
  )

  batch((monitor) => {
    if (!isUndefined(touched)) {
      optional._setTouched(monitor, touched)
    }

    if (!isUndefined(initial)) {
      optional._setInitial(monitor, initial)
    }

    if (!isUndefined(input)) {
      optional._setInput(monitor, input)
    }

    if (!isUndefined(validateOn)) {
      optional._setValidateOn(monitor, validateOn)
    }

    if (!isUndefined(error)) {
      optional._setError(monitor, error)
    }
  })

  return optional._host() as FormOptional<TEnabled, TElement>
}

export type { FormOptionalOptions }
export { FormOptional }
