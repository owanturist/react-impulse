import { batch } from "@owanturist/signal"

import { isUndefined } from "~/tools/is-undefined"
import { map } from "~/tools/map"

import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormListErrorSetter } from "./impulse-form-list-error-setter"
import type { ImpulseFormListFlagSetter } from "./impulse-form-list-flag-setter"
import type { ImpulseFormListInputSetter } from "./impulse-form-list-input-setter"
import type { ImpulseFormListValidateOnSetter } from "./impulse-form-list-validate-on-setter"
import { ImpulseFormList as ImpulseFormListImpl } from "./_internal/impulse-form-list"
import { ImpulseFormListState } from "./_internal/impulse-form-list-state"

type ImpulseFormList<TElement extends ImpulseForm> = ImpulseFormListImpl<TElement>

interface ImpulseFormListOptions<TElement extends ImpulseForm> {
  readonly input?: ImpulseFormListInputSetter<TElement>
  readonly initial?: ImpulseFormListInputSetter<TElement>
  readonly touched?: ImpulseFormListFlagSetter<TElement>
  readonly validateOn?: ImpulseFormListValidateOnSetter<TElement>
  readonly error?: ImpulseFormListErrorSetter<TElement>
}

function ImpulseFormList<TElement extends ImpulseForm>(
  elements: ReadonlyArray<TElement>,
  { input, initial, touched, validateOn, error }: ImpulseFormListOptions<TElement> = {},
): ImpulseFormList<TElement> {
  const state = new ImpulseFormListState<TElement>(
    null,
    map(elements, ImpulseFormListImpl._getState),
  )

  batch((scope) => {
    if (!isUndefined(input)) {
      state._setInput(scope, input)
    }

    if (!isUndefined(initial)) {
      state._setInitial(scope, initial)
    }

    if (!isUndefined(touched)) {
      state._setTouched(scope, touched)
    }

    if (!isUndefined(validateOn)) {
      state._setValidateOn(scope, validateOn)
    }

    if (!isUndefined(error)) {
      state._setError(scope, error)
    }
  })

  return state._host()
}

export type { ImpulseFormListOptions }
export { ImpulseFormList }
