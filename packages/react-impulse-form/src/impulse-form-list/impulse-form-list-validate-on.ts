import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { isString } from "~/tools/is-string"

import { createUnionCompare } from "../create-union-compare"
import type { GetImpulseFormValidateOn, ImpulseForm } from "../impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

export type ImpulseFormListValidateOn<TElement extends ImpulseForm> =
  | ValidateStrategy
  | ReadonlyArray<GetImpulseFormValidateOn<TElement>>

export const isImpulseFormListValidateOnEqual = createUnionCompare(
  isString,
  isShallowArrayEqual,
)
