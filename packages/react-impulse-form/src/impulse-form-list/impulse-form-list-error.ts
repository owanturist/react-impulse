import { isNull } from "~/tools/is-null"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"

import { createUnionCompare } from "../create-union-compare"
import type { GetImpulseFormError } from "../impulse-form/get-impulse-form-error"
import type { ImpulseForm } from "../impulse-form/impulse-form"

export type ImpulseFormListError<TElement extends ImpulseForm> =
  null | ReadonlyArray<GetImpulseFormError<TElement>>

export const isImpulseFormListErrorEqual = createUnionCompare(
  isNull,
  isShallowArrayEqual,
)
