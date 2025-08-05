import { isUndefined } from "~/tools/is-undefined"

import { batch } from "../dependencies"

import { ImpulseFormShape as ImpulseFormShapeImpl } from "./_impulse-form-shape"
import type { ImpulseFormShapeErrorSetter } from "./impulse-form-shape-error-setter"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"
import type { ImpulseFormShapeFlagSetter } from "./impulse-form-shape-flag-setter"
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
  const state = ImpulseFormShapeImpl._createState(fields)

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
