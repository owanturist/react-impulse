import { isBoolean } from "~/tools/is-boolean"
import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"

import { createUnionCompare } from "../create-union-compare"

import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeFlag<TFields extends ImpulseFormShapeFields> =
  | boolean
  | GetImpulseFormShapeParam<TFields, "flag.schema">

export const isImpulseFormShapeFlagEqual = createUnionCompare(
  isBoolean,
  isShallowObjectEqual,
)
