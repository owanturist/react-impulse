import type { GetImpulseFormInput, ImpulseForm } from "../impulse-form"

type ImpulseFormListInput<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormInput<TElement>
>

export type { ImpulseFormListInput }
