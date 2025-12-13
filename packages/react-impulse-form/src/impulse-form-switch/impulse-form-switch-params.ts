import type { SignalForm } from "../impulse-form/impulse-form"
import type { SignalFormParams } from "../impulse-form/impulse-form-params"

import type { FormSwitchBranches } from "./impulse-form-switch-branches"
import type { FormSwitchError } from "./impulse-form-switch-error"
import type { FormSwitchErrorSetter } from "./impulse-form-switch-error-setter"
import type { FormSwitchErrorVerbose } from "./impulse-form-switch-error-verbose"
import type { FormSwitchFlag } from "./impulse-form-switch-flag"
import type { FormSwitchFlagSetter } from "./impulse-form-switch-flag-setter"
import type { FormSwitchFlagVerbose } from "./impulse-form-switch-flag-verbose"
import type { FormSwitchInput } from "./impulse-form-switch-input"
import type { FormSwitchInputSetter } from "./impulse-form-switch-input-setter"
import type { FormSwitchOutput } from "./impulse-form-switch-output"
import type { FormSwitchOutputVerbose } from "./impulse-form-switch-output-verbose"
import type { FormSwitchValidateOn } from "./impulse-form-switch-validate-on"
import type { FormSwitchValidateOnSetter } from "./impulse-form-switch-validate-on-setter"
import type { FormSwitchValidateOnVerbose } from "./impulse-form-switch-validate-on-verbose"

interface FormSwitchParams<TKind extends SignalForm, TBranches extends FormSwitchBranches<TKind>>
  extends SignalFormParams {
  "input.schema": FormSwitchInput<TKind, TBranches>
  "input.setter": FormSwitchInputSetter<TKind, TBranches>

  "output.schema": FormSwitchOutput<TKind, TBranches>
  "output.schema.verbose": FormSwitchOutputVerbose<TKind, TBranches>

  "flag.setter": FormSwitchFlagSetter<TKind, TBranches>
  "flag.schema": FormSwitchFlag<TKind, TBranches>
  "flag.schema.verbose": FormSwitchFlagVerbose<TKind, TBranches>

  "validateOn.setter": FormSwitchValidateOnSetter<TKind, TBranches>
  "validateOn.schema": FormSwitchValidateOn<TKind, TBranches>
  "validateOn.schema.verbose": FormSwitchValidateOnVerbose<TKind, TBranches>

  "error.setter": FormSwitchErrorSetter<TKind, TBranches>
  "error.schema": FormSwitchError<TKind, TBranches>
  "error.schema.verbose": FormSwitchErrorVerbose<TKind, TBranches>
}

export type { FormSwitchParams }
