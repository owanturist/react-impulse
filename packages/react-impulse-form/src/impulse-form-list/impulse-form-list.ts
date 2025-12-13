import { batch } from "@owanturist/signal"

import { isUndefined } from "~/tools/is-undefined"
import { map } from "~/tools/map"

import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormListErrorSetter } from "./impulse-form-list-error-setter"
import type { FormListFlagSetter } from "./impulse-form-list-flag-setter"
import type { FormListInputSetter } from "./impulse-form-list-input-setter"
import type { FormListValidateOnSetter } from "./impulse-form-list-validate-on-setter"
import { FormList as FormListImpl } from "./_internal/impulse-form-list"
import { FormListState } from "./_internal/impulse-form-list-state"

type FormList<TElement extends SignalForm> = FormListImpl<TElement>

interface FormListOptions<TElement extends SignalForm> {
  readonly input?: FormListInputSetter<TElement>
  readonly initial?: FormListInputSetter<TElement>
  readonly touched?: FormListFlagSetter<TElement>
  readonly validateOn?: FormListValidateOnSetter<TElement>
  readonly error?: FormListErrorSetter<TElement>
}

function FormList<TElement extends SignalForm>(
  elements: ReadonlyArray<TElement>,
  { input, initial, touched, validateOn, error }: FormListOptions<TElement> = {},
): FormList<TElement> {
  const state = new FormListState<TElement>(null, map(elements, FormListImpl._getState))

  batch((monitor) => {
    if (!isUndefined(input)) {
      state._setInput(monitor, input)
    }

    if (!isUndefined(initial)) {
      state._setInitial(monitor, initial)
    }

    if (!isUndefined(touched)) {
      state._setTouched(monitor, touched)
    }

    if (!isUndefined(validateOn)) {
      state._setValidateOn(monitor, validateOn)
    }

    if (!isUndefined(error)) {
      state._setError(monitor, error)
    }
  })

  return state._host()
}

export type { FormListOptions }
export { FormList }
