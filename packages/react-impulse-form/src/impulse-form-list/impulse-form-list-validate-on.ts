import type { GetImpulseFormValidateOn } from "../impulse-form/get-impulse-form-validate-on"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

type ImpulseFormListValidateOn<TElement extends ImpulseForm> =
  | ValidateStrategy
  | ReadonlyArray<GetImpulseFormValidateOn<TElement>>

export type { ImpulseFormListValidateOn }
