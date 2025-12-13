import type { GetSignalFormParam } from "../../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../../impulse-form/impulse-form"
import type { SignalFormParams } from "../../impulse-form/impulse-form-params"
import type { FormSwitchBranches } from "../impulse-form-switch-branches"
import type { FormSwitchConciseSchema } from "../impulse-form-switch-concise-schema"

import type { FormSwitchBranchUnion } from "./impulse-form-switch-branch-union"

type FormSwitchConciseParam<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
  TKey extends keyof SignalFormParams,
  TConcise,
> =
  | TConcise
  | FormSwitchConciseSchema<
      TConcise | GetSignalFormParam<TKind, TKey>,
      TConcise | FormSwitchBranchUnion<TKind, TBranches, TKey>
    >

export type { FormSwitchConciseParam }
