import { isNull } from "~/tools/is-null"
import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"

import { createUnionCompare } from "../create-union-compare"

import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeError<TFields extends ImpulseFormShapeFields> =
  null | GetImpulseFormShapeParam<TFields, "error.schema">

export const isImpulseFormShapeErrorEqual = createUnionCompare(
  isNull,
  isShallowObjectEqual,
)
