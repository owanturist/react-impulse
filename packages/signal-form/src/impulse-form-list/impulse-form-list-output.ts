import type { GetImpulseFormOutput, ImpulseForm } from "../impulse-form"

export type ImpulseFormListOutput<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormOutput<TElement>
>
