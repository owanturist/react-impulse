import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { GetImpulseFormSwitchBranchesParam } from "./_get-impulse-form-switch-branches-para"
import type { ImpulseFormSwitchSchema } from "./_impulse-form-switch-schema"
import type { ImpulseFormSwitchValidateOnVerbose } from "./_impulse-form-switch-validate-on-verbose"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitchValidateOnSetter<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = Setter<
  Partial<
    ImpulseFormSwitchSchema<
      GetImpulseFormParam<TKind, "validateOn.setter">,
      Setter<
        Partial<
          GetImpulseFormSwitchBranchesParam<TBranches, "validateOn.setter">
        >,
        [
          ImpulseFormSwitchValidateOnVerbose<TKind, TBranches>["branches"],
          ImpulseFormSwitchValidateOnVerbose<TKind, TBranches>["branches"],
        ]
      >
    >
  >,
  [
    ImpulseFormSwitchValidateOnVerbose<TKind, TBranches>,
    ImpulseFormSwitchValidateOnVerbose<TKind, TBranches>,
  ]
>
