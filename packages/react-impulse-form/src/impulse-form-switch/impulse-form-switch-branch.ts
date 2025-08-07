import { isShallowObjectEqual } from "~/tools/is-shallow-object-equal"

export interface ImpulseFormSwitchBranch<TKind, TValue> {
  readonly kind: TKind
  readonly value: TValue
}

export const isImpulseFormSwitchBranchEqual = isShallowObjectEqual as <
  TKind,
  TValue,
>(
  left: ImpulseFormSwitchBranch<TKind, TValue>,
  right: ImpulseFormSwitchBranch<TKind, TValue>,
) => boolean
