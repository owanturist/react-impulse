import { isUndefined } from "~/tools/is-undefined"
import { mapValues } from "~/tools/map-values"

import { Impulse, batch, untrack } from "../dependencies"
import { isImpulseForm } from "../impulse-form"

import { ImpulseFormShape as ImpulseFormShapeImpl } from "./_impulse-form-shape"
import type { ImpulseFormShapeErrorSetter } from "./impulse-form-shape-error-setter"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeFlagSetter } from "./impulse-form-shape-flag-setter"
import { isImpulseFormShapeInputEqual } from "./impulse-form-shape-input"
import type { ImpulseFormShapeInputSetter } from "./impulse-form-shape-input-setter"
import type { ImpulseFormShapeValidateOnSetter } from "./impulse-form-shape-validate-on-setter"

export type ImpulseFormShape<TFields extends ImpulseFormShapeFields> =
  ImpulseFormShapeImpl<TFields>

export interface ImpulseFormShapeOptions<
  TFields extends ImpulseFormShapeFields,
> {
  readonly input?: ImpulseFormShapeInputSetter<TFields>
  readonly initial?: ImpulseFormShapeInputSetter<TFields>
  readonly touched?: ImpulseFormShapeFlagSetter<TFields>
  readonly validateOn?: ImpulseFormShapeValidateOnSetter<TFields>
  readonly error?: ImpulseFormShapeErrorSetter<TFields>
}

export function ImpulseFormShape<TFields extends ImpulseFormShapeFields>(
  fields: TFields,
  {
    input,
    initial,
    touched,
    validateOn,
    error,
  }: ImpulseFormShapeOptions<TFields> = {},
): ImpulseFormShape<TFields> {
  const fieldsInitials = Impulse(
    mapValues(fields, (field) => {
      return isImpulseForm(field) ? untrack(field._state._initial) : field
    }),
    {
      compare: isImpulseFormShapeInputEqual,
    },
  )

  const shape = new ImpulseFormShapeImpl(null, fieldsInitials, fields)

  batch((scope) => {
    if (!isUndefined(input)) {
      shape._state._setInput(scope, input)
    }

    if (!isUndefined(initial)) {
      shape._state._setInitial(scope, initial)
    }

    if (!isUndefined(touched)) {
      shape._state._setTouched(scope, touched)
    }

    if (!isUndefined(validateOn)) {
      shape._state._setValidateOn(scope, validateOn)
    }

    if (!isUndefined(error)) {
      shape._state._setError(scope, error)
    }
  })

  return shape
}
