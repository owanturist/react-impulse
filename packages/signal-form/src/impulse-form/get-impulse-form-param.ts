import type { GetImpulseFormParams } from "./get-impulse-form-params"
import type { ImpulseFormParams } from "./impulse-form-params"

export type GetImpulseFormParam<
  TTarget,
  TKey extends keyof ImpulseFormParams,
> = GetImpulseFormParams<TTarget>[TKey]
