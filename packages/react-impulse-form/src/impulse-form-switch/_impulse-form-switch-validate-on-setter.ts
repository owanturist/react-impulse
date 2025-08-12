import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { GetImpulseFormSwitchBranchesParam } from "./_get-impulse-form-switch-branches-para"
import type { ImpulseFormSwitchBranchUnion } from "./_impulse-form-switch-branch-union"
import type { ImpulseFormSwitchConciseSchema } from "./_impulse-form-switch-concise-schema"
import type { ImpulseFormSwitchValidateOnVerbose } from "./_impulse-form-switch-validate-on-verbose"
import type { ImpulseFormSwitchVerboseSchema } from "./_impulse-form-switch-verbose-schema"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchValidateOnSetter<
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
          | ValidateStrategy
          | ImpulseFormSwitchBranchUnion<TKind, TBranches, "validateOn.setter">,
          [
            ImpulseFormSwitchBranchUnion<
              TKind,
              TBranches,
              "validateOn.schema.verbose"
            >,
          ]
        >
      >
    >

  // verbose
  | Partial<
      ImpulseFormSwitchVerboseSchema<
        GetImpulseFormParam<TKind, "validateOn.setter">,
        Setter<
          | ValidateStrategy
          | Partial<
              GetImpulseFormSwitchBranchesParam<TBranches, "validateOn.setter">
            >,
          [ImpulseFormSwitchValidateOnVerbose<TKind, TBranches>["branches"]]
        >
      >
    >,
  [
    // the only argument is the verbose schema
    ImpulseFormSwitchValidateOnVerbose<TKind, TBranches>,
  ]
>
