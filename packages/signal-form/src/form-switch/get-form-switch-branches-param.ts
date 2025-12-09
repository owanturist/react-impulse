import type { Compute } from "~/tools/compute"

import type { GetSignalFormParam } from "../signal-form/get-signal-form-param"
import type { SignalForm } from "../signal-form/signal-form"
import type { SignalFormParams } from "../signal-form/signal-form-params"

import type { FormSwitchBranches } from "./form-switch-branches"

type GetFormSwitchBranchesParam<
  TBranches extends FormSwitchBranches<SignalForm>,
  TKey extends keyof SignalFormParams,
> = Compute<{
  readonly [TBranch in keyof TBranches]: GetSignalFormParam<TBranches[TBranch], TKey>
}>

export type { GetFormSwitchBranchesParam }
