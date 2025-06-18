import { isNull } from "~/tools/is-null"
import { resolveSetter } from "~/tools/setter"

import { Impulse, type ReadonlyImpulse } from "../dependencies"
import type { ImpulseFormState } from "../impulse-form/impulse-form-state"
import type { Result } from "../result"
import type { ValidateStrategy } from "../validate-strategy"

import type { ImpulseFormUnitParams } from "./_impulse-form-unit-params"
import type { ImpulseFormUnitTransform } from "./_impulse-form-unit-transform"
import type { ImpulseFormUnitErrorSetter } from "./impulse-form-unit-error-setter"
import type { ImpulseFormUnitInputSetter } from "./impulse-form-unit-input-setter"

export class ImpulseFormUnitState<TInput, TError, TOutput>
  implements ImpulseFormState<ImpulseFormUnitParams<TInput, TError, TOutput>>
{
  public readonly _outputVerbose = Impulse((scope) => {
    const [, output] = this._result.getValue(scope)

    return output
  })

  public _output = this._outputVerbose

  public readonly _error = Impulse<null | TError>((scope) => {
    const [customError] = this._result.getValue(scope)

    return customError
  }, this._customError)

  public _errorVerbose = this._error

  public _validateOnVerbose = this._validateOn

  public readonly _valid = Impulse((scope) => {
    const error = this._error.getValue(scope)

    return isNull(error)
  })

  public _validVerbose = this._valid

  public readonly _invalid = Impulse((scope) => {
    const error = this._error.getValue(scope)

    return !isNull(error)
  })

  public _invalidVerbose = this._invalid

  public _validatedVerbose = this._validated

  public _touchedVerbose = this._touched

  public _dirtyVerbose = this._dirty

  public constructor(
    public readonly _input: Impulse<TInput>,
    public readonly _initial: Impulse<TInput>,
    public readonly _transform: Impulse<
      ImpulseFormUnitTransform<TInput, TError, TOutput>
    >,
    public readonly _touched: Impulse<boolean>,
    public readonly _dirty: ReadonlyImpulse<boolean>,
    public readonly _validateOn: Impulse<ValidateStrategy>,
    public readonly _validated: Impulse<boolean>,
    private readonly _customError: Impulse<null | TError>,
    private readonly _result: ReadonlyImpulse<Result<null | TError, TOutput>>,
  ) {}

  public _resolveInputSetter(
    setter: ImpulseFormUnitInputSetter<TInput>,
    current: TInput,
    additional: TInput,
  ): TInput {
    return resolveSetter(setter, current, additional)
  }

  public _resolveErrorSetter(
    setter: ImpulseFormUnitErrorSetter<TError>,
    current: null | TError,
  ): null | TError {
    return resolveSetter(setter, current)
  }

  public _resolveValidateOnSetter(
    setter: ImpulseFormUnitParams<TInput, TError, TOutput>["validateOn.setter"],
    current: ValidateStrategy,
  ): ValidateStrategy {
    return resolveSetter(setter, current)
  }

  public _resolveFlagSetter(
    setter: ImpulseFormUnitParams<TInput, TError, TOutput>["flag.setter"],
    current: boolean,
  ): boolean {
    return resolveSetter(setter, current)
  }
}
