import type { Compute } from "~/tools/compute"

import type { ImpulseForm, ImpulseFormParams } from "../impulse-form"
import type { GetImpulseFormParam } from "../impulse-form"

import type { ImpulseFormOptionalSchema } from "./impulse-form-optional-schema"

export type ImpulseFormOptionalVerboseParam<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
  TKey extends keyof ImpulseFormParams,
> = Compute<
  ImpulseFormOptionalSchema<
    GetImpulseFormParam<TEnabled, TKey>,
    GetImpulseFormParam<TElement, TKey>
  >
>
