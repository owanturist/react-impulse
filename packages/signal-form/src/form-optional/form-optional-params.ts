import type { SignalForm } from "../signal-form/signal-form"
import type { SignalFormParams } from "../signal-form/signal-form-params"

import type { FormOptionalError } from "./form-optional-error"
import type { FormOptionalErrorSetter } from "./form-optional-error-setter"
import type { FormOptionalErrorVerbose } from "./form-optional-error-verbose"
import type { FormOptionalFlag } from "./form-optional-flag"
import type { FormOptionalFlagSetter } from "./form-optional-flag-setter"
import type { FormOptionalFlagVerbose } from "./form-optional-flag-verbose"
import type { FormOptionalInput } from "./form-optional-input"
import type { FormOptionalInputSetter } from "./form-optional-input-setter"
import type { FormOptionalOutput } from "./form-optional-output"
import type { FormOptionalOutputVerbose } from "./form-optional-output-verbose"
import type { FormOptionalValidateOn } from "./form-optional-validate-on"
import type { FormOptionalValidateOnSetter } from "./form-optional-validate-on-setter"
import type { FormOptionalValidateOnVerbose } from "./form-optional-validate-on-verbose"

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
