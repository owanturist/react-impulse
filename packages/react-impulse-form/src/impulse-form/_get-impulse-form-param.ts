import type { ImpulseForm } from "./impulse-form"
import type { ImpulseFormParams } from "./impulse-form-params"

export type GetImpulseFormParam<
  TTarget,
  TKey extends keyof ImpulseFormParams,
  TFallback = never,
> = TTarget extends ImpulseForm<infer TParams> ? TParams[TKey] : TFallback
