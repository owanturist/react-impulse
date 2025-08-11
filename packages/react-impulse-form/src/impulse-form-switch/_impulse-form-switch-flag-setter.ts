import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { GetImpulseFormSwitchBranchesParam } from "./_get-impulse-form-switch-branches-para"
import type { ImpulseFormSwitchFlagVerbose } from "./_impulse-form-switch-flag-verbose"
import type { ImpulseFormSwitchSchema } from "./_impulse-form-switch-schema"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchFlagSetter<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = Setter<
  Partial<
    ImpulseFormSwitchSchema<
      GetImpulseFormParam<TKind, "flag.setter">,
      Setter<
        Partial<GetImpulseFormSwitchBranchesParam<TBranches, "flag.setter">>,
        [
          ImpulseFormSwitchFlagVerbose<TKind, TBranches>["branches"],
          ImpulseFormSwitchFlagVerbose<TKind, TBranches>["branches"],
        ]
      >
    >
  >,
  [
    ImpulseFormSwitchFlagVerbose<TKind, TBranches>,
    ImpulseFormSwitchFlagVerbose<TKind, TBranches>,
  ]
>
