import { isNull } from "~/tools/is-null"

import { Impulse, type ReadonlyImpulse, type Scope } from "../dependencies"
import { Emitter } from "../emitter"

import type { ImpulseFormParams } from "./impulse-form-params"

export abstract class ImpulseFormState<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TParams extends ImpulseFormParams = any,
> {
  public readonly _root: ImpulseFormState

  public constructor(parent: null | ImpulseFormState) {
    this._root = parent?._root ?? this
  }

  public abstract _childOf(
    parent: ImpulseFormState,
    initial: Impulse<TParams["input.schema"]>,
  ): ImpulseFormState<TParams>

  // I N I T I A L

  public abstract readonly _initial: ReadonlyImpulse<TParams["input.schema"]>
  public abstract _setInitial(
    scope: Scope,
    setter: TParams["input.setter"],
  ): void

  // I N P U T

  public abstract readonly _input: ReadonlyImpulse<TParams["input.schema"]>
  public abstract _setInput(scope: Scope, setter: TParams["input.setter"]): void

  // E R R O R

  public abstract readonly _error: ReadonlyImpulse<
    null | TParams["error.schema"]
  >
  public abstract readonly _errorVerbose: ReadonlyImpulse<
    TParams["error.schema.verbose"]
  >
  public abstract _setError(scope: Scope, setter: TParams["error.setter"]): void

  // V A L I D A T E   O N

  public abstract readonly _validateOn: ReadonlyImpulse<
    TParams["validateOn.schema"]
  >
  public abstract readonly _validateOnVerbose: ReadonlyImpulse<
    TParams["validateOn.schema.verbose"]
  >
  public abstract _setValidateOn(
    scope: Scope,
    setter: TParams["validateOn.setter"],
  ): void

  // T O U C H E D

  public abstract readonly _touched: ReadonlyImpulse<TParams["flag.schema"]>
  public abstract readonly _touchedVerbose: ReadonlyImpulse<
    TParams["flag.schema.verbose"]
  >
  public abstract _setTouched(
    scope: Scope,
    setter: TParams["flag.setter"],
  ): void

  // O U T P U T

  public abstract readonly _output: ReadonlyImpulse<
    null | TParams["output.schema"]
  >
  public abstract readonly _outputVerbose: ReadonlyImpulse<
    TParams["output.schema.verbose"]
  >

  // V A L I D

  public abstract readonly _valid: ReadonlyImpulse<TParams["flag.schema"]>
  public abstract readonly _validVerbose: ReadonlyImpulse<
    TParams["flag.schema.verbose"]
  >

  // I N V A L I D

  public abstract readonly _invalid: ReadonlyImpulse<TParams["flag.schema"]>
  public abstract readonly _invalidVerbose: ReadonlyImpulse<
    TParams["flag.schema.verbose"]
  >

  // V A L I D A T E D

  public abstract readonly _validated: ReadonlyImpulse<TParams["flag.schema"]>
  public abstract readonly _validatedVerbose: ReadonlyImpulse<
    TParams["flag.schema.verbose"]
  >

  public abstract _forceValidated(scope: Scope): void

  // D I R T Y

  public abstract readonly _dirty: ReadonlyImpulse<TParams["flag.schema"]>
  public abstract readonly _dirtyVerbose: ReadonlyImpulse<
    TParams["flag.schema.verbose"]
  >

  // F O C U S   I N V A L I D

  public readonly _onFocus = new Emitter<[error: unknown]>()

  public _getFocusFirstInvalid(scope: Scope): null | VoidFunction {
    // go deep first and then the current element
    for (const { _state } of this._getChildren(scope)) {
      const callback = _state._getFocusFirstInvalid(scope)

      if (callback) {
        return callback
      }
    }

    // ignore if the focus handlers are not set
    const error = this._onFocus._isEmpty() ? null : this._error.getValue(scope)

    if (isNull(error)) {
      return null
    }

    return () => {
      this._onFocus._emit(error)
    }
  }

  // S U B M I T

  public readonly _onSubmit = new Emitter<
    [output: unknown],
    void | Promise<unknown>
  >()

  public readonly _submitAttempts = Impulse(0)
  public readonly _submittingCount = Impulse(0)

  public _submitWith(
    scope: Scope,
    output: TParams["output.schema"],
  ): ReadonlyArray<void | Promise<unknown>> {
    const promises = this._getChildren(scope).flatMap(
      ({ _state, _mapOutput }) => {
        return _state._submitWith(scope, _mapOutput(output))
      },
    )

    return [...this._onSubmit._emit(output), ...promises]
  }

  // R E S E T

  /**
   * Comparing to _setInitial where the setter is always provided,
   * this method allows te resetter to be undefined.
   * This is for cases when the initial value is not changed BUT
   * the ImpulseForm should perform the rest of reset operations,
   * in comparison to _setInitial which only sets the initial value AND
   * not called at all if the setter is not provided.
   */
  public abstract _reset(
    scope: Scope,
    resetter: undefined | TParams["input.setter"],
  ): void

  // C H I L D R E N

  public abstract _getChildren(
    scope: Scope,
  ): ReadonlyArray<ImpulseFormChild<TParams>>
}

export interface ImpulseFormChild<TParams extends ImpulseFormParams> {
  _state: ImpulseFormState
  _mapOutput: (output: TParams["output.schema"]) => unknown
}
