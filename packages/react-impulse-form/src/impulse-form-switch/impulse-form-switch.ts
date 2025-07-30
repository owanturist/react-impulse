import { isUndefined } from "~/tools/is-undefined"

import { batch } from "../dependencies"

import { ImpulseFormSwitch as ImpulseFormSwitchImpl } from "./_impulse-form-switch"
import type { ImpulseFormSwitchErrorSetter } from "./_impulse-form-switch-error-setter"
import type { ImpulseFormSwitchFlagSetter } from "./_impulse-form-switch-flag-setter"
import type { ImpulseFormSwitchInputSetter } from "./_impulse-form-switch-input-setter"
import type { ImpulseFormSwitchValidateOnSetter } from "./_impulse-form-switch-validate-on-setter"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export type ImpulseFormSwitch<TCases extends ImpulseFormSwitchCases> =
  ImpulseFormSwitchImpl<TCases>

export interface ImpulseFormSwitchOptions<
  TCases extends ImpulseFormSwitchCases,
> {
  input?: ImpulseFormSwitchInputSetter<TCases>
  initial?: ImpulseFormSwitchInputSetter<TCases>
  touched?: ImpulseFormSwitchFlagSetter<TCases>
  validateOn?: ImpulseFormSwitchValidateOnSetter<TCases>
  error?: ImpulseFormSwitchErrorSetter<TCases>
}

export function ImpulseFormSwitch<TCases extends ImpulseFormSwitchCases>(
  cases: Readonly<TCases>,
  {
    input,
    initial,
    touched,
    validateOn,
    error,
  }: ImpulseFormSwitchOptions<TCases> = {},
): ImpulseFormSwitch<TCases> {
  const switcher = new ImpulseFormSwitchImpl(null, cases)

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
