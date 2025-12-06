import type { GetImpulseFormFlag } from "../impulse-form/get-impulse-form-flag"
import type { ImpulseForm } from "../impulse-form/impulse-form"

type ImpulseFormListFlag<TElement extends ImpulseForm> =
  | boolean
  | ReadonlyArray<GetImpulseFormFlag<TElement>>

export type { ImpulseFormListFlag }
