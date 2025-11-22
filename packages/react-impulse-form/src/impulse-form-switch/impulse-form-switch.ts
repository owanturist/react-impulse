import { batch } from "react-impulse"

import type { IsEqualType } from "~/tools/is-type-equal"
import { isUndefined } from "~/tools/is-undefined"
import { mapValues } from "~/tools/map-values"

import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchErrorSetter } from "./impulse-form-switch-error-setter"
import type { ImpulseFormSwitchFlagSetter } from "./impulse-form-switch-flag-setter"
import type { ImpulseFormSwitchInputSetter } from "./impulse-form-switch-input-setter"
import type { ImpulseFormSwitchValidateOnSetter } from "./impulse-form-switch-validate-on-setter"
import { ImpulseFormSwitch as ImpulseFormSwitchImpl } from "./_internal/impulse-form-switch"
import { ImpulseFormSwitchState } from "./_internal/impulse-form-switch-state"

type ImpulseFormSwitch<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> = ImpulseFormSwitchImpl<TKind, TBranches>

interface ImpulseFormSwitchOptions<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> {
  input?: ImpulseFormSwitchInputSetter<TKind, TBranches>
  initial?: ImpulseFormSwitchInputSetter<TKind, TBranches>
  touched?: ImpulseFormSwitchFlagSetter<TKind, TBranches>
  validateOn?: ImpulseFormSwitchValidateOnSetter<TKind, TBranches>
  error?: ImpulseFormSwitchErrorSetter<TKind, TBranches>
}

function ImpulseFormSwitch<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
>(
  active: TKind,
  branches: IsEqualType<GetImpulseFormParam<TKind, "output.schema">, keyof TBranches> extends true
    ? TBranches
    : never,
  { input, initial, touched, validateOn, error }: ImpulseFormSwitchOptions<TKind, TBranches> = {},
): ImpulseFormSwitch<TKind, TBranches> {
  const switcher = new ImpulseFormSwitchState<TKind, TBranches>(
    null,
    ImpulseFormSwitchImpl._getState(active),
    mapValues(branches, (branch) => ImpulseFormSwitchImpl._getState(branch)),
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

export type { ImpulseFormSwitchOptions }
export { ImpulseFormSwitch }
