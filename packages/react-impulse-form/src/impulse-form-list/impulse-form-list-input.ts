import type { GetImpulseFormInput } from "../impulse-form/get-impulse-form-input"
import type { ImpulseForm } from "../impulse-form/impulse-form"

type ImpulseFormListInput<TElement extends ImpulseForm> = ReadonlyArray<
  GetImpulseFormInput<TElement>
>

export type { ImpulseFormListInput }
