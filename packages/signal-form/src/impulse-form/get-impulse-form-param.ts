import type { ImpulseFormParams } from "./impulse-form-params"
import type { GetImpulseFormParams } from "./_internal/get-impulse-form-params"

type GetImpulseFormParam<
  TTarget,
  TKey extends keyof ImpulseFormParams,
> = GetImpulseFormParams<TTarget>[TKey]

export type { GetImpulseFormParam }
