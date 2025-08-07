import { mapValues } from "~/tools/map-values"

import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormSwitchParams } from "./_impulse-form-switch-params"
import type { ImpulseFormSwitchState } from "./_impulse-form-switch-state"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export class ImpulseFormSwitch<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> extends ImpulseForm<ImpulseFormSwitchParams<TKind, TBranches>> {
  public static override _getState = ImpulseForm._getState

  public readonly active: TKind

  public readonly branches: Readonly<TBranches>

  public constructor(
    public readonly _state: ImpulseFormSwitchState<TKind, TBranches>,
  ) {
    super()

    this.active = _state._active._host()

    this.branches = mapValues(_state._branches, ({ _host }) => {
      return _host()
    })
  }
}
