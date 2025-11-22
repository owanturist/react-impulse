import type { GetImpulseFormFlagVerbose, ImpulseForm } from "../impulse-form"

type ImpulseFormListFlagVerbose<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormFlagVerbose<TElement>
>

export type { ImpulseFormListFlagVerbose }
