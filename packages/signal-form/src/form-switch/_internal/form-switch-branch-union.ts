import type { GetSignalFormOutput } from "../../signal-form/get-signal-form-output"
import type { GetSignalFormParam } from "../../signal-form/get-signal-form-param"
import type { SignalForm } from "../../signal-form/signal-form"
import type { SignalFormParams } from "../../signal-form/signal-form-params"
import type { FormSwitchBranch } from "../form-switch-branch"
import type { FormSwitchBranches } from "../form-switch-branches"

type FormSwitchBranchUnion<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
  TKey extends keyof SignalFormParams,
> = {
  [TBranch in GetSignalFormOutput<TKind>]: FormSwitchBranch<
    TBranch,
    GetSignalFormParam<TBranches[TBranch], TKey>
  >
}[GetSignalFormOutput<TKind>]

export type { FormSwitchBranchUnion }
