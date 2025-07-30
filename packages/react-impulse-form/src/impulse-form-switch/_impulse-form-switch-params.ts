import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"

import type { ImpulseFormSwitchError } from "./_impulse-form-switch-error"
import type { ImpulseFormSwitchErrorSetter } from "./_impulse-form-switch-error-setter"
import type { ImpulseFormSwitchErrorVerbose } from "./_impulse-form-switch-error-verbose"
import type { ImpulseFormSwitchFlag } from "./_impulse-form-switch-flag"
import type { ImpulseFormSwitchFlagSetter } from "./_impulse-form-switch-flag-setter"
import type { ImpulseFormSwitchFlagVerbose } from "./_impulse-form-switch-flag-verbose"
import type { ImpulseFormSwitchInput } from "./_impulse-form-switch-input"
import type { ImpulseFormSwitchInputSetter } from "./_impulse-form-switch-input-setter"
import type { ImpulseFormSwitchOutput } from "./_impulse-form-switch-output"
import type { ImpulseFormSwitchOutputVerbose } from "./_impulse-form-switch-output-verbose"
import type { ImpulseFormSwitchValidateOn } from "./_impulse-form-switch-validate-on"
import type { ImpulseFormSwitchValidateOnSetter } from "./_impulse-form-switch-validate-on-setter"
import type { ImpulseFormSwitchValidateOnVerbose } from "./_impulse-form-switch-validate-on-verbose"
import type { ImpulseFormSwitchCases } from "./impulse-form-switch-cases"

export interface ImpulseFormSwitchParams<TCases extends ImpulseFormSwitchCases>
  extends ImpulseFormParams {
  "input.schema": ImpulseFormSwitchInput<TCases>
  "input.setter": ImpulseFormSwitchInputSetter<TCases>

  "output.schema": ImpulseFormSwitchOutput<TCases>
  "output.schema.verbose": ImpulseFormSwitchOutputVerbose<TCases>

  "flag.setter": ImpulseFormSwitchFlagSetter<TCases>
  "flag.schema": ImpulseFormSwitchFlag<TCases>
  "flag.schema.verbose": ImpulseFormSwitchFlagVerbose<TCases>

  "validateOn.setter": ImpulseFormSwitchValidateOnSetter<TCases>
  "validateOn.schema": ImpulseFormSwitchValidateOn<TCases>
  "validateOn.schema.verbose": ImpulseFormSwitchValidateOnVerbose<TCases>

  "error.setter": ImpulseFormSwitchErrorSetter<TCases>
  "error.schema": ImpulseFormSwitchError<TCases>
  "error.schema.verbose": ImpulseFormSwitchErrorVerbose<TCases>
}
