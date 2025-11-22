import type { GetImpulseFormError, ImpulseForm } from "../impulse-form"

type ImpulseFormListError<TElement extends ImpulseForm> = null | ReadonlyArray<
  GetImpulseFormError<TElement>
>

export type { ImpulseFormListError }
