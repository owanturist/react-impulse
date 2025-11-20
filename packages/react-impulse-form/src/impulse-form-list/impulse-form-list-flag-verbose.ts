import type { GetImpulseFormFlagVerbose, ImpulseForm } from "../impulse-form"

export type ImpulseFormListFlagVerbose<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormFlagVerbose<TElement>
>
