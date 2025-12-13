import type { GetSignalFormOutput } from "../../impulse-form/get-impulse-form-output"
import type { GetSignalFormParam } from "../../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../../impulse-form/impulse-form"
import type { SignalFormParams } from "../../impulse-form/impulse-form-params"
import type { FormSwitchBranch } from "../impulse-form-switch-branch"
import type { FormSwitchBranches } from "../impulse-form-switch-branches"

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
