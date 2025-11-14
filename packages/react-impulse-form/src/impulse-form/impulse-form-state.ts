import { Emitter } from "~/tools/emitter"
import { isNull } from "~/tools/is-null"
import type { Lazy } from "~/tools/lazy"

import { Impulse, type ReadonlyImpulse, type Scope } from "../dependencies"

import type { ImpulseForm } from "./impulse-form"
import type { ImpulseFormParams } from "./impulse-form-params"

export abstract class ImpulseFormState<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TParams extends ImpulseFormParams = any,
> {
  public abstract readonly _host: Lazy<ImpulseForm<TParams>>

  public readonly _root: ImpulseFormState

  public constructor(parent: null | ImpulseFormState) {
    this._root = parent?._root ?? this
  }

  protected abstract _childOf(
    parent: null | ImpulseFormState,
  ): ImpulseFormState<TParams>

  public _clone(): ImpulseFormState<TParams> {
    return this._childOf(null)
  }

  public _parentOf<TChild extends ImpulseFormState>(child: TChild): TChild {
    if (this._root === child._root) {
      return child
    }

    return child._childOf(this) as TChild
  }

  public _hasSameRootWith(another: ImpulseFormState): boolean {
    return this._root === another._root
  }

  // I N I T I A L

  public abstract readonly _initial: ReadonlyImpulse<TParams["input.schema"]>

  public abstract _replaceInitial(
    scope: Scope,
    state: undefined | this,
    isMounting: boolean,
  ): void

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

  public abstract readonly _dirtyOn: ReadonlyImpulse<TParams["flag.schema"]>
  public abstract readonly _dirtyOnVerbose: ReadonlyImpulse<
    TParams["flag.schema.verbose"]
  >

  // F O C U S   I N V A L I D

  public readonly _onFocus = new Emitter()

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

  public readonly _onSubmit = new Emitter<unknown, void | Promise<unknown>>()

  public readonly _submitAttempts = Impulse(0)
  public readonly _submittingCount = Impulse(0)

  public _submitWith(
    scope: Scope,
    output: TParams["output.schema"],
  ): ReadonlyArray<void | Promise<unknown>> {
    const promises = this._getChildren(scope).flatMap(
      ({ _state, _mapToChild }) => {
        return _state._submitWith(scope, _mapToChild(output))
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

  public abstract _getChildren<TChildParams extends ImpulseFormParams>(
    scope: Scope,
  ): ReadonlyArray<ImpulseFormChild<TChildParams, TParams>>
}

export interface ImpulseFormChild<
  TChildParams extends ImpulseFormParams,
  TParams extends ImpulseFormParams,
> {
  _state: ImpulseFormState<TChildParams>
  _mapToChild(
    this: void,
    parentValue: TParams["output.schema"],
  ): TChildParams["output.schema"]
}
