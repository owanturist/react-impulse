import type {
  GetImpulseFormValidateOnVerbose,
  ImpulseForm,
} from "../impulse-form"

export { isShallowArrayEqual as isImpulseFormListValidateOnVerboseEqual } from "~/tools/is-shallow-array-equal"

export type ImpulseFormListValidateOnVerbose<TElement extends ImpulseForm> =
  ReadonlyArray<GetImpulseFormValidateOnVerbose<TElement>>
