import type { GetImpulseFormErrorVerbose, ImpulseForm } from "../impulse-form"

type ImpulseFormListErrorVerbose<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormErrorVerbose<TElement>
>

export type { ImpulseFormListErrorVerbose }
