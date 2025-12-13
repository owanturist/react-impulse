import type { Setter } from "~/tools/setter"

import type { GetSignalFormParam } from "../impulse-form/get-impulse-form-param"
import type { SignalForm } from "../impulse-form/impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { GetFormSwitchBranchesParam } from "./get-impulse-form-switch-branches-param"
import type { FormSwitchBranches } from "./impulse-form-switch-branches"
import type { FormSwitchConciseSchema } from "./impulse-form-switch-concise-schema"
import type { FormSwitchValidateOnVerbose } from "./impulse-form-switch-validate-on-verbose"
import type { FormSwitchVerboseSchema } from "./impulse-form-switch-verbose-schema"
import type { FormSwitchBranchUnion } from "./_internal/impulse-form-switch-branch-union"

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
