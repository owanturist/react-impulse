import type { GetImpulseFormValidateOnVerbose } from "../impulse-form/get-impulse-form-validate-on-verbose"
import type { ImpulseForm } from "../impulse-form/impulse-form"

type ImpulseFormListValidateOnVerbose<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormValidateOnVerbose<TElement>
>

export type { ImpulseFormListValidateOnVerbose }
