import type { GetImpulseFormFlag, ImpulseForm } from "../impulse-form"

type ImpulseFormListFlag<TElement extends ImpulseForm> =
  | boolean
  | ReadonlyArray<GetImpulseFormFlag<TElement>>

export type { ImpulseFormListFlag }
