import type { GetImpulseFormErrorVerbose } from "../impulse-form/get-impulse-form-error-verbose"
import type { ImpulseForm } from "../impulse-form/impulse-form"

type ImpulseFormListErrorVerbose<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormErrorVerbose<TElement>
>

export type { ImpulseFormListErrorVerbose }
