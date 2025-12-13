import type { SignalForm } from "./impulse-form"

type GetSignalFormParams<TTarget> = TTarget extends SignalForm<infer TParams> ? TParams : never

export type { GetSignalFormParams }
