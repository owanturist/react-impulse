import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../impulse-form/impulse-form"

import type { GetFormSwitchBranchesParam } from "./get-impulse-form-switch-branches-param"
import type { FormSwitchBranches } from "./impulse-form-switch-branches"
import type { FormSwitchConciseSchema } from "./impulse-form-switch-concise-schema"
import type { FormSwitchErrorVerbose } from "./impulse-form-switch-error-verbose"
import type { FormSwitchVerboseSchema } from "./impulse-form-switch-verbose-schema"
import type { FormSwitchBranchUnion } from "./_internal/impulse-form-switch-branch-union"

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
