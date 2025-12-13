import type { SignalForm } from "../impulse-form/impulse-form"
import type { SignalFormParams } from "../impulse-form/impulse-form-params"

import type { FormOptionalError } from "./impulse-form-optional-error"
import type { FormOptionalErrorSetter } from "./impulse-form-optional-error-setter"
import type { FormOptionalErrorVerbose } from "./impulse-form-optional-error-verbose"
import type { FormOptionalFlag } from "./impulse-form-optional-flag"
import type { FormOptionalFlagSetter } from "./impulse-form-optional-flag-setter"
import type { FormOptionalFlagVerbose } from "./impulse-form-optional-flag-verbose"
import type { FormOptionalInput } from "./impulse-form-optional-input"
import type { FormOptionalInputSetter } from "./impulse-form-optional-input-setter"
import type { FormOptionalOutput } from "./impulse-form-optional-output"
import type { FormOptionalOutputVerbose } from "./impulse-form-optional-output-verbose"
import type { FormOptionalValidateOn } from "./impulse-form-optional-validate-on"
import type { FormOptionalValidateOnSetter } from "./impulse-form-optional-validate-on-setter"
import type { FormOptionalValidateOnVerbose } from "./impulse-form-optional-validate-on-verbose"

interface FormOptionalParams<TEnabled extends SignalForm, TElement extends SignalForm>
  extends SignalFormParams {
  "input.schema": FormOptionalInput<TEnabled, TElement>
  "input.setter": FormOptionalInputSetter<TEnabled, TElement>

  "output.schema": FormOptionalOutput<TElement>
  "output.schema.verbose": FormOptionalOutputVerbose<TEnabled, TElement>

  "flag.setter": FormOptionalFlagSetter<TEnabled, TElement>
  "flag.schema": FormOptionalFlag<TEnabled, TElement>
  "flag.schema.verbose": FormOptionalFlagVerbose<TEnabled, TElement>

  "validateOn.setter": FormOptionalValidateOnSetter<TEnabled, TElement>
  "validateOn.schema": FormOptionalValidateOn<TEnabled, TElement>
  "validateOn.schema.verbose": FormOptionalValidateOnVerbose<TEnabled, TElement>

  "error.setter": FormOptionalErrorSetter<TEnabled, TElement>
  "error.schema": FormOptionalError<TEnabled, TElement>
  "error.schema.verbose": FormOptionalErrorVerbose<TEnabled, TElement>
}

export type { FormOptionalParams }
