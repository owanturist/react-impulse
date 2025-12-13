import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../signal-form/get-signal-form-param"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormSwitchBranches } from "./form-switch-branches"
import type { FormSwitchInput } from "./form-switch-input"
import type { FormSwitchVerboseSchema } from "./form-switch-verbose-schema"
import type { GetFormSwitchBranchesParam } from "./get-form-switch-branches-param"

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
