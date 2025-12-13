import { type Equal, type Monitor, type ReadonlySignal, Signal, batch } from "@owanturist/signal"

import { identity } from "~/tools/identity"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"
import { resolveSetter } from "~/tools/setter"

import { SignalFormState } from "../../impulse-form/_internal/impulse-form-state"
import type { Result } from "../../result"
import {
  VALIDATE_ON_CHANGE,
  VALIDATE_ON_INIT,
  VALIDATE_ON_SUBMIT,
  VALIDATE_ON_TOUCH,
  type ValidateStrategy,
} from "../../validate-strategy"
import type { FormUnitErrorSetter } from "../impulse-form-unit-error-setter"
import type { FormUnitInputSetter } from "../impulse-form-unit-input-setter"
import type { FormUnitParams } from "../impulse-form-unit-params"
import type { FormUnitTransformer } from "../impulse-form-unit-transformer"
import type { FormUnitValidateOnSetter } from "../impulse-form-unit-validate-on-setter"

import { FormUnit } from "./impulse-form-unit"
import { type FormUnitTransform, transformFromTransformer } from "./impulse-form-unit-transform"

class FormUnitState<TInput, TError, TOutput> extends SignalFormState<
  FormUnitParams<TInput, TError, TOutput>
> {
  public readonly _host = Lazy(() => new FormUnit(this))

  public constructor(
    parent: null | SignalFormState,
    public readonly _initialState: Signal<{
      _explicit: Signal<boolean>
      _current: Signal<TInput>
    }>,
    public readonly _input: Signal<TInput>,
    private readonly _customError: Signal<null | TError>,
    public readonly _validateOn: Signal<ValidateStrategy>,
    public readonly _touched: Signal<boolean>,
    private readonly _transform: Signal<FormUnitTransform<TInput, TError, TOutput>>,
    private readonly _isInputDirty: Equal<TInput>,
    private readonly _isInputEqual: Equal<TInput>,
    private readonly _isOutputEqual: Equal<null | TOutput>,
    private readonly _isErrorEqual: Equal<null | TError>,
  ) {
    super(parent)

    const result = Signal((monitor): Result<null | TError, TOutput> => {
      const customError = _customError.read(monitor)

      if (!isNull(customError)) {
        return [customError, null]
      }

      const input = _input.read(monitor)
      const transform = _transform.read(monitor)

      const [error, output] = transform._validator(input)

      if (!isNull(output)) {
        return [null, output]
      }

      return [isValidated.read(monitor) ? error : null, null]
    })

    this._initial = Signal(
      (monitor): TInput => _initialState.read(monitor)._current.read(monitor),
      {
        equals: _isInputEqual,
      },
    )

    this._error = this._errorVerbose = Signal(
      (monitor): null | TError => {
        const [error] = result.read(monitor)

        return error
      },
      {
        equals: _isErrorEqual,
      },
    )

    this._output = this._outputVerbose = Signal(
      (monitor): null | TOutput => {
        const [, output] = result.read(monitor)

        return output
      },
      {
        equals: _isOutputEqual,
      },
    )

    this._touchedVerbose = _touched

    this._dirty = this._dirtyVerbose = Signal((monitor): boolean =>
      _isInputDirty(this._initial.read(monitor), _input.read(monitor)),
    )

    this._validateOnVerbose = _validateOn

    this._valid = this._validVerbose = Signal((monitor): boolean => {
      const output = this._output.read(monitor)

      return !isNull(output)
    })

    this._invalid = this._invalidVerbose = Signal((monitor): boolean => {
      const error = this._error.read(monitor)

      return !isNull(error)
    })

    // persist the validated state
    const isValidated = Signal(false)

    this._validated = this._validatedVerbose = Signal(
      // mixes the validated and invalid states
      (monitor): boolean => isValidated.read(monitor) || this._invalid.read(monitor),

      // proxies the validated setter where `false` means revalidate
      // and `true` sets the validated state to `true`
      (next, monitor) => {
        isValidated.write(() => {
          if (next || _transform.read(monitor)._transformer) {
            return true
          }

          switch (_validateOn.read(monitor)) {
            case VALIDATE_ON_INIT: {
              return true
            }

            case VALIDATE_ON_TOUCH: {
              return _touched.read(monitor)
            }

            case VALIDATE_ON_CHANGE: {
              return this._dirty.read(monitor)
            }

            case VALIDATE_ON_SUBMIT: {
              return false
            }
          }
        })
      },
    )

    this._validated.write(false)
  }

  public _childOf(parent: null | SignalFormState): FormUnitState<TInput, TError, TOutput> {
    return new FormUnitState(
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

  public _initial: ReadonlySignal<TInput>

  public _replaceInitial(
    monitor: Monitor,
    state: undefined | FormUnitState<TInput, TError, TOutput>,
    isMounting: boolean,
  ): void {
    const { _explicit, _current } = this._initialState.read(monitor)

    if (state) {
      const initialState = state._initialState.read(monitor)

      if (_explicit.read(monitor) && isMounting) {
        initialState._explicit.write(true)
        initialState._current.write(_current.read(monitor))
      }

      this._initialState.write(initialState)
    } else {
      this._initialState.write({
        _current: _current.clone(),
        _explicit: _explicit.clone(),
      })
    }
  }

  public _setInitial(monitor: Monitor, setter: FormUnitInputSetter<TInput>): void {
    const { _current, _explicit } = this._initialState.read(monitor)

    _current.write((initial) =>
      isFunction(setter) ? setter(initial, this._input.read(monitor)) : setter,
    )

    _explicit.write(true)

    this._validated.write(identity)
  }

  // I N P U T

  public _setInput(monitor: Monitor, setter: FormUnitInputSetter<TInput>): void {
    this._input.write((input) =>
      isFunction(setter) ? setter(input, this._initial.read(monitor)) : setter,
    )

    this._validated.write(identity)
  }

  // E R R O R

  public readonly _error: ReadonlySignal<null | TError>

  public readonly _errorVerbose: ReadonlySignal<null | TError>

  public _setError(_monitor: Monitor, setter: FormUnitErrorSetter<TError>): void {
    this._customError.write((error) => resolveSetter(setter, error))
  }

  // V A L I D A T E   O N

  public readonly _validateOnVerbose: ReadonlySignal<ValidateStrategy>

  public _setValidateOn(monitor: Monitor, setter: FormUnitValidateOnSetter): void {
    const before = this._validateOn.read(monitor)

    this._validateOn.write(resolveSetter(setter, before))

    const after = this._validateOn.read(monitor)

    if (before !== after) {
      this._validated.write(false)
    }
  }

  // T O U C H E D

  public readonly _touchedVerbose: ReadonlySignal<boolean>

  public _setTouched(
    _monitor: Monitor,
    setter: FormUnitParams<TInput, TError, TOutput>["flag.setter"],
  ): void {
    this._touched.write((touched) => resolveSetter(setter, touched))
    this._validated.write(identity)
  }

  // O U T P U T

  public readonly _output: ReadonlySignal<null | TOutput>
  public readonly _outputVerbose: ReadonlySignal<null | TOutput>

  // V A L I D

  public readonly _valid: ReadonlySignal<boolean>
  public readonly _validVerbose: ReadonlySignal<boolean>

  // I N V A L I D

  public readonly _invalid: ReadonlySignal<boolean>
  public readonly _invalidVerbose: ReadonlySignal<boolean>

  // V A L I D A T E D

  public readonly _validated: Signal<boolean>
  public readonly _validatedVerbose: ReadonlySignal<boolean>

  public _forceValidated(): void {
    this._validated.write(true)
  }

  // D I R T Y

  public readonly _dirty: ReadonlySignal<boolean>
  public readonly _dirtyVerbose: ReadonlySignal<boolean>

  public readonly _dirtyOn = Signal(true)
  public readonly _dirtyOnVerbose = this._dirtyOn

  // R E S E T

  public _reset(monitor: Monitor, resetter: undefined | FormUnitInputSetter<TInput>): void {
    const resetValue = isUndefined(resetter)
      ? this._initial.read(monitor)
      : isFunction(resetter)
        ? resetter(this._initial.read(monitor), this._input.read(monitor))
        : resetter

    this._initialState.read(monitor)._current.write(resetValue)
    this._input.write(resetValue)
    // TODO test when reset for all below
    this._touched.write(false)
    this._customError.write(null)
    this._validated.write(false)
  }

  // C H I L D R E N

  public _getChildren(): ReadonlyArray<never> {
    return []
  }

  // C U S T O M

  public _setTransform(transformer: FormUnitTransformer<TInput, TOutput>): void {
    batch(() => {
      this._transform.write(transformFromTransformer(transformer))
      this._validated.write(identity)
    })
  }
}

export { FormUnitState }
