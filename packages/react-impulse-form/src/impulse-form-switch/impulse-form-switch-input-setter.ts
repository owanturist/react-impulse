import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam, ImpulseForm } from "../impulse-form"

import type { GetImpulseFormSwitchBranchesParam } from "./get-impulse-form-switch-branches-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchInput } from "./impulse-form-switch-input"
import type { ImpulseFormSwitchVerboseSchema } from "./impulse-form-switch-verbose-schema"

type ImpulseFormSwitchInputSetter<
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
  [ImpulseFormSwitchInput<TKind, TBranches>, ImpulseFormSwitchInput<TKind, TBranches>]
>

export type { ImpulseFormSwitchInputSetter }
