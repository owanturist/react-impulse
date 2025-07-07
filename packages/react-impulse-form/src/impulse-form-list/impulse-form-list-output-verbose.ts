import type { GetImpulseFormOutputVerbose, ImpulseForm } from "../impulse-form"

export { isShallowArrayEqual as isImpulseFormListOutputVerboseEqual } from "~/tools/is-shallow-array-equal"

export type ImpulseFormListOutputVerbose<TElement extends ImpulseForm> =
  ReadonlyArray<GetImpulseFormOutputVerbose<TElement>>
