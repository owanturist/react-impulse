import type { SignalFormParams } from "./signal-form-params"
import type { GetSignalFormParams } from "./_internal/get-signal-form-params"

type GetSignalFormParam<
  TTarget,
  TKey extends keyof SignalFormParams,
> = GetSignalFormParams<TTarget>[TKey]

export type { GetSignalFormParam }
