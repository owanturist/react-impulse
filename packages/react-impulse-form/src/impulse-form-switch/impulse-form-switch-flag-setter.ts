import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { GetImpulseFormSwitchBranchesParam } from "./_get-impulse-form-switch-branches-param"
import type { ImpulseFormSwitchBranchUnion } from "./_impulse-form-switch-branch-union"
import type { ImpulseFormSwitchConciseSchema } from "./_impulse-form-switch-concise-schema"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchFlagVerbose } from "./impulse-form-switch-flag-verbose"
import type { ImpulseFormSwitchVerboseSchema } from "./impulse-form-switch-verbose-schema"

export type ImpulseFormSwitchFlagSetter<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = Setter<
  // concise
  | boolean

  // concise details
  | Partial<
      ImpulseFormSwitchConciseSchema<
        GetImpulseFormParam<TKind, "flag.setter">,
        Setter<
          | boolean
          | ImpulseFormSwitchBranchUnion<TKind, TBranches, "flag.setter">,
          [
            ImpulseFormSwitchBranchUnion<
              TKind,
              TBranches,
              "flag.schema.verbose"
            >,
          ]
        >
      >
    >

  // verbose
  | Partial<
      ImpulseFormSwitchVerboseSchema<
        GetImpulseFormParam<TKind, "flag.setter">,
        Setter<
          | boolean
          | Partial<
              GetImpulseFormSwitchBranchesParam<TBranches, "flag.setter">
            >,
          [GetImpulseFormSwitchBranchesParam<TBranches, "flag.schema.verbose">]
        >
      >
    >,
  [
    // the only argument is the verbose schema
    ImpulseFormSwitchFlagVerbose<TKind, TBranches>,
  ]
>
