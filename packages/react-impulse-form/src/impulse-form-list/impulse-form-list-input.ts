import type { GetImpulseFormInput, ImpulseForm } from "../impulse-form"

export type ImpulseFormListInput<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormInput<TElement>
>
