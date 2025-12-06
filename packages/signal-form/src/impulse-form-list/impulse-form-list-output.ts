import type { GetImpulseFormOutput } from "../impulse-form/get-impulse-form-output"
import type { ImpulseForm } from "../impulse-form/impulse-form"

type ImpulseFormListOutput<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormOutput<TElement>
>

export type { ImpulseFormListOutput }
