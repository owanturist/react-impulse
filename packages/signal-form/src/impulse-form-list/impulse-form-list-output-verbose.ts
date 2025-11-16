import type { GetImpulseFormOutputVerbose, ImpulseForm } from "../impulse-form"

export type ImpulseFormListOutputVerbose<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormOutputVerbose<TElement>
>
