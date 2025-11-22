import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"
import type { ValidateStrategy } from "../validate-strategy"

import type { ImpulseFormUnitErrorSetter } from "./impulse-form-unit-error-setter"
import type { ImpulseFormUnitFlagSetter } from "./impulse-form-unit-flag-setter"
import type { ImpulseFormUnitInputSetter } from "./impulse-form-unit-input-setter"
import type { ImpulseFormUnitValidateOnSetter } from "./impulse-form-unit-validate-on-setter"

interface ImpulseFormUnitParams<TInput, TError, TOutput> extends ImpulseFormParams {
  readonly "input.setter": ImpulseFormUnitInputSetter<TInput>
  readonly "input.schema": TInput

  readonly "output.schema": TOutput
  readonly "output.schema.verbose": null | TOutput

  readonly "flag.setter": ImpulseFormUnitFlagSetter
  readonly "flag.schema": boolean
  readonly "flag.schema.verbose": boolean

  readonly "validateOn.setter": ImpulseFormUnitValidateOnSetter
  readonly "validateOn.schema": ValidateStrategy
  readonly "validateOn.schema.verbose": ValidateStrategy

  readonly "error.setter": ImpulseFormUnitErrorSetter<TError>
  readonly "error.schema": null | TError
  readonly "error.schema.verbose": null | TError
}

export type { ImpulseFormUnitParams }
