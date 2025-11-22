import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"

import type { ImpulseFormOptionalError } from "./impulse-form-optional-error"
import type { ImpulseFormOptionalErrorSetter } from "./impulse-form-optional-error-setter"
import type { ImpulseFormOptionalErrorVerbose } from "./impulse-form-optional-error-verbose"
import type { ImpulseFormOptionalFlag } from "./impulse-form-optional-flag"
import type { ImpulseFormOptionalFlagSetter } from "./impulse-form-optional-flag-setter"
import type { ImpulseFormOptionalFlagVerbose } from "./impulse-form-optional-flag-verbose"
import type { ImpulseFormOptionalInput } from "./impulse-form-optional-input"
import type { ImpulseFormOptionalInputSetter } from "./impulse-form-optional-input-setter"
import type { ImpulseFormOptionalOutput } from "./impulse-form-optional-output"
import type { ImpulseFormOptionalOutputVerbose } from "./impulse-form-optional-output-verbose"
import type { ImpulseFormOptionalValidateOn } from "./impulse-form-optional-validate-on"
import type { ImpulseFormOptionalValidateOnSetter } from "./impulse-form-optional-validate-on-setter"
import type { ImpulseFormOptionalValidateOnVerbose } from "./impulse-form-optional-validate-on-verbose"

interface ImpulseFormOptionalParams<TEnabled extends ImpulseForm, TElement extends ImpulseForm>
  extends ImpulseFormParams {
  "input.schema": ImpulseFormOptionalInput<TEnabled, TElement>
  "input.setter": ImpulseFormOptionalInputSetter<TEnabled, TElement>

  "output.schema": ImpulseFormOptionalOutput<TElement>
  "output.schema.verbose": ImpulseFormOptionalOutputVerbose<TEnabled, TElement>

  "flag.setter": ImpulseFormOptionalFlagSetter<TEnabled, TElement>
  "flag.schema": ImpulseFormOptionalFlag<TEnabled, TElement>
  "flag.schema.verbose": ImpulseFormOptionalFlagVerbose<TEnabled, TElement>

  "validateOn.setter": ImpulseFormOptionalValidateOnSetter<TEnabled, TElement>
  "validateOn.schema": ImpulseFormOptionalValidateOn<TEnabled, TElement>
  "validateOn.schema.verbose": ImpulseFormOptionalValidateOnVerbose<TEnabled, TElement>

  "error.setter": ImpulseFormOptionalErrorSetter<TEnabled, TElement>
  "error.schema": ImpulseFormOptionalError<TEnabled, TElement>
  "error.schema.verbose": ImpulseFormOptionalErrorVerbose<TEnabled, TElement>
}

export type { ImpulseFormOptionalParams }
