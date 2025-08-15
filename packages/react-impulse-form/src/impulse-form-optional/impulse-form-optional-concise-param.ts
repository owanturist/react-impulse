import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"

import type { ImpulseFormOptionalVerboseSchema } from "./impulse-form-optional-verbose-schema"

export type ImpulseFormOptionalConciseParam<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
  TKey extends keyof ImpulseFormParams,
  TConcise,
> =
  | TConcise
  | ImpulseFormOptionalVerboseSchema<
      TConcise | GetImpulseFormParam<TEnabled, TKey>,
      TConcise | GetImpulseFormParam<TElement, TKey>
    >
