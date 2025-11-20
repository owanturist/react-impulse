import type { GetImpulseFormValidateOnVerbose, ImpulseForm } from "../impulse-form"

export type ImpulseFormListValidateOnVerbose<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormValidateOnVerbose<TElement>
>
