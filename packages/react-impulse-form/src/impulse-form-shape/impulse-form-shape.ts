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
  input?: ImpulseFormShapeInputSetter<TFields>
  initial?: ImpulseFormShapeInputSetter<TFields>
  touched?: ImpulseFormShapeFlagSetter<TFields>
  validateOn?: ImpulseFormShapeValidateOnSetter<TFields>
  error?: ImpulseFormShapeErrorSetter<TFields>
}

export function ImpulseFormShape<TFields extends ImpulseFormShapeFields>(
  fields: Readonly<TFields>,
  {
    input,
    initial,
    touched,
    validateOn,
    error,
  }: ImpulseFormShapeOptions<TFields> = {},
): ImpulseFormShape<TFields> {
  const shape = new ImpulseFormShapeImpl(null, fields)

  batch(() => {
    if (!isUndefined(touched)) {
      shape.setTouched(touched)
    }

    if (!isUndefined(initial)) {
      shape.setInitial(initial)
    }

    if (!isUndefined(input)) {
      shape.setInput(input)
    }

    if (!isUndefined(validateOn)) {
      shape.setValidateOn(validateOn)
    }

    // TODO add test against null
    if (!isUndefined(error)) {
      shape.setError(error)
    }
  })

  return shape
}
