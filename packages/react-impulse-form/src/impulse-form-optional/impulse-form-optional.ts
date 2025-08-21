import type { IsEqualType } from "~/tools/is-type-equal"
import { isUndefined } from "~/tools/is-undefined"

import { batch } from "../dependencies"
import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import { ImpulseFormOptional as ImpulseFormOptionalImpl } from "./_impulse-form-optional"
import { ImpulseFormOptionalState } from "./_impulse-form-optional-state"
import type { ImpulseFormOptionalErrorSetter } from "./impulse-form-optional-error-setter"
import type { ImpulseFormOptionalFlagSetter } from "./impulse-form-optional-flag-setter"
import type { ImpulseFormOptionalInputSetter } from "./impulse-form-optional-input-setter"
import type { ImpulseFormOptionalValidateOnSetter } from "./impulse-form-optional-validate-on-setter"

export type ImpulseFormOptional<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalImpl<TEnabled, TElement>

export interface ImpulseFormOptionalOptions<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> {
  input?: ImpulseFormOptionalInputSetter<TEnabled, TElement>
  initial?: ImpulseFormOptionalInputSetter<TEnabled, TElement>
  touched?: ImpulseFormOptionalFlagSetter<TEnabled, TElement>
  validateOn?: ImpulseFormOptionalValidateOnSetter<TEnabled, TElement>
  error?: ImpulseFormOptionalErrorSetter<TEnabled, TElement>
}

export function ImpulseFormOptional<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
>(
  enabled: IsEqualType<
    GetImpulseFormParam<TEnabled, "output.schema">,
    boolean
  > extends true
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

  batch((scope) => {
    if (!isUndefined(touched)) {
      optional._setTouched(scope, touched)
    }

    if (!isUndefined(initial)) {
      optional._setInitial(scope, initial)
    }

    if (!isUndefined(input)) {
      optional._setInput(scope, input)
    }

    if (!isUndefined(validateOn)) {
      optional._setValidateOn(scope, validateOn)
    }

    if (!isUndefined(error)) {
      optional._setError(scope, error)
    }
  })

  return optional._host() as ImpulseFormOptional<TEnabled, TElement>
}
