import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isUndefined } from "~/tools/is-undefined"
import type { Lazy } from "~/tools/lazy"
import { resolveSetter } from "~/tools/setter"

import {
  type Compare,
  Impulse,
  type ReadonlyImpulse,
  batch,
  untrack,
} from "../dependencies"
import type { ImpulseFormParams } from "../impulse-form/impulse-form-params"
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
    parent: null | Lazy<ImpulseFormState<ImpulseFormParams>>,
    public readonly _initial: Impulse<TInput>,
    public readonly _input: Impulse<TInput>,
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
    super(parent)

    const _dirty = Impulse((scope) => {
      const initial = _initial.getValue(scope)
      const input = _input.getValue(scope)

      return isInputDirty(initial, input, scope)
    })

    // persist the validated state
    const validated = Impulse(false)

    // derives the validated states
    this._validated = this._validatedVerbose = Impulse<boolean>(
      // mixes the validated and invalid states
      (scope) => validated.getValue(scope) || this._invalid.getValue(scope),
      // proxies the validated setter where `false` means revalidate
      // and `true` sets the validated state to `true`
      (next, scope) => {
        validated.setValue(() => {
          if (next || _transform.getValue(scope)._transformer) {
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
              return _dirty.getValue(scope)
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

    this._dirty = this._dirtyVerbose = _dirty

    this._validated.setValue(false)
  }

  public _setInput(
    setter: ImpulseFormUnitInputSetter<TInput>,
    input: Lazy<TInput>,
    initial: Lazy<TInput>,
  ): void {
    const next = isFunction(setter)
      ? setter(input._peek(), initial._peek())
      : setter

    this._input.setValue(next)

    if (!untrack(this._validated)) {
      this._validated.setValue(false)
    }
  }

  public _setInitial(setter: ImpulseFormUnitInputSetter<TInput>): void {
    batch((scope) => {
      const before = this._initial.getValue(scope)

      this._initial.setValue(
        resolveSetter(setter, before, this._input.getValue(scope)),
      )

      const after = this._initial.getValue(scope)

      if (before !== after && !this._validated.getValue(scope)) {
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
        this._validated.setValue(false)
      }
    })
  }

  public readonly _touchedVerbose = this._touched

  public _setTouched(
    setter: ImpulseFormUnitParams<TInput, TError, TOutput>["flag.setter"],
  ): void {
    batch((scope) => {
      this._touched.setValue((touched) => resolveSetter(setter, touched))
      if (!this._validated.getValue(scope)) {
        this._validated.setValue(false)
      }
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

  public override _forceValidated(): void {
    this._validated.setValue(true)
  }

  public readonly _dirty: ReadonlyImpulse<boolean>
  public readonly _dirtyVerbose: ReadonlyImpulse<boolean>

  public _reset(
    resetter: undefined | ImpulseFormUnitInputSetter<TInput>,
    initial: Lazy<TInput>,
    input: Lazy<TInput>,
  ): void {
    const resetValue = isUndefined(resetter)
      ? initial._peek()
      : isFunction(resetter)
        ? resetter(initial._peek(), input._peek())
        : resetter

    this._initial.setValue(resetValue)
    this._input.setValue(resetValue)
    // TODO test when reset for all below
    this._touched.setValue(false)
    this._customError.setValue(null)
    this._validated.setValue(false)
  }

  public _getChildren(): ReadonlyArray<never> {
    return []
  }

  public _setTransform(
    transformer: ImpulseFormUnitTransformer<TInput, TOutput>,
  ): void {
    batch((scope) => {
      this._transform.setValue(transformFromTransformer(transformer))
      if (!this._validated.getValue(scope)) {
        this._validated.setValue(false)
      }
    })
  }
}
