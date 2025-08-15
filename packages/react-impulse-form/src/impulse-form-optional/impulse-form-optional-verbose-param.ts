import type { Compute } from "~/tools/compute"

import type { ImpulseForm, ImpulseFormParams } from "../impulse-form"
import type { GetImpulseFormParam } from "../impulse-form"

import type { ImpulseFormOptionalVerboseSchema } from "./impulse-form-optional-verbose-schema"

export type ImpulseFormOptionalVerboseParam<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
  TKey extends keyof ImpulseFormParams,
> = Compute<
  ImpulseFormOptionalVerboseSchema<
    GetImpulseFormParam<TEnabled, TKey>,
    GetImpulseFormParam<TElement, TKey>
  >
>
