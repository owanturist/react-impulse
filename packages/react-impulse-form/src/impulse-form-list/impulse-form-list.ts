import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { isUndefined } from "~/tools/is-undefined"

import { Impulse, batch } from "../dependencies"
import type { ImpulseForm } from "../impulse-form"

import { ImpulseFormList as ImpulseFormListImpl } from "./_impulse-form-list"
import type { ImpulseFormListErrorSetter } from "./impulse-form-list-error-setter"
import type { ImpulseFormListFlagSetter } from "./impulse-form-list-flag-setter"
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
  const list = new ImpulseFormListImpl(
    null,
    Impulse(elements, { compare: isShallowArrayEqual }),
  )

  batch(() => {
    if (!isUndefined(touched)) {
      list.setTouched(touched)
    }

    if (!isUndefined(initial)) {
      list.setInitial(initial)
    }

    if (!isUndefined(input)) {
      list.setInput(input)
    }

    if (!isUndefined(validateOn)) {
      list.setValidateOn(validateOn)
    }

    // TODO add test against null
    if (!isUndefined(error)) {
      list.setError(error)
    }
  })

  return list
}
