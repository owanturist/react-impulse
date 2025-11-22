import type { ImpulseForm, ImpulseFormParams } from "../impulse-form"

import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"
import type { ImpulseFormSwitchError } from "./impulse-form-switch-error"
import type { ImpulseFormSwitchErrorSetter } from "./impulse-form-switch-error-setter"
import type { ImpulseFormSwitchErrorVerbose } from "./impulse-form-switch-error-verbose"
import type { ImpulseFormSwitchFlag } from "./impulse-form-switch-flag"
import type { ImpulseFormSwitchFlagSetter } from "./impulse-form-switch-flag-setter"
import type { ImpulseFormSwitchFlagVerbose } from "./impulse-form-switch-flag-verbose"
import type { ImpulseFormSwitchInput } from "./impulse-form-switch-input"
import type { ImpulseFormSwitchInputSetter } from "./impulse-form-switch-input-setter"
import type { ImpulseFormSwitchOutput } from "./impulse-form-switch-output"
import type { ImpulseFormSwitchOutputVerbose } from "./impulse-form-switch-output-verbose"
import type { ImpulseFormSwitchValidateOn } from "./impulse-form-switch-validate-on"
import type { ImpulseFormSwitchValidateOnSetter } from "./impulse-form-switch-validate-on-setter"
import type { ImpulseFormSwitchValidateOnVerbose } from "./impulse-form-switch-validate-on-verbose"

interface ImpulseFormSwitchParams<
  TKind extends ImpulseForm,
  TBranches extends ImpulseFormSwitchBranches<TKind>,
> extends ImpulseFormParams {
  "input.schema": ImpulseFormSwitchInput<TKind, TBranches>
  "input.setter": ImpulseFormSwitchInputSetter<TKind, TBranches>

  "output.schema": ImpulseFormSwitchOutput<TKind, TBranches>
  "output.schema.verbose": ImpulseFormSwitchOutputVerbose<TKind, TBranches>

  "flag.setter": ImpulseFormSwitchFlagSetter<TKind, TBranches>
  "flag.schema": ImpulseFormSwitchFlag<TKind, TBranches>
  "flag.schema.verbose": ImpulseFormSwitchFlagVerbose<TKind, TBranches>

  "validateOn.setter": ImpulseFormSwitchValidateOnSetter<TKind, TBranches>
  "validateOn.schema": ImpulseFormSwitchValidateOn<TKind, TBranches>
  "validateOn.schema.verbose": ImpulseFormSwitchValidateOnVerbose<TKind, TBranches>

  "error.setter": ImpulseFormSwitchErrorSetter<TKind, TBranches>
  "error.schema": ImpulseFormSwitchError<TKind, TBranches>
  "error.schema.verbose": ImpulseFormSwitchErrorVerbose<TKind, TBranches>
}

export type { ImpulseFormSwitchParams }
