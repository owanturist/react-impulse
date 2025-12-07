import { batch } from "@owanturist/signal"

import type { IsEqualType } from "~/tools/is-type-equal"
import { isUndefined } from "~/tools/is-undefined"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalErrorSetter } from "./impulse-form-optional-error-setter"
import type { ImpulseFormOptionalFlagSetter } from "./impulse-form-optional-flag-setter"
import type { ImpulseFormOptionalInputSetter } from "./impulse-form-optional-input-setter"
import type { ImpulseFormOptionalValidateOnSetter } from "./impulse-form-optional-validate-on-setter"
import { ImpulseFormOptional as ImpulseFormOptionalImpl } from "./_internal/impulse-form-optional"
import { ImpulseFormOptionalState } from "./_internal/impulse-form-optional-state"

type ImpulseFormOptional<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalImpl<TEnabled, TElement>

interface ImpulseFormOptionalOptions<TEnabled extends ImpulseForm, TElement extends ImpulseForm> {
  input?: ImpulseFormOptionalInputSetter<TEnabled, TElement>
  initial?: ImpulseFormOptionalInputSetter<TEnabled, TElement>
  touched?: ImpulseFormOptionalFlagSetter<TEnabled, TElement>
  validateOn?: ImpulseFormOptionalValidateOnSetter<TEnabled, TElement>
  error?: ImpulseFormOptionalErrorSetter<TEnabled, TElement>
}

function ImpulseFormOptional<TEnabled extends ImpulseForm, TElement extends ImpulseForm>(
  enabled: IsEqualType<GetImpulseFormParam<TEnabled, "output.schema">, boolean> extends true
    ? TEnabled
    : never,
  element: TElement,
  {
    input,
    initial,
    touched,
    validateOn,
    error,
  }: ImpulseFormOptionalOptions<TEnabled, TElement> = {},
): ImpulseFormOptional<TEnabled, TElement> {
  const optional = new ImpulseFormOptionalState<TEnabled, TElement>(
    null,
    ImpulseFormOptionalImpl._getState(enabled),
    ImpulseFormOptionalImpl._getState(element),
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

  return optional._host() as ImpulseFormOptional<TEnabled, TElement>
}

export type { ImpulseFormOptionalOptions }
export { ImpulseFormOptional }
