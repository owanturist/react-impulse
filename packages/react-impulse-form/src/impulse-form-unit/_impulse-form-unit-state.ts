import { identity } from "~/tools/identity"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isUndefined } from "~/tools/is-undefined"
import { Lazy } from "~/tools/lazy"
import { resolveSetter } from "~/tools/setter"

import { type Compare, Impulse, type Scope, batch } from "../dependencies"
import type { ImpulseFormInitial } from "../impulse-form/impulse-form-initial"
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
    initial: ImpulseFormInitial<Impulse<TInput>>,
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
    super(parent, initial)

    this._validated.setValue(false)
  }

  public _childOf(
    parent: ImpulseFormState,
    initial: ImpulseFormInitial<Impulse<TInput>>,
  ): ImpulseFormUnitState<TInput, TError, TOutput> {
    return new ImpulseFormUnitState(
      parent,
      initial,
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

  // R E S U L T

  // persist the validated state
  private readonly _isValidated = Impulse(false)

  private readonly _result = Impulse<Result<null | TError, TOutput>>(
    (scope) => {
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

      return [this._isValidated.getValue(scope) ? error : null, null]
    },
  )

  // I N P U T

  public _setInput(
    scope: Scope,
    setter: ImpulseFormUnitInputSetter<TInput>,
  ): void {
    this._input.setValue((input) => {
      return isFunction(setter)
        ? setter(input, this._getInitial(scope))
        : setter
    })

    this._validated.setValue(identity)
  }

  // I N I T I A L

  public _getInitial(scope: Scope): TInput {
    return this._initial._getCurrent(scope).getValue(scope)
  }

  public _setInitial(
    scope: Scope,
    setter: ImpulseFormUnitInputSetter<TInput>,
  ): void {
    this._initial._getCurrent(scope).setValue((initial) => {
      return isFunction(setter)
        ? setter(initial, this._input.getValue(scope))
        : setter
    })

    this._validated.setValue(identity)
  }

  // E R R O R

  public readonly _error = Impulse(
    (scope) => {
      const [error] = this._result.getValue(scope)

      return error
    },
    {
      compare: this._isErrorEqual,
    },
  )

  public readonly _errorVerbose = this._error

  public _setError(
    _scope: Scope,
    setter: ImpulseFormUnitErrorSetter<TError>,
  ): void {
    this._customError.setValue((error) => resolveSetter(setter, error))
  }

  // V A L I D A T E   O N

  public readonly _validateOnVerbose = this._validateOn

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

  public readonly _touchedVerbose = this._touched

  public _setTouched(
    _scope: Scope,
    setter: ImpulseFormUnitParams<TInput, TError, TOutput>["flag.setter"],
  ): void {
    this._touched.setValue((touched) => resolveSetter(setter, touched))
    this._validated.setValue(identity)
  }

  // O U T P U T

  public readonly _output = Impulse(
    (scope) => {
      const [, output] = this._result.getValue(scope)

      return output
    },
    {
      compare: this._isOutputEqual,
    },
  )
  public readonly _outputVerbose = this._output

  // V A L I D

  public readonly _valid = Impulse((scope) => {
    const error = this._error.getValue(scope)

    return isNull(error)
  })

  public readonly _validVerbose = this._valid

  // I N V A L I D

  public readonly _invalid = Impulse((scope) => {
    const error = this._error.getValue(scope)

    return !isNull(error)
  })

  public readonly _invalidVerbose = this._invalid

  // V A L I D A T E D

  public readonly _validated = Impulse<boolean>(
    // mixes the validated and invalid states
    (scope) => {
      return this._isValidated.getValue(scope) || this._invalid.getValue(scope)
    },

    // proxies the validated setter where `false` means revalidate
    // and `true` sets the validated state to `true`
    (next, scope) => {
      this._isValidated.setValue(() => {
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

  public readonly _validatedVerbose = this._validated

  public _forceValidated(): void {
    this._validated.setValue(true)
  }

  // D I R T Y

  public readonly _dirty = Impulse((scope) => {
    return this._isInputDirty(
      this._getInitial(scope),
      this._input.getValue(scope),
      scope,
    )
  })

  public readonly _dirtyVerbose = this._dirty

  // R E S E T

  public _reset(
    scope: Scope,
    resetter: undefined | ImpulseFormUnitInputSetter<TInput>,
  ): void {
    const resetValue = isUndefined(resetter)
      ? this._getInitial(scope)
      : isFunction(resetter)
        ? resetter(this._getInitial(scope), this._input.getValue(scope))
        : resetter

    this._initial._getCurrent(scope).setValue(resetValue)
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
