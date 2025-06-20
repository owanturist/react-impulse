import { isBoolean } from "~/tools/is-boolean"
import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"

import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeFlag<TFields extends ImpulseFormShapeFields> =
  | boolean
  | GetImpulseFormShapeParam<TFields, "flag.schema">

export function isImpulseFormShapeFlagEqual<
  TFields extends ImpulseFormShapeFields,
>(
  left: ImpulseFormShapeFlag<TFields>,
  right: ImpulseFormShapeFlag<TFields>,
): boolean {
  if (isBoolean(left) || isBoolean(right)) {
    return left === right
  }

  return isShallowObjectEqual(left, right)
}
