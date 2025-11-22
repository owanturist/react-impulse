import type { GetImpulseFormOutputVerbose } from "../impulse-form/get-impulse-form-output-verbose"
import type { ImpulseForm } from "../impulse-form/impulse-form"

type ImpulseFormListOutputVerbose<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormOutputVerbose<TElement>
>

export type { ImpulseFormListOutputVerbose }
