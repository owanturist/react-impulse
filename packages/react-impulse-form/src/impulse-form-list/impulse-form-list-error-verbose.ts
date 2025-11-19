import type { GetImpulseFormErrorVerbose } from "../impulse-form/get-impulse-form-error-verbose"
import type { ImpulseForm } from "../impulse-form/impulse-form"

export type ImpulseFormListErrorVerbose<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormErrorVerbose<TElement>
>
