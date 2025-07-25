import { isUndefined } from "~/tools/is-undefined"
import { map } from "~/tools/map"

import { Impulse, batch, untrack } from "../dependencies"
import type { ImpulseForm } from "../impulse-form"

import { ImpulseFormList as ImpulseFormListImpl } from "./_impulse-form-list"
import type { ImpulseFormListErrorSetter } from "./impulse-form-list-error-setter"
import type { ImpulseFormListFlagSetter } from "./impulse-form-list-flag-setter"
import { isImpulseFormListInputEqual } from "./impulse-form-list-input"
import type { ImpulseFormListInputSetter } from "./impulse-form-list-input-setter"
import type { ImpulseFormListValidateOnSetter } from "./impulse-form-list-validate-on-setter"

export type ImpulseFormList<TElement extends ImpulseForm> =
  ImpulseFormListImpl<TElement>

export interface ImpulseFormListOptions<TElement extends ImpulseForm> {
  readonly input?: ImpulseFormListInputSetter<TElement>
  readonly initial?: ImpulseFormListInputSetter<TElement>
  readonly touched?: ImpulseFormListFlagSetter<TElement>
  readonly validateOn?: ImpulseFormListValidateOnSetter<TElement>
  readonly error?: ImpulseFormListErrorSetter<TElement>
}

export function ImpulseFormList<TElement extends ImpulseForm>(
  elements: ReadonlyArray<TElement>,
  {
    input,
    initial,
    touched,
    validateOn,
    error,
  }: ImpulseFormListOptions<TElement> = {},
): ImpulseFormList<TElement> {
  const elementsInitials = Impulse(
    map(elements, (element) => untrack(element._state._initial)),
    {
      compare: isImpulseFormListInputEqual,
    },
  )

  const list = new ImpulseFormListImpl(null, elementsInitials, elements)

  batch((scope) => {
    if (!isUndefined(input)) {
      list._state._setInput(scope, input)
    }

    if (!isUndefined(initial)) {
      list._state._setInitial(scope, initial)
    }

    if (!isUndefined(touched)) {
      list._state._setTouched(scope, touched)
    }

    if (!isUndefined(validateOn)) {
      list._state._setValidateOn(scope, validateOn)
    }

    if (!isUndefined(error)) {
      list._state._setError(scope, error)
    }
  })

  return list
}
