import { isUndefined } from "~/tools/is-undefined"
import { mapValues } from "~/tools/map-values"

import { batch } from "../dependencies"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import { ImpulseFormSwitch as ImpulseFormSwitchImpl } from "./_impulse-form-switch"
import type { ImpulseFormSwitchErrorSetter } from "./_impulse-form-switch-error-setter"
import type { ImpulseFormSwitchFlagSetter } from "./_impulse-form-switch-flag-setter"
import type { ImpulseFormSwitchInputSetter } from "./_impulse-form-switch-input-setter"
import { ImpulseFormSwitchState } from "./_impulse-form-switch-state"
import type { ImpulseFormSwitchValidateOnSetter } from "./_impulse-form-switch-validate-on-setter"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitch<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchImpl<TKind, TBranches>

export interface ImpulseFormSwitchOptions<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> {
  input?: ImpulseFormSwitchInputSetter<TKind, TBranches>
  initial?: ImpulseFormSwitchInputSetter<TKind, TBranches>
  touched?: ImpulseFormSwitchFlagSetter<TBranches>
  validateOn?: ImpulseFormSwitchValidateOnSetter<TBranches>
  error?: ImpulseFormSwitchErrorSetter<TBranches>
}

export function ImpulseFormSwitch<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
>(
  active: TKind,
  branches: Readonly<TBranches>,
  {
    input,
    initial,
    touched,
    validateOn,
    error,
  }: ImpulseFormSwitchOptions<TKind, TBranches> = {},
): ImpulseFormSwitch<TKind, TBranches> {
  const switcher = new ImpulseFormSwitchState<TKind, TBranches>(
    null,
    ImpulseFormSwitchImpl._getState(active),
    mapValues(branches, ImpulseFormSwitchImpl._getState),
  )

  batch((scope) => {
    if (!isUndefined(touched)) {
      switcher._setTouched(scope, touched)
    }

    if (!isUndefined(initial)) {
      switcher._setInitial(scope, initial)
    }

    if (!isUndefined(input)) {
      switcher._setInput(scope, input)
    }

    if (!isUndefined(validateOn)) {
      switcher._setValidateOn(scope, validateOn)
    }

    if (!isUndefined(error)) {
      switcher._setError(scope, error)
    }
  })

  return switcher._host()
}
