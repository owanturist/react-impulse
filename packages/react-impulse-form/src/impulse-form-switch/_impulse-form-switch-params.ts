import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"

import type { ImpulseFormSwitchError } from "./_impulse-form-switch-error"
import type { ImpulseFormSwitchErrorSetter } from "./_impulse-form-switch-error-setter"
import type { ImpulseFormSwitchErrorVerbose } from "./_impulse-form-switch-error-verbose"
import type { ImpulseFormSwitchFlag } from "./_impulse-form-switch-flag"
import type { ImpulseFormSwitchFlagSetter } from "./_impulse-form-switch-flag-setter"
import type { ImpulseFormSwitchFlagVerbose } from "./_impulse-form-switch-flag-verbose"
import type { ImpulseFormSwitchInput } from "./_impulse-form-switch-input"
import type { ImpulseFormSwitchInputSetter } from "./_impulse-form-switch-input-setter"
import type { ImpulseFormSwitchKindParams } from "./_impulse-form-switch-kind-params"
import type { ImpulseFormSwitchOutput } from "./_impulse-form-switch-output"
import type { ImpulseFormSwitchOutputVerbose } from "./_impulse-form-switch-output-verbose"
import type { ImpulseFormSwitchValidateOn } from "./_impulse-form-switch-validate-on"
import type { ImpulseFormSwitchValidateOnSetter } from "./_impulse-form-switch-validate-on-setter"
import type { ImpulseFormSwitchValidateOnVerbose } from "./_impulse-form-switch-validate-on-verbose"
import type { ImpulseFormSwitchBranches } from "./impulse-form-switch-branches"

export interface ImpulseFormSwitchParams<
  TKind extends ImpulseForm<ImpulseFormSwitchKindParams<keyof TBranches>>,
  TBranches extends ImpulseFormSwitchBranches,
> extends ImpulseFormParams {
  "input.schema": ImpulseFormSwitchInput<TKind, TBranches>
  "input.setter": ImpulseFormSwitchInputSetter<TKind, TBranches>

  "output.schema": ImpulseFormSwitchOutput<TKind, TBranches>
  "output.schema.verbose": ImpulseFormSwitchOutputVerbose<TKind, TBranches>

  "flag.setter": ImpulseFormSwitchFlagSetter<TBranches>
  "flag.schema": ImpulseFormSwitchFlag<TBranches>
  "flag.schema.verbose": ImpulseFormSwitchFlagVerbose<TBranches>

  "validateOn.setter": ImpulseFormSwitchValidateOnSetter<TBranches>
  "validateOn.schema": ImpulseFormSwitchValidateOn<TBranches>
  "validateOn.schema.verbose": ImpulseFormSwitchValidateOnVerbose<TBranches>

  "error.setter": ImpulseFormSwitchErrorSetter<TBranches>
  "error.schema": ImpulseFormSwitchError<TBranches>
  "error.schema.verbose": ImpulseFormSwitchErrorVerbose<TBranches>
}
