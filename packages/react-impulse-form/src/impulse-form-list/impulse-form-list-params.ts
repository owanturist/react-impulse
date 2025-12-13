import type { SignalForm } from "../impulse-form/impulse-form"
import type { SignalFormParams } from "../impulse-form/impulse-form-params"

import type { FormListError } from "./impulse-form-list-error"
import type { FormListErrorSetter } from "./impulse-form-list-error-setter"
import type { FormListErrorVerbose } from "./impulse-form-list-error-verbose"
import type { FormListFlag } from "./impulse-form-list-flag"
import type { FormListFlagSetter } from "./impulse-form-list-flag-setter"
import type { FormListFlagVerbose } from "./impulse-form-list-flag-verbose"
import type { FormListInput } from "./impulse-form-list-input"
import type { FormListInputSetter } from "./impulse-form-list-input-setter"
import type { FormListOutput } from "./impulse-form-list-output"
import type { FormListOutputVerbose } from "./impulse-form-list-output-verbose"
import type { FormListValidateOn } from "./impulse-form-list-validate-on"
import type { FormListValidateOnSetter } from "./impulse-form-list-validate-on-setter"
import type { FormListValidateOnVerbose } from "./impulse-form-list-validate-on-verbose"

interface FormListParams<TElement extends SignalForm> extends SignalFormParams {
  "input.schema": FormListInput<TElement>
  "input.setter": FormListInputSetter<TElement>

  "output.schema": FormListOutput<TElement>
  "output.schema.verbose": FormListOutputVerbose<TElement>

  "flag.setter": FormListFlagSetter<TElement>
  "flag.schema": FormListFlag<TElement>
  "flag.schema.verbose": FormListFlagVerbose<TElement>

  "validateOn.setter": FormListValidateOnSetter<TElement>
  "validateOn.schema": FormListValidateOn<TElement>
  "validateOn.schema.verbose": FormListValidateOnVerbose<TElement>

  "error.setter": FormListErrorSetter<TElement>
  "error.schema": FormListError<TElement>
  "error.schema.verbose": FormListErrorVerbose<TElement>
}

export type { FormListParams }
