import { isBoolean } from "~/tools/is-boolean"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"

import { createUnionCompare } from "../create-union-compare"
import type { GetImpulseFormFlag, ImpulseForm } from "../impulse-form"

export type ImpulseFormListFlag<TElement extends ImpulseForm> =
  | boolean
  | ReadonlyArray<GetImpulseFormFlag<TElement>>

export const isImpulseFormListFlagEqual = createUnionCompare(
  isBoolean,
  isShallowArrayEqual,
)
