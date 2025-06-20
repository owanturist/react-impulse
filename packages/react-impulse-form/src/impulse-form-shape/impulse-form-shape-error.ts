import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"

import { createNullableCompare } from "../create-nullable-compare"

import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeError<TFields extends ImpulseFormShapeFields> =
  null | GetImpulseFormShapeParam<TFields, "error.schema">

export const isImpulseFormShapeErrorEqual =
  createNullableCompare(isShallowObjectEqual)
