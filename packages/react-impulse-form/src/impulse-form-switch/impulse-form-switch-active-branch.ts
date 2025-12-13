import type { SignalForm } from "../impulse-form/impulse-form"

import type { FormSwitchBranch } from "./impulse-form-switch-branch"
import type { FormSwitchBranches } from "./impulse-form-switch-branches"

type FormSwitchActiveBranch<TBranches extends FormSwitchBranches<SignalForm>> = {
  [TBranch in keyof TBranches]: FormSwitchBranch<TBranch, TBranches[TBranch]>
}[keyof TBranches]

export type { FormSwitchActiveBranch }
