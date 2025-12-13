import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../impulse-form/impulse-form"

import type { GetFormSwitchBranchesParam } from "./get-impulse-form-switch-branches-param"
import type { FormSwitchBranches } from "./impulse-form-switch-branches"
import type { FormSwitchConciseSchema } from "./impulse-form-switch-concise-schema"
import type { FormSwitchFlagVerbose } from "./impulse-form-switch-flag-verbose"
import type { FormSwitchVerboseSchema } from "./impulse-form-switch-verbose-schema"
import type { FormSwitchBranchUnion } from "./_internal/impulse-form-switch-branch-union"

type FormSwitchFlagSetter<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = Setter<
  // concise
  | boolean

  // concise details
  | Partial<
      FormSwitchConciseSchema<
        GetSignalFormParam<TKind, "flag.setter">,
        Setter<
          boolean | FormSwitchBranchUnion<TKind, TBranches, "flag.setter">,
          [FormSwitchBranchUnion<TKind, TBranches, "flag.schema.verbose">]
        >
      >
    >

  // verbose
  | Partial<
      FormSwitchVerboseSchema<
        GetSignalFormParam<TKind, "flag.setter">,
        Setter<
          boolean | Partial<GetFormSwitchBranchesParam<TBranches, "flag.setter">>,
          [GetFormSwitchBranchesParam<TBranches, "flag.schema.verbose">]
        >
      >
    >,
  [
    // the only argument is the verbose schema
    FormSwitchFlagVerbose<TKind, TBranches>,
  ]
>

export type { FormSwitchFlagSetter }
