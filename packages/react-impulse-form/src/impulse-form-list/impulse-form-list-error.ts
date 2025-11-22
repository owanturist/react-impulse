import type { GetImpulseFormError } from "../impulse-form/get-impulse-form-error"
import type { ImpulseForm } from "../impulse-form/impulse-form"

type ImpulseFormListError<TElement extends ImpulseForm> = null | ReadonlyArray<
  GetImpulseFormError<TElement>
>

export type { ImpulseFormListError }
