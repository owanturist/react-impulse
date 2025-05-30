import type { GetImpulseFormFlag, ImpulseForm } from "../impulse-form"

export type ImpulseFormListFlag<TElement extends ImpulseForm> =
  | boolean
  | ReadonlyArray<GetImpulseFormFlag<TElement>>
