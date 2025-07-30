import { isUndefined } from "~/tools/is-undefined"

import { batch } from "../dependencies"

import { ImpulseFormSwitch as ImpulseFormSwitchImpl } from "./_impulse-form-switch"
import type { ImpulseFormSwitchErrorSetter } from "./_impulse-form-switch-error-setter"
import type { ImpulseFormSwitchFlagSetter } from "./_impulse-form-switch-flag-setter"
import type { ImpulseFormSwitchInputSetter } from "./_impulse-form-switch-input-setter"
import type { ImpulseFormSwitchValidateOnSetter } from "./_impulse-form-switch-validate-on-setter"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export type ImpulseFormSwitch<TBranches extends ImpulseFormSwitchBranches> =
  ImpulseFormSwitchImpl<TBranches>

export interface ImpulseFormSwitchOptions<
  TBranches extends ImpulseFormSwitchBranches,
> {
  input?: ImpulseFormSwitchInputSetter<TBranches>
  initial?: ImpulseFormSwitchInputSetter<TBranches>
  touched?: ImpulseFormSwitchFlagSetter<TBranches>
  validateOn?: ImpulseFormSwitchValidateOnSetter<TBranches>
  error?: ImpulseFormSwitchErrorSetter<TBranches>
}

export function ImpulseFormSwitch<TBranches extends ImpulseFormSwitchBranches>(
  active: keyof TBranches,
  branches: Readonly<TBranches>,
  {
    input,
    initial,
    touched,
    validateOn,
    error,
  }: ImpulseFormSwitchOptions<TBranches> = {},
): ImpulseFormSwitch<TBranches> {
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

    // TODO add test against null
    if (!isUndefined(error)) {
      switcher.setError(error)
    }
  })

  return switcher
}
