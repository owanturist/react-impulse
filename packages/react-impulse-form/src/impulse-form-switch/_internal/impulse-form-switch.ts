import { mapValues } from "~/tools/map-values"

import type { Scope } from "../../_internal/dependencies"
import { ImpulseForm } from "../../impulse-form/_internal/impulse-form"
import type { ImpulseFormSwitchActiveBranch } from "../impulse-form-switch-active-branch"
import type { ImpulseFormSwitchBranches } from "../impulse-form-switch-branches"
import type { ImpulseFormSwitchParams } from "../impulse-form-switch-params"

import type { ImpulseFormSwitchState } from "./impulse-form-switch-state"

class ImpulseFormSwitch<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> extends ImpulseForm<ImpulseFormSwitchParams<TKind, TBranches>> {
  public static override _getState = ImpulseForm._getState

  public readonly active: TKind

  public readonly branches: Readonly<TBranches>

  public constructor(public readonly _state: ImpulseFormSwitchState<TKind, TBranches>) {
    super()

    this.active = _state._active._host() as TKind

    this.branches = mapValues(_state._branches, ({ _host }) => _host()) as Readonly<TBranches>
  }

  public getActiveBranch(scope: Scope): undefined | ImpulseFormSwitchActiveBranch<TBranches> {
    const result = this._state._getActiveBranch(scope)

    if (!result) {
      return undefined
    }

    return {
      kind: result.kind,
      value: result.value._host(),
    } as ImpulseFormSwitchActiveBranch<TBranches>
  }
}

export { ImpulseFormSwitch }
