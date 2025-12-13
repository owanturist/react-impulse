import type { Compute } from "~/tools/compute"

import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../impulse-form/impulse-form"
import type { SignalFormParams } from "../impulse-form/impulse-form-params"

import type { FormSwitchBranches } from "./impulse-form-switch-branches"

type GetFormSwitchBranchesParam<
  TBranches extends FormSwitchBranches<SignalForm>,
  TKey extends keyof SignalFormParams,
> = Compute<{
  readonly [TBranch in keyof TBranches]: GetSignalFormParam<TBranches[TBranch], TKey>
}>

export type { GetFormSwitchBranchesParam }
