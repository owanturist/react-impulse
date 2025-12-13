import type { SignalForm } from "../signal-form/signal-form"
import type { SignalFormParams } from "../signal-form/signal-form-params"

import type { FormListError } from "./form-list-error"
import type { FormListErrorSetter } from "./form-list-error-setter"
import type { FormListErrorVerbose } from "./form-list-error-verbose"
import type { FormListFlag } from "./form-list-flag"
import type { FormListFlagSetter } from "./form-list-flag-setter"
import type { FormListFlagVerbose } from "./form-list-flag-verbose"
import type { FormListInput } from "./form-list-input"
import type { FormListInputSetter } from "./form-list-input-setter"
import type { FormListOutput } from "./form-list-output"
import type { FormListOutputVerbose } from "./form-list-output-verbose"
import type { FormListValidateOn } from "./form-list-validate-on"
import type { FormListValidateOnSetter } from "./form-list-validate-on-setter"
import type { FormListValidateOnVerbose } from "./form-list-validate-on-verbose"

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
