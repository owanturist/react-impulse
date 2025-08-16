import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"

import type { ImpulseFormOptionalSchema } from "./impulse-form-optional-schema"

console.log(
  "TODO: if TConcise fallbacks to never, then the ImpulseFormOptionalConciseParam is equal to ImpulseFormOptionalVerboseParam, so they can merge into one type ImpulseFormOptionalParam",
)

export type ImpulseFormOptionalConciseParam<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
  TKey extends keyof ImpulseFormParams,
  TConcise,
> =
  | TConcise
  | ImpulseFormOptionalSchema<
      TConcise | GetImpulseFormParam<TEnabled, TKey>,
      TConcise | GetImpulseFormParam<TElement, TKey>
    >
