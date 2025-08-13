import type { GetImpulseFormValidateOn, ImpulseForm } from "../impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

export type ImpulseFormListValidateOn<TElement extends ImpulseForm> =
  | ValidateStrategy
  | ReadonlyArray<GetImpulseFormValidateOn<TElement>>
