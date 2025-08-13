import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { GetImpulseFormSwitchBranchesParam } from "./_get-impulse-form-switch-branches-param"
import type { ImpulseFormSwitchInput } from "./_impulse-form-switch-input"
import type { ImpulseFormSwitchVerboseSchema } from "./_impulse-form-switch-verbose-schema"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchInputSetter<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = Setter<
  Partial<
    ImpulseFormSwitchVerboseSchema<
      GetImpulseFormParam<TKind, "input.setter">,
      Setter<
        Partial<GetImpulseFormSwitchBranchesParam<TBranches, "input.setter">>,
        [
          GetImpulseFormSwitchBranchesParam<TBranches, "input.schema">,
          GetImpulseFormSwitchBranchesParam<TBranches, "input.schema">,
        ]
      >
    >
  >,
  [
    ImpulseFormSwitchInput<TKind, TBranches>,
    ImpulseFormSwitchInput<TKind, TBranches>,
  ]
>
