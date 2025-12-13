import { batch } from "@owanturist/signal"

import type { IsEqualType } from "~/tools/is-type-equal"
import { isUndefined } from "~/tools/is-undefined"
import { mapValues } from "~/tools/map-values"

import type { GetSignalFormParam } from "../signal-form/get-signal-form-param"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormSwitchBranches } from "./form-switch-branches"
import type { FormSwitchErrorSetter } from "./form-switch-error-setter"
import type { FormSwitchFlagSetter } from "./form-switch-flag-setter"
import type { FormSwitchInputSetter } from "./form-switch-input-setter"
import type { FormSwitchValidateOnSetter } from "./form-switch-validate-on-setter"
import { FormSwitch as FormSwitchImpl } from "./_internal/form-switch"
import { FormSwitchState } from "./_internal/form-switch-state"

type FormSwitch<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> = FormSwitchImpl<TKind, TBranches>

interface FormSwitchOptions<TKind extends SignalForm, TBranches extends FormSwitchBranches<TKind>> {
  input?: FormSwitchInputSetter<TKind, TBranches>
  initial?: FormSwitchInputSetter<TKind, TBranches>
  touched?: FormSwitchFlagSetter<TKind, TBranches>
  validateOn?: FormSwitchValidateOnSetter<TKind, TBranches>
  error?: FormSwitchErrorSetter<TKind, TBranches>
}

function FormSwitch<TKind extends SignalForm, TBranches extends FormSwitchBranches<TKind>>(
  active: TKind,
  branches: IsEqualType<GetSignalFormParam<TKind, "output.schema">, keyof TBranches> extends true
    ? TBranches
    : never,
  { input, initial, touched, validateOn, error }: FormSwitchOptions<TKind, TBranches> = {},
): FormSwitch<TKind, TBranches> {
  const switcher = new FormSwitchState<TKind, TBranches>(
    null,
    FormSwitchImpl._getState(active),
    mapValues(branches, (branch) => FormSwitchImpl._getState(branch)),
  )

  batch((monitor) => {
    if (!isUndefined(touched)) {
      switcher._setTouched(monitor, touched)
    }

    if (!isUndefined(initial)) {
      switcher._setInitial(monitor, initial)
    }

    if (!isUndefined(input)) {
      switcher._setInput(monitor, input)
    }

    if (!isUndefined(validateOn)) {
      switcher._setValidateOn(monitor, validateOn)
    }

    if (!isUndefined(error)) {
      switcher._setError(monitor, error)
    }
  })

  return switcher._host()
}

export type { FormSwitchOptions }
export { FormSwitch }
