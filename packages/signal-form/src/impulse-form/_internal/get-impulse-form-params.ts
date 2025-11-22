import type { ImpulseForm } from "./impulse-form"

type GetImpulseFormParams<TTarget> = TTarget extends ImpulseForm<infer TParams> ? TParams : never

export type { GetImpulseFormParams }
