import { isUndefined } from "~/tools/is-undefined"
import { mapValues } from "~/tools/map-values"
import { partitionEntries } from "~/tools/partition-entries"

import { Impulse, batch } from "../_internal/dependencies"
import { isImpulseForm } from "../impulse-form"

import type { ImpulseFormShapeErrorSetter } from "./impulse-form-shape-error-setter"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeFlagSetter } from "./impulse-form-shape-flag-setter"
import type { ImpulseFormShapeInputSetter } from "./impulse-form-shape-input-setter"
import type { ImpulseFormShapeValidateOnSetter } from "./impulse-form-shape-validate-on-setter"
import { ImpulseFormShape as ImpulseFormShapeImpl } from "./_internal/impulse-form-shape"
import {
  ImpulseFormShapeState,
  type ImpulseFormShapeStateFields,
  type ImpulseFormShapeStateMeta,
} from "./_internal/impulse-form-shape-state"

type ImpulseFormShape<TFields extends ImpulseFormShapeFields> = ImpulseFormShapeImpl<TFields>

interface ImpulseFormShapeOptions<TFields extends ImpulseFormShapeFields> {
  readonly input?: ImpulseFormShapeInputSetter<TFields>
  readonly initial?: ImpulseFormShapeInputSetter<TFields>
  readonly touched?: ImpulseFormShapeFlagSetter<TFields>
  readonly validateOn?: ImpulseFormShapeValidateOnSetter<TFields>
  readonly error?: ImpulseFormShapeErrorSetter<TFields>
}

function ImpulseFormShape<TFields extends ImpulseFormShapeFields>(
  fields: TFields,
  { input, initial, touched, validateOn, error }: ImpulseFormShapeOptions<TFields> = {},
): ImpulseFormShape<TFields> {
  const [forms, meta] = partitionEntries(fields, isImpulseForm)

  const state = new ImpulseFormShapeState(
    null,

    mapValues(
      forms,
      ImpulseFormShapeImpl._getState,
    ) as unknown as ImpulseFormShapeStateFields<TFields>,

    mapValues(meta, (field) => Impulse(field)) as unknown as ImpulseFormShapeStateMeta<TFields>,
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

export type { ImpulseFormShapeOptions }
export { ImpulseFormShape }
