import type { SignalForm } from "../signal-form/signal-form"

import type { FormSwitchBranch } from "./form-switch-branch"
import type { FormSwitchBranches } from "./form-switch-branches"

type FormSwitchActiveBranch<TBranches extends FormSwitchBranches<SignalForm>> = {
  [TBranch in keyof TBranches]: FormSwitchBranch<TBranch, TBranches[TBranch]>
}[keyof TBranches]

export type { FormSwitchActiveBranch }
