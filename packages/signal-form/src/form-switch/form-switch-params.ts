import type { SignalForm } from "../signal-form/signal-form"
import type { SignalFormParams } from "../signal-form/signal-form-params"

import type { FormSwitchBranches } from "./form-switch-branches"
import type { FormSwitchError } from "./form-switch-error"
import type { FormSwitchErrorSetter } from "./form-switch-error-setter"
import type { FormSwitchErrorVerbose } from "./form-switch-error-verbose"
import type { FormSwitchFlag } from "./form-switch-flag"
import type { FormSwitchFlagSetter } from "./form-switch-flag-setter"
import type { FormSwitchFlagVerbose } from "./form-switch-flag-verbose"
import type { FormSwitchInput } from "./form-switch-input"
import type { FormSwitchInputSetter } from "./form-switch-input-setter"
import type { FormSwitchOutput } from "./form-switch-output"
import type { FormSwitchOutputVerbose } from "./form-switch-output-verbose"
import type { FormSwitchValidateOn } from "./form-switch-validate-on"
import type { FormSwitchValidateOnSetter } from "./form-switch-validate-on-setter"
import type { FormSwitchValidateOnVerbose } from "./form-switch-validate-on-verbose"

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
