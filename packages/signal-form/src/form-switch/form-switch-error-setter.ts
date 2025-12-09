import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../signal-form/get-signal-form-param"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormSwitchBranches } from "./form-switch-branches"
import type { FormSwitchConciseSchema } from "./form-switch-concise-schema"
import type { FormSwitchErrorVerbose } from "./form-switch-error-verbose"
import type { FormSwitchVerboseSchema } from "./form-switch-verbose-schema"
import type { GetFormSwitchBranchesParam } from "./get-form-switch-branches-param"
import type { FormSwitchBranchUnion } from "./_internal/form-switch-branch-union"

type FormSwitchErrorSetter<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = Setter<
  // concise
  | null

  // concise details
  | Partial<
      FormSwitchConciseSchema<
        GetSignalFormParam<TKind, "error.setter">,
        Setter<
          null | FormSwitchBranchUnion<TKind, TBranches, "error.setter">,
          [FormSwitchBranchUnion<TKind, TBranches, "error.schema.verbose">]
        >
      >
    >

  // verbose
  | Partial<
      FormSwitchVerboseSchema<
        GetSignalFormParam<TKind, "error.setter">,
        Setter<
          null | Partial<GetFormSwitchBranchesParam<TBranches, "error.setter">>,
          [GetFormSwitchBranchesParam<TBranches, "error.schema.verbose">]
        >
      >
    >,
  [
    // the only argument is the verbose schema
    FormSwitchErrorVerbose<TKind, TBranches>,
  ]
>
export type { FormSwitchErrorSetter }
