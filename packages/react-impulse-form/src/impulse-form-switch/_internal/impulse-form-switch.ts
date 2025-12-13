import type { Monitor } from "@owanturist/signal"

import { mapValues } from "~/tools/map-values"

import { SignalForm } from "../../impulse-form/_internal/impulse-form"
import type { FormSwitchActiveBranch } from "../impulse-form-switch-active-branch"
import type { FormSwitchBranches } from "../impulse-form-switch-branches"
import type { FormSwitchParams } from "../impulse-form-switch-params"

import type { FormSwitchState } from "./impulse-form-switch-state"

class FormSwitch<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> extends SignalForm<FormSwitchParams<TKind, TBranches>> {
  public static override _getState = SignalForm._getState

  public readonly active: TKind

  public readonly branches: Readonly<TBranches>

  public constructor(public readonly _state: FormSwitchState<TKind, TBranches>) {
    super()

    this.active = _state._active._host() as TKind

    this.branches = mapValues(_state._branches, ({ _host }) => _host()) as Readonly<TBranches>
  }

  public getActiveBranch(monitor: Monitor): undefined | FormSwitchActiveBranch<TBranches> {
    const result = this._state._getActiveBranch(monitor)

    if (!result) {
      return undefined
    }

    return {
      kind: result.kind,
      value: result.value._host(),
    } as FormSwitchActiveBranch<TBranches>
  }
}

export { FormSwitch }
