import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"
import { isString } from "~/tools/is-string"

import type { ValidateStrategy } from "../validate-strategy"

import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeValidateOn<TFields extends ImpulseFormShapeFields> =
  ValidateStrategy | GetImpulseFormShapeParam<TFields, "validateOn.schema">

export function isImpulseFormShapeValidateOnEqual<
  TFields extends ImpulseFormShapeFields,
>(
  left: ImpulseFormShapeValidateOn<TFields>,
  right: ImpulseFormShapeValidateOn<TFields>,
): boolean {
  if (isString(left) || isString(right)) {
    return left === right
  }

  return isShallowObjectEqual(left, right)
}
