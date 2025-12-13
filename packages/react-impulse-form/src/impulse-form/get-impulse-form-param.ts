import type { SignalFormParams } from "./impulse-form-params"
import type { GetSignalFormParams } from "./_internal/get-impulse-form-params"

type GetSignalFormParam<
  TTarget,
  TKey extends keyof SignalFormParams,
> = GetSignalFormParams<TTarget>[TKey]

export type { GetSignalFormParam }
