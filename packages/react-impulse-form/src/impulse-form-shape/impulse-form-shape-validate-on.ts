import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"
import { isString } from "~/tools/is-string"

import { createUnionCompare } from "../create-union-compare"
import type { ValidateStrategy } from "../validate-strategy"

import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export type ImpulseFormShapeValidateOn<TFields extends ImpulseFormShapeFields> =
  ValidateStrategy | GetImpulseFormShapeParam<TFields, "validateOn.schema">

export const isImpulseFormShapeValidateOnEqual = createUnionCompare(
  isString,
  isShallowObjectEqual,
)
