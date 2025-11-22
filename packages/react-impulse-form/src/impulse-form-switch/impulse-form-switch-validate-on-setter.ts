import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam, ImpulseForm } from "../impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { GetImpulseFormSwitchBranchesParam } from "./get-impulse-form-switch-branches-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchConciseSchema } from "./impulse-form-switch-concise-schema"
import type { ImpulseFormSwitchValidateOnVerbose } from "./impulse-form-switch-validate-on-verbose"
import type { ImpulseFormSwitchVerboseSchema } from "./impulse-form-switch-verbose-schema"
import type { ImpulseFormSwitchBranchUnion } from "./_internal/impulse-form-switch-branch-union"

type ImpulseFormSwitchValidateOnSetter<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = Setter<
  // concise
  | ValidateStrategy

  // concise details
  | Partial<
      ImpulseFormSwitchConciseSchema<
        GetImpulseFormParam<TKind, "validateOn.setter">,
        Setter<
          ValidateStrategy | ImpulseFormSwitchBranchUnion<TKind, TBranches, "validateOn.setter">,
          [ImpulseFormSwitchBranchUnion<TKind, TBranches, "validateOn.schema.verbose">]
        >
      >
    >

  // verbose
  | Partial<
      ImpulseFormSwitchVerboseSchema<
        GetImpulseFormParam<TKind, "validateOn.setter">,
        Setter<
          | ValidateStrategy
          | Partial<GetImpulseFormSwitchBranchesParam<TBranches, "validateOn.setter">>,
          [GetImpulseFormSwitchBranchesParam<TBranches, "validateOn.schema.verbose">]
        >
      >
    >,
  [
    // the only argument is the verbose schema
    ImpulseFormSwitchValidateOnVerbose<TKind, TBranches>,
  ]
>

export type { ImpulseFormSwitchValidateOnSetter }
