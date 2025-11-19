import type { ImpulseForm } from "./impulse-form"

export type GetImpulseFormParams<TTarget> = TTarget extends ImpulseForm<infer TParams>
  ? TParams
  : never
