import { identity } from "~/tools/identity"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"
import { resolveSetter } from "~/tools/setter"

import {
  type Compare,
  Impulse,
  type ReadonlyImpulse,
  type Scope,
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

import { ImpulseFormUnit } from "./_impulse-form-unit"
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
  public readonly _host = Lazy(() => new ImpulseFormUnit(this))

  public constructor(
    parent: null | ImpulseFormState,
    public readonly _initialState: Impulse<{
      _explicit: Impulse<boolean>
      _current: Impulse<TInput>
    }>,
    public readonly _input: Impulse<TInput>,
    private readonly _customError: Impulse<null | TError>,
    public readonly _validateOn: Impulse<ValidateStrategy>,
    public readonly _touched: Impulse<boolean>,
    private readonly _transform: Impulse<
      ImpulseFormUnitTransform<TInput, TError, TOutput>
    >,
    private readonly _isInputDirty: Compare<TInput>,
    private readonly _isInputEqual: Compare<TInput>,
    private readonly _isOutputEqual: Compare<null | TOutput>,
    private readonly _isErrorEqual: Compare<null | TError>,
  ) {
    super(parent)

    const result = Impulse((scope): Result<null | TError, TOutput> => {
      const customError_ = this._customError.getValue(scope)

      if (!isNull(customError_)) {
        return [customError_, null]
      }

      const input_ = this._input.getValue(scope)
      const transform = this._transform.getValue(scope)

      const [error, output] = transform._validator(input_)

      if (!isNull(output)) {
        return [null, output]
      }

      return [isValidated.getValue(scope) ? error : null, null]
    })

    this._initial = Impulse(
      (scope): TInput => _initialState.getValue(scope)._current.getValue(scope),
      {
        compare: _isInputEqual,
      },
    )

    this._error = this._errorVerbose = Impulse(
      (scope): null | TError => {
        const [error] = result.getValue(scope)

        return error
      },
      {
        compare: _isErrorEqual,
      },
    )

    this._output = this._outputVerbose = Impulse(
      (scope): null | TOutput => {
        const [, output] = result.getValue(scope)

        return output
      },
      {
        compare: _isOutputEqual,
      },
    )

    this._touchedVerbose = _touched

    this._dirty = this._dirtyVerbose = Impulse((scope): boolean => {
      return _isInputDirty(
        this._initial.getValue(scope),
        this._input.getValue(scope),
        scope,
      )
    })

    this._validateOnVerbose = _validateOn

    this._valid = this._validVerbose = Impulse((scope): boolean => {
      const error = this._error.getValue(scope)

      return isNull(error)
    })

    this._invalid = this._invalidVerbose = Impulse((scope): boolean => {
      const error = this._error.getValue(scope)

      return !isNull(error)
    })

    // persist the validated state
    const isValidated = Impulse(false)

    this._validated = this._validatedVerbose = Impulse(
      // mixes the validated and invalid states
      (scope): boolean => {
        return isValidated.getValue(scope) || this._invalid.getValue(scope)
      },

      // proxies the validated setter where `false` means revalidate
      // and `true` sets the validated state to `true`
      (next, scope) => {
        isValidated.setValue(() => {
          if (next || this._transform.getValue(scope)._transformer) {
            return true
          }

          switch (this._validateOn.getValue(scope)) {
            case VALIDATE_ON_INIT: {
              return true
            }

            case VALIDATE_ON_TOUCH: {
              return this._touched.getValue(scope)
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

    this._validated.setValue(false)
  }

  public _childOf(
    parent: null | ImpulseFormState,
  ): ImpulseFormUnitState<TInput, TError, TOutput> {
    return new ImpulseFormUnitState(
      parent,
      this._initialState.clone(({ _current, _explicit }) => ({
        _current: _current.clone(),
        _explicit: _explicit.clone(),
      })),
      this._input.clone(),
      this._customError.clone(),
      this._validateOn.clone(),
      this._touched.clone(),
      this._transform.clone(),
      this._isInputDirty,
      this._isInputEqual,
      this._isOutputEqual,
      this._isErrorEqual,
    )
  }

  // I N I T I A L

  public _initial: ReadonlyImpulse<TInput>

  public _replaceInitial(
    scope: Scope,
    state: undefined | ImpulseFormUnitState<TInput, TError, TOutput>,
    isMounting: boolean,
  ): void {
    const { _explicit, _current } = this._initialState.getValue(scope)

    if (state) {
      const initialState = state._initialState.getValue(scope)

      if (_explicit.getValue(scope) && isMounting) {
        initialState._explicit.setValue(true)
        initialState._current.setValue(_current.getValue(scope))
      }

      this._initialState.setValue(initialState)
    } else {
      this._initialState.setValue({
        _current: _current.clone(),
        _explicit: _explicit.clone(),
      })
    }
  }

  public _setInitial(
    scope: Scope,
    setter: ImpulseFormUnitInputSetter<TInput>,
  ): void {
    const { _current, _explicit } = this._initialState.getValue(scope)

    _current.setValue((initial) => {
      return isFunction(setter)
        ? setter(initial, this._input.getValue(scope))
        : setter
    })

    _explicit.setValue(true)

    this._validated.setValue(identity)
  }

  // I N P U T

  public _setInput(
    scope: Scope,
    setter: ImpulseFormUnitInputSetter<TInput>,
  ): void {
    this._input.setValue((input) => {
      return isFunction(setter)
        ? setter(input, this._initial.getValue(scope))
        : setter
    })

    this._validated.setValue(identity)
  }

  // E R R O R

  public readonly _error: ReadonlyImpulse<null | TError>

  public readonly _errorVerbose: ReadonlyImpulse<null | TError>

  public _setError(
    _scope: Scope,
    setter: ImpulseFormUnitErrorSetter<TError>,
  ): void {
    this._customError.setValue((error) => resolveSetter(setter, error))
  }

  // V A L I D A T E   O N

  public readonly _validateOnVerbose: ReadonlyImpulse<ValidateStrategy>

  public _setValidateOn(
    scope: Scope,
    setter: ImpulseFormUnitValidateOnSetter,
  ): void {
    const before = this._validateOn.getValue(scope)

    this._validateOn.setValue(resolveSetter(setter, before))

    const after = this._validateOn.getValue(scope)

    if (before !== after) {
      this._validated.setValue(false)
    }
  }

  // T O U C H E D

  public readonly _touchedVerbose: ReadonlyImpulse<boolean>

  public _setTouched(
    _scope: Scope,
    setter: ImpulseFormUnitParams<TInput, TError, TOutput>["flag.setter"],
  ): void {
    this._touched.setValue((touched) => resolveSetter(setter, touched))
    this._validated.setValue(identity)
  }

  // O U T P U T

  public readonly _output: ReadonlyImpulse<null | TOutput>
  public readonly _outputVerbose: ReadonlyImpulse<null | TOutput>

  // V A L I D

  public readonly _valid: ReadonlyImpulse<boolean>
  public readonly _validVerbose: ReadonlyImpulse<boolean>

  // I N V A L I D

  public readonly _invalid: ReadonlyImpulse<boolean>
  public readonly _invalidVerbose: ReadonlyImpulse<boolean>

  // V A L I D A T E D

  public readonly _validated: Impulse<boolean>
  public readonly _validatedVerbose: ReadonlyImpulse<boolean>

  public _forceValidated(): void {
    this._validated.setValue(true)
  }

  // D I R T Y

  public readonly _dirty: ReadonlyImpulse<boolean>
  public readonly _dirtyVerbose: ReadonlyImpulse<boolean>

  public readonly _dirtyOn = Impulse(true)
  public readonly _dirtyOnVerbose = this._dirtyOn

  // R E S E T

  public _reset(
    scope: Scope,
    resetter: undefined | ImpulseFormUnitInputSetter<TInput>,
  ): void {
    const resetValue = isUndefined(resetter)
      ? this._initial.getValue(scope)
      : isFunction(resetter)
        ? resetter(this._initial.getValue(scope), this._input.getValue(scope))
        : resetter

    this._initialState.getValue(scope)._current.setValue(resetValue)
    this._input.setValue(resetValue)
    // TODO test when reset for all below
    this._touched.setValue(false)
    this._customError.setValue(null)
    this._validated.setValue(false)
  }

  // C H I L D R E N

  public _getChildren(): ReadonlyArray<never> {
    return []
  }

  // C U S T O M

  public _setTransform(
    transformer: ImpulseFormUnitTransformer<TInput, TOutput>,
  ): void {
    batch(() => {
      this._transform.setValue(transformFromTransformer(transformer))
      this._validated.setValue(identity)
    })
  }
}
