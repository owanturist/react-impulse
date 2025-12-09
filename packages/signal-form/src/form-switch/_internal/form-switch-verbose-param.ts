import type { Compute } from "~/tools/compute"

import type { GetSignalFormParam } from "../../signal-form/get-signal-form-param"
import type { SignalForm } from "../../signal-form/signal-form"
import type { SignalFormParams } from "../../signal-form/signal-form-params"
import type { FormSwitchBranches } from "../form-switch-branches"
import type { FormSwitchVerboseSchema } from "../form-switch-verbose-schema"
import type { GetFormSwitchBranchesParam } from "../get-form-switch-branches-param"

type FormSwitchVerboseParam<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
  TKey extends keyof SignalFormParams,
> = Compute<
  FormSwitchVerboseSchema<
    GetSignalFormParam<TKind, TKey>,
    GetFormSwitchBranchesParam<TBranches, TKey>
  >
>

export type { FormSwitchVerboseParam }
