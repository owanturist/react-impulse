import { isNull } from "~/tools/is-null"
import { resolveSetter } from "~/tools/setter"

import { Impulse, type ReadonlyImpulse } from "../dependencies"
import { ImpulseFormState } from "../impulse-form/impulse-form-state"
import type { Result } from "../result"

import type { ImpulseFormUnitParams } from "./_impulse-form-unit-params"
import type { ImpulseFormUnitSpec } from "./_impulse-form-unit-spec"
import type { ImpulseFormUnitTransform } from "./_impulse-form-unit-transform"
import type { ImpulseFormUnitErrorSetter } from "./impulse-form-unit-error-setter"
import type { ImpulseFormUnitInputSetter } from "./impulse-form-unit-input-setter"

export class ImpulseFormUnitState<
  TInput,
  TError,
  TOutput,
> extends ImpulseFormState<ImpulseFormUnitParams<TInput, TError, TOutput>> {
  private readonly _validated = Impulse(false)

  private readonly _result: ReadonlyImpulse<Result<null | TError, TOutput>>

  public readonly _outputVerbose = Impulse((scope) => {
    const [, output] = this._result.getValue(scope)

    return output
  })

  public readonly _output = this._outputVerbose

  public readonly _errorVerbose = Impulse<null | TError>((scope) => {
    const [customError] = this._result.getValue(scope)

    return customError
  }, this._customError)

  public readonly _error = this._errorVerbose

  public constructor(
    spec: ImpulseFormUnitSpec<TInput, TError, TOutput>,
    public readonly _input: Impulse<TInput>,
    public readonly _initial: Impulse<TInput>,
    private readonly _customError: Impulse<null | TError>,
    private readonly _transform: Impulse<
      ImpulseFormUnitTransform<TInput, TError, TOutput>
    >,
  ) {
    super()

    this._result = Impulse(
      (scope) => {
        const customError = this._customError.getValue(scope)

        if (!isNull(customError)) {
          return [customError, null]
        }

        const input = this._input.getValue(scope)
        const transform = this._transform.getValue(scope)

        const [error, output] = transform._validator(input)

        if (!isNull(output)) {
          return [null, output]
        }

        return [this._validated.getValue(scope) ? error : null, null]
      },
      {
        compare: (
          [leftError, leftOutput],
          [rightError, rightOutput],
          scope,
        ) => {
          return (
            spec._isErrorEqual(leftError, rightError, scope) &&
            spec._isOutputEqual(leftOutput, rightOutput, scope)
          )
        },
      },
    )
  }

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
}
