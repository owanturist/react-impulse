import { isNull } from "~/tools/is-null"
import { params } from "~/tools/params"
import { resolveSetter } from "~/tools/setter"

import {
  type Compare,
  Impulse,
  type ReadonlyImpulse,
  batch,
} from "../dependencies"
import { ImpulseFormState } from "../impulse-form/impulse-form-state"
import type { Result } from "../result"
import {
  VALIDATE_ON_CHANGE,
  VALIDATE_ON_INIT,
  VALIDATE_ON_SUBMIT,
  VALIDATE_ON_TOUCH,
  type ValidateStrategy,
} from "../validate-strategy"

import type { ImpulseFormUnitParams } from "./_impulse-form-unit-params"
import {
  type ImpulseFormUnitTransform,
  transformFromTransformer,
} from "./_impulse-form-unit-transform"
import type { ImpulseFormUnitErrorSetter } from "./impulse-form-unit-error-setter"
import type { ImpulseFormUnitInputSetter } from "./impulse-form-unit-input-setter"
import type { ImpulseFormUnitTransformer } from "./impulse-form-unit-transformer"
import type { ImpulseFormUnitValidateOnSetter } from "./impulse-form-unit-validate-on-setter"

export class ImpulseFormUnitState<
  TInput,
  TError,
  TOutput,
> extends ImpulseFormState<ImpulseFormUnitParams<TInput, TError, TOutput>> {
  public constructor(
    public readonly _input: Impulse<TInput>,
    public readonly _initial: Impulse<TInput>,
    public readonly _customError: Impulse<null | TError>,
    public readonly _validateOn: Impulse<ValidateStrategy>,
    public readonly _touched: Impulse<boolean>,
    private readonly _transform: Impulse<
      ImpulseFormUnitTransform<TInput, TError, TOutput>
    >,
    isInputDirty: Compare<TInput>,
    isOutputEqual: Compare<null | TOutput>,
    isErrorEqual: Compare<null | TError>,
  ) {
    super()

    // holds the actual validated state
    const validated = Impulse(false)

    this._validated = this._validatedVerbose = Impulse<boolean>(
      // mixes the validated and invalid states
      (scope) => validated.getValue(scope) || this._invalid.getValue(scope),
      // proxies the validated setter where `false` means just "validate if not validated yet"
      // and `true` means "revalidate even if already validated"
      (revalidate, scope) => {
        validated.setValue((_validated) => {
          if (!revalidate && _validated) {
            return true
          }

          if (_transform.getValue(scope)._transformer) {
            return true
          }

          switch (_validateOn.getValue(scope)) {
            case VALIDATE_ON_INIT: {
              return true
            }

            case VALIDATE_ON_TOUCH: {
              return _touched.getValue(scope)
            }

            case VALIDATE_ON_CHANGE: {
              return this._dirty.getValue(scope)
            }

            case VALIDATE_ON_SUBMIT: {
              return false
            }
          }
        })
      },
    )

    const result = Impulse<Result<null | TError, TOutput>>((scope) => {
      const customError = _customError.getValue(scope)

      if (!isNull(customError)) {
        return [customError, null]
      }

      const input = _input.getValue(scope)
      const transform = _transform.getValue(scope)

      const [error, output] = transform._validator(input)

      if (!isNull(output)) {
        return [null, output]
      }

      return [validated.getValue(scope) ? error : null, null]
    })

    this._error = this._errorVerbose = Impulse(
      (scope) => {
        const [error] = result.getValue(scope)

        return error
      },
      {
        compare: isErrorEqual,
      },
    )

    this._output = this._outputVerbose = Impulse(
      (scope) => {
        const [, output] = result.getValue(scope)

        return output
      },
      {
        compare: isOutputEqual,
      },
    )

    this._dirty = this._dirtyVerbose = Impulse((scope) => {
      const initial = _initial.getValue(scope)
      const input = _input.getValue(scope)

      return isInputDirty(initial, input, scope)
    })

    this._validated.setValue(false)
  }

  public _setInput(setter: ImpulseFormUnitInputSetter<TInput>): void {
    batch((scope) => {
      const before = this._input.getValue(scope)

      this._input.setValue(
        resolveSetter(setter, before, this._initial.getValue(scope)),
      )

      const after = this._input.getValue(scope)

      if (before !== after) {
        this._validated.setValue(false)
      }
    })
  }

  public _setInitial(setter: ImpulseFormUnitInputSetter<TInput>): void {
    batch((scope) => {
      const before = this._initial.getValue(scope)

      this._initial.setValue(
        resolveSetter(setter, before, this._input.getValue(scope)),
      )

      const after = this._initial.getValue(scope)

      if (before !== after) {
        this._validated.setValue(false)
      }
    })
  }

  public readonly _error: ReadonlyImpulse<null | TError>
  public readonly _errorVerbose: ReadonlyImpulse<null | TError>

  public _setError(setter: ImpulseFormUnitErrorSetter<TError>): void {
    this._customError.setValue((error) => resolveSetter(setter, error))
  }

  public readonly _validateOnVerbose = this._validateOn

  public _setValidateOn(setter: ImpulseFormUnitValidateOnSetter): void {
    batch((scope) => {
      const before = this._validateOn.getValue(scope)

      this._validateOn.setValue(resolveSetter(setter, before))

      const after = this._validateOn.getValue(scope)

      if (before !== after) {
        this._validated.setValue(true)
      }
    })
  }

  public readonly _touchedVerbose = this._touched

  public _setTouched(
    setter: ImpulseFormUnitParams<TInput, TError, TOutput>["flag.setter"],
  ): void {
    batch(() => {
      this._touched.setValue((touched) => resolveSetter(setter, touched))
      this._validated.setValue(false)
    })
  }

  public readonly _output: ReadonlyImpulse<null | TOutput>
  public readonly _outputVerbose: ReadonlyImpulse<null | TOutput>

  public readonly _valid = Impulse((scope) => {
    const error = this._error.getValue(scope)

    return isNull(error)
  })

  public readonly _validVerbose = this._valid

  public readonly _invalid = Impulse((scope) => {
    const error = this._error.getValue(scope)

    return !isNull(error)
  })

  public readonly _invalidVerbose = this._invalid

  public readonly _validated: Impulse<boolean>
  public readonly _validatedVerbose: ReadonlyImpulse<boolean>

  public readonly _dirty: ReadonlyImpulse<boolean>
  public readonly _dirtyVerbose: ReadonlyImpulse<boolean>

  public _reset(
    resetter: ImpulseFormUnitInputSetter<TInput> = params._first,
  ): void {
    batch((scope) => {
      const resetValue = resolveSetter(
        resetter,
        this._initial.getValue(scope),
        this._input.getValue(scope),
      )

      this._setInitial(resetValue)
      this._setInput(resetValue)
      // TODO test when reset for all below
      this._touched.setValue(false)
      this._customError.setValue(null)
      this._validated.setValue(true)
    })
  }

  public _getChildren(): ReadonlyArray<never> {
    return []
  }

  public _setTransform(
    transformer: ImpulseFormUnitTransformer<TInput, TOutput>,
  ): void {
    batch(() => {
      this._transform.setValue(transformFromTransformer(transformer))
      this._validated.setValue(false)
    })
  }
}
