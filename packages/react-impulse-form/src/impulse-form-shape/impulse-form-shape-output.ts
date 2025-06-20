import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"

import { createNullableCompare } from "../create-nullable-compare"

import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeOutput<TFields extends ImpulseFormShapeFields> =
  GetImpulseFormShapeParam<TFields, "output.schema">

export const isImpulseFormShapeOutputEqual =
  createNullableCompare(isShallowObjectEqual)
