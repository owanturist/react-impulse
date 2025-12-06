import type { GetImpulseFormFlagVerbose } from "../impulse-form/get-impulse-form-flag-verbose"
import type { ImpulseForm } from "../impulse-form/impulse-form"

type ImpulseFormListFlagVerbose<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormFlagVerbose<TElement>
>

export type { ImpulseFormListFlagVerbose }
