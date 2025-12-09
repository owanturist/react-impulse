import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../signal-form/get-signal-form-param"
import type { SignalForm } from "../signal-form/signal-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { FormSwitchBranches } from "./form-switch-branches"
import type { FormSwitchConciseSchema } from "./form-switch-concise-schema"
import type { FormSwitchValidateOnVerbose } from "./form-switch-validate-on-verbose"
import type { FormSwitchVerboseSchema } from "./form-switch-verbose-schema"
import type { GetFormSwitchBranchesParam } from "./get-form-switch-branches-param"
import type { FormSwitchBranchUnion } from "./_internal/form-switch-branch-union"

type FormSwitchValidateOnSetter<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = Setter<
  // concise
  | ValidateStrategy

  // concise details
  | Partial<
      FormSwitchConciseSchema<
        GetSignalFormParam<TKind, "validateOn.setter">,
        Setter<
          ValidateStrategy | FormSwitchBranchUnion<TKind, TBranches, "validateOn.setter">,
          [FormSwitchBranchUnion<TKind, TBranches, "validateOn.schema.verbose">]
        >
      >
    >

  // verbose
  | Partial<
      FormSwitchVerboseSchema<
        GetSignalFormParam<TKind, "validateOn.setter">,
        Setter<
          ValidateStrategy | Partial<GetFormSwitchBranchesParam<TBranches, "validateOn.setter">>,
          [GetFormSwitchBranchesParam<TBranches, "validateOn.schema.verbose">]
        >
      >
    >,
  [
    // the only argument is the verbose schema
    FormSwitchValidateOnVerbose<TKind, TBranches>,
  ]
>

export type { FormSwitchValidateOnSetter }
