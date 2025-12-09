import type { SignalForm } from "./signal-form"

type GetSignalFormParams<TTarget> = TTarget extends SignalForm<infer TParams> ? TParams : never

export type { GetSignalFormParams }
