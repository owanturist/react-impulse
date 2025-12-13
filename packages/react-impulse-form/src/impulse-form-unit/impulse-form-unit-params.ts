import type { SignalFormParams } from "../impulse-form/impulse-form-params"
import type { ValidateStrategy } from "../validate-strategy"

import type { FormUnitErrorSetter } from "./impulse-form-unit-error-setter"
import type { FormUnitFlagSetter } from "./impulse-form-unit-flag-setter"
import type { FormUnitInputSetter } from "./impulse-form-unit-input-setter"
import type { FormUnitValidateOnSetter } from "./impulse-form-unit-validate-on-setter"

interface FormUnitParams<TInput, TError, TOutput> extends SignalFormParams {
  readonly "input.setter": FormUnitInputSetter<TInput>
  readonly "input.schema": TInput

  readonly "output.schema": TOutput
  readonly "output.schema.verbose": null | TOutput

  readonly "flag.setter": FormUnitFlagSetter
  readonly "flag.schema": boolean
  readonly "flag.schema.verbose": boolean

  readonly "validateOn.setter": FormUnitValidateOnSetter
  readonly "validateOn.schema": ValidateStrategy
  readonly "validateOn.schema.verbose": ValidateStrategy

  readonly "error.setter": FormUnitErrorSetter<TError>
  readonly "error.schema": null | TError
  readonly "error.schema.verbose": null | TError
}

export type { FormUnitParams }
