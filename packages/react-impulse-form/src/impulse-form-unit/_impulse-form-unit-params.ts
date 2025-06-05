import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"
import type { ValidateStrategy } from "../validate-strategy"

import type { ImpulseFormUnitErrorSetter } from "./impulse-form-unit-error-setter"
import type { ImpulseFormUnitFlagSetter } from "./impulse-form-unit-flag-setter"
import type { ImpulseFormUnitInputSetter } from "./impulse-form-unit-input-setter"
import type { ImpulseFormUnitValidateOnSetter } from "./impulse-form-unit-validate-on-setter"

export interface ImpulseFormUnitParams<TInput, TError, TOutput>
  extends ImpulseFormParams {
  "input.setter": ImpulseFormUnitInputSetter<TInput>
  "input.schema": TInput

  "output.schema": TOutput
  "output.schema.verbose": null | TOutput

  "flag.setter": ImpulseFormUnitFlagSetter
  "flag.schema": boolean
  "flag.schema.verbose": boolean

  "validateOn.setter": ImpulseFormUnitValidateOnSetter
  "validateOn.schema": ValidateStrategy
  "validateOn.schema.verbose": ValidateStrategy

  "error.setter": ImpulseFormUnitErrorSetter<TError>
  "error.schema": null | TError
  "error.schema.verbose": null | TError
}
