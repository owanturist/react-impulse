import type { ImpulseForm } from "./impulse-form"
import type { ImpulseFormParams } from "./impulse-form-params"

export type GetImpulseFormParam<TTarget, TKey extends keyof ImpulseFormParams> =
  TTarget extends ImpulseForm<infer TParams> ? TParams[TKey] : never
