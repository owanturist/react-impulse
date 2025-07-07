import type { GetImpulseFormFlagVerbose, ImpulseForm } from "../impulse-form"

export { isShallowArrayEqual as isImpulseFormListFlagVerboseEqual } from "~/tools/is-shallow-array-equal"

export type ImpulseFormListFlagVerbose<TElement extends ImpulseForm> =
  ReadonlyArray<GetImpulseFormFlagVerbose<TElement>>
