import { isNull } from "~/tools/is-null"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"

import { createUnionCompare } from "../create-union-compare"
import type { GetImpulseFormOutput, ImpulseForm } from "../impulse-form"

export type ImpulseFormListOutput<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormOutput<TElement>
>

export const isImpulseFormListOutputEqual = createUnionCompare(
  isNull,
  isShallowArrayEqual,
)
