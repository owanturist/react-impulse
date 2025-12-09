import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../signal-form/get-signal-form-param"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormSwitchBranches } from "./form-switch-branches"
import type { FormSwitchConciseSchema } from "./form-switch-concise-schema"
import type { FormSwitchFlagVerbose } from "./form-switch-flag-verbose"
import type { FormSwitchVerboseSchema } from "./form-switch-verbose-schema"
import type { GetFormSwitchBranchesParam } from "./get-form-switch-branches-param"
import type { FormSwitchBranchUnion } from "./_internal/form-switch-branch-union"

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
