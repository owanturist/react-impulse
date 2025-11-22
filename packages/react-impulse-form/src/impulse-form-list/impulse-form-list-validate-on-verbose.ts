import type { GetImpulseFormValidateOnVerbose, ImpulseForm } from "../impulse-form"

type ImpulseFormListValidateOnVerbose<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormValidateOnVerbose<TElement>
>

export type { ImpulseFormListValidateOnVerbose }
