import type { Compute } from "~/tools/compute"

import type { GetSignalFormParam } from "../../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../../impulse-form/impulse-form"
import type { SignalFormParams } from "../../impulse-form/impulse-form-params"
import type { GetFormSwitchBranchesParam } from "../get-impulse-form-switch-branches-param"
import type { FormSwitchBranches } from "../impulse-form-switch-branches"
import type { FormSwitchVerboseSchema } from "../impulse-form-switch-verbose-schema"

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
