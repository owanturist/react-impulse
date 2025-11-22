import type { GetImpulseFormValidateOn, ImpulseForm } from "../impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

type ImpulseFormListValidateOn<TElement extends ImpulseForm> =
  | ValidateStrategy
  | ReadonlyArray<GetImpulseFormValidateOn<TElement>>

export type { ImpulseFormListValidateOn }
