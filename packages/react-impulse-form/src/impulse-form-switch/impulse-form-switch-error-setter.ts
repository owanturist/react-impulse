import type { Setter } from "~/tools/setter"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { GetImpulseFormSwitchBranchesParam } from "./get-impulse-form-switch-branches-param"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchConciseSchema } from "./impulse-form-switch-concise-schema"
import type { ImpulseFormSwitchErrorVerbose } from "./impulse-form-switch-error-verbose"
import type { ImpulseFormSwitchVerboseSchema } from "./impulse-form-switch-verbose-schema"
import type { ImpulseFormSwitchBranchUnion } from "./_internal/impulse-form-switch-branch-union"

type ImpulseFormSwitchErrorSetter<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = Setter<
  // concise
  | null

  // concise details
  | Partial<
      ImpulseFormSwitchConciseSchema<
        GetImpulseFormParam<TKind, "error.setter">,
        Setter<
          null | ImpulseFormSwitchBranchUnion<TKind, TBranches, "error.setter">,
          [ImpulseFormSwitchBranchUnion<TKind, TBranches, "error.schema.verbose">]
        >
      >
    >

  // verbose
  | Partial<
      ImpulseFormSwitchVerboseSchema<
        GetImpulseFormParam<TKind, "error.setter">,
        Setter<
          null | Partial<GetImpulseFormSwitchBranchesParam<TBranches, "error.setter">>,
          [GetImpulseFormSwitchBranchesParam<TBranches, "error.schema.verbose">]
        >
      >
    >,
  [
    // the only argument is the verbose schema
    ImpulseFormSwitchErrorVerbose<TKind, TBranches>,
  ]
>
export type { ImpulseFormSwitchErrorSetter }
