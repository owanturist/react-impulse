import type {
  GetImpulseFormOutput,
  GetImpulseFormParam,
  ImpulseForm,
  ImpulseFormParams,
} from "../../impulse-form"
import type { ImpulseFormSwitchBranch } from "../impulse-form-switch-branch"
import type { ImpulseFormSwitchBranches } from "../impulse-form-switch-branches"

type ImpulseFormSwitchBranchUnion<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
  TKey extends keyof ImpulseFormParams,
> = {
  [TBranch in GetImpulseFormOutput<TKind>]: ImpulseFormSwitchBranch<
    TBranch,
    GetImpulseFormParam<TBranches[TBranch], TKey>
  >
}[GetImpulseFormOutput<TKind>]

export type { ImpulseFormSwitchBranchUnion }
