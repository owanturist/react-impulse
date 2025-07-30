import { isUndefined } from "~/tools/is-undefined"

import { batch } from "../dependencies"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import { ImpulseFormSwitch as ImpulseFormSwitchImpl } from "./_impulse-form-switch"
import type { ImpulseFormSwitchErrorSetter } from "./_impulse-form-switch-error-setter"
import type { ImpulseFormSwitchFlagSetter } from "./_impulse-form-switch-flag-setter"
import type { ImpulseFormSwitchInputSetter } from "./_impulse-form-switch-input-setter"
import type { ImpulseFormSwitchKindParams } from "./_impulse-form-switch-kind-params"
import type { ImpulseFormSwitchValidateOnSetter } from "./_impulse-form-switch-validate-on-setter"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitch<
  TKind extends ImpulseForm<ImpulseFormSwitchKindParams<keyof TBranches>>,
  TBranches extends ImpulseFormSwitchBranches,
> = ImpulseFormSwitchImpl<TKind, TBranches>

export interface ImpulseFormSwitchOptions<
  TKind extends ImpulseForm<ImpulseFormSwitchKindParams<keyof TBranches>>,
  TBranches extends ImpulseFormSwitchBranches,
> {
  input?: ImpulseFormSwitchInputSetter<TKind, TBranches>
  initial?: ImpulseFormSwitchInputSetter<TKind, TBranches>
  touched?: ImpulseFormSwitchFlagSetter<TBranches>
  validateOn?: ImpulseFormSwitchValidateOnSetter<TBranches>
  error?: ImpulseFormSwitchErrorSetter<TBranches>
}

export function ImpulseFormSwitch<
  TKind extends ImpulseForm<ImpulseFormSwitchKindParams<keyof TBranches>>,
  TBranches extends ImpulseFormSwitchBranches,
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
  const switcher = new ImpulseFormSwitchImpl(null, active, branches)

  batch(() => {
    if (!isUndefined(touched)) {
      switcher.setTouched(touched)
    }

    if (!isUndefined(initial)) {
      switcher.setInitial(initial)
    }

    if (!isUndefined(input)) {
      switcher.setInput(input)
    }

    if (!isUndefined(validateOn)) {
      switcher.setValidateOn(validateOn)
    }

    if (!isUndefined(error)) {
      switcher.setError(error)
    }
  })

  return switcher
}
