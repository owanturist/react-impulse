import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { GetImpulseFormSwitchBranchesParam } from "./_get-impulse-form-switch-branches-param"
import type {
  ImpulseFormSwitchBranchesInput,
  ImpulseFormSwitchInput,
} from "./_impulse-form-switch-input"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchInputSetter<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = Setter<
  Partial<{
    readonly active: GetImpulseFormParam<TKind, "input.setter">
    readonly branches: Setter<
      Partial<GetImpulseFormSwitchBranchesParam<TBranches, "input.setter">>,
      [
        ImpulseFormSwitchBranchesInput<TBranches>,
        ImpulseFormSwitchBranchesInput<TBranches>,
      ]
    >
  }>,
  [
    ImpulseFormSwitchInput<TKind, TBranches>,
    ImpulseFormSwitchInput<TKind, TBranches>,
  ]
>
