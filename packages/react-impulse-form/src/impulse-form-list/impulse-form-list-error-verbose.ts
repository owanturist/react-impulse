import type { GetImpulseFormErrorVerbose } from "../impulse-form/get-impulse-form-error-verbose"
import type { ImpulseForm } from "../impulse-form/impulse-form"

export { isShallowArrayEqual as isImpulseFormListErrorVerboseEqual } from "~/tools/is-shallow-array-equal"

export type ImpulseFormListErrorVerbose<TElement extends ImpulseForm> =
  ReadonlyArray<GetImpulseFormErrorVerbose<TElement>>
