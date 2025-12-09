import { Signal, batch } from "@owanturist/signal"

import { isUndefined } from "~/tools/is-undefined"
import { mapValues } from "~/tools/map-values"
import { partitionEntries } from "~/tools/partition-entries"

import { isSignalForm } from "../signal-form/is-signal-form"

import type { FormShapeErrorSetter } from "./form-shape-error-setter"
import type { FormShapeFields } from "./form-shape-fields"
import type { FormShapeFlagSetter } from "./form-shape-flag-setter"
import type { FormShapeInputSetter } from "./form-shape-input-setter"
import type { FormShapeValidateOnSetter } from "./form-shape-validate-on-setter"
import { FormShape as FormShapeImpl } from "./_internal/form-shape"
import {
  FormShapeState,
  type FormShapeStateFields,
  type FormShapeStateMeta,
} from "./_internal/form-shape-state"

type FormShape<TFields extends FormShapeFields> = FormShapeImpl<TFields>

interface FormShapeOptions<TFields extends FormShapeFields> {
  readonly input?: FormShapeInputSetter<TFields>
  readonly initial?: FormShapeInputSetter<TFields>
  readonly touched?: FormShapeFlagSetter<TFields>
  readonly validateOn?: FormShapeValidateOnSetter<TFields>
  readonly error?: FormShapeErrorSetter<TFields>
}

function FormShape<TFields extends FormShapeFields>(
  fields: TFields,
  { input, initial, touched, validateOn, error }: FormShapeOptions<TFields> = {},
): FormShape<TFields> {
  const [forms, meta] = partitionEntries(fields, isSignalForm)

  const state = new FormShapeState(
    null,

    mapValues(forms, FormShapeImpl._getState) as unknown as FormShapeStateFields<TFields>,

    mapValues(meta, (field) => Signal(field)) as unknown as FormShapeStateMeta<TFields>,
  )

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

export type { FormShapeOptions }
export { FormShape }
