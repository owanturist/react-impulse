import type { GetSignalFormParam } from "../../signal-form/get-signal-form-param"
import type { SignalForm } from "../../signal-form/signal-form"
import type { SignalFormParams } from "../../signal-form/signal-form-params"
import type { FormSwitchBranches } from "../form-switch-branches"
import type { FormSwitchConciseSchema } from "../form-switch-concise-schema"

import type { FormSwitchBranchUnion } from "./form-switch-branch-union"

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
