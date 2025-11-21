import type { ImpulseForm, ImpulseFormParams } from "../impulse-form"

import type { ImpulseFormListError } from "./impulse-form-list-error"
import type { ImpulseFormListErrorSetter } from "./impulse-form-list-error-setter"
import type { ImpulseFormListErrorVerbose } from "./impulse-form-list-error-verbose"
import type { ImpulseFormListFlag } from "./impulse-form-list-flag"
import type { ImpulseFormListFlagSetter } from "./impulse-form-list-flag-setter"
import type { ImpulseFormListFlagVerbose } from "./impulse-form-list-flag-verbose"
import type { ImpulseFormListInput } from "./impulse-form-list-input"
import type { ImpulseFormListInputSetter } from "./impulse-form-list-input-setter"
import type { ImpulseFormListOutput } from "./impulse-form-list-output"
import type { ImpulseFormListOutputVerbose } from "./impulse-form-list-output-verbose"
import type { ImpulseFormListValidateOn } from "./impulse-form-list-validate-on"
import type { ImpulseFormListValidateOnSetter } from "./impulse-form-list-validate-on-setter"
import type { ImpulseFormListValidateOnVerbose } from "./impulse-form-list-validate-on-verbose"

export interface ImpulseFormListParams<TElement extends ImpulseForm> extends ImpulseFormParams {
  "input.schema": ImpulseFormListInput<TElement>
  "input.setter": ImpulseFormListInputSetter<TElement>

  "output.schema": ImpulseFormListOutput<TElement>
  "output.schema.verbose": ImpulseFormListOutputVerbose<TElement>

  "flag.setter": ImpulseFormListFlagSetter<TElement>
  "flag.schema": ImpulseFormListFlag<TElement>
  "flag.schema.verbose": ImpulseFormListFlagVerbose<TElement>

  "validateOn.setter": ImpulseFormListValidateOnSetter<TElement>
  "validateOn.schema": ImpulseFormListValidateOn<TElement>
  "validateOn.schema.verbose": ImpulseFormListValidateOnVerbose<TElement>

  "error.setter": ImpulseFormListErrorSetter<TElement>
  "error.schema": ImpulseFormListError<TElement>
  "error.schema.verbose": ImpulseFormListErrorVerbose<TElement>
}
