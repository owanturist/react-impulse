import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../impulse-form/impulse-form"

import type { GetFormSwitchBranchesParam } from "./get-impulse-form-switch-branches-param"
import type { FormSwitchBranches } from "./impulse-form-switch-branches"
import type { FormSwitchInput } from "./impulse-form-switch-input"
import type { FormSwitchVerboseSchema } from "./impulse-form-switch-verbose-schema"

type FormSwitchInputSetter<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = Setter<
  Partial<
    FormSwitchVerboseSchema<
      GetSignalFormParam<TKind, "input.setter">,
      Setter<
        Partial<GetFormSwitchBranchesParam<TBranches, "input.setter">>,
        [
          GetFormSwitchBranchesParam<TBranches, "input.schema">,
          GetFormSwitchBranchesParam<TBranches, "input.schema">,
        ]
      >
    >
  >,
  [FormSwitchInput<TKind, TBranches>, FormSwitchInput<TKind, TBranches>]
>

export type { FormSwitchInputSetter }
