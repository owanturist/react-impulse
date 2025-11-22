import type { GetImpulseFormOutputVerbose, ImpulseForm } from "../impulse-form"

type ImpulseFormListOutputVerbose<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormOutputVerbose<TElement>
>

export type { ImpulseFormListOutputVerbose }
