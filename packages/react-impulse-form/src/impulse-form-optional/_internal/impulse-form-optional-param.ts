import type { GetImpulseFormParam, ImpulseForm, ImpulseFormParams } from "../../impulse-form"
import type { ImpulseFormOptionalSchema } from "../impulse-form-optional-schema"

type ImpulseFormOptionalParam<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
  TKey extends keyof ImpulseFormParams,
  TConcise = never,
> =
  | TConcise
  | ImpulseFormOptionalSchema<
      TConcise | GetImpulseFormParam<TEnabled, TKey>,
      TConcise | GetImpulseFormParam<TElement, TKey>
    >

export type { ImpulseFormOptionalParam }
