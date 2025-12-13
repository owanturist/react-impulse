import { type Monitor, type ReadonlySignal, Signal } from "@owanturist/signal"

import { Emitter } from "~/tools/emitter"
import { isNull } from "~/tools/is-null"
import type { Lazy } from "~/tools/lazy"

import type { SignalFormParams } from "../signal-form-params"

import type { SignalForm } from "./signal-form"

abstract class SignalFormState<
  // biome-ignore lint/suspicious/noExplicitAny: any is the only reasonable default
  TParams extends SignalFormParams = any,
> {
  public abstract readonly _host: Lazy<SignalForm<TParams>>

  public readonly _root: SignalFormState

  public constructor(parent: null | SignalFormState) {
    this._root = parent?._root ?? this
  }

  protected abstract _childOf(parent: null | SignalFormState): SignalFormState<TParams>

  public _clone(): SignalFormState<TParams> {
    return this._childOf(null)
  }

  public _parentOf<TChild extends SignalFormState>(child: TChild): TChild {
    if (this._root === child._root) {
      return child
    }

    return child._childOf(this) as TChild
  }

  public _hasSameRootWith(another: SignalFormState): boolean {
    return this._root === another._root
  }

  // I N I T I A L

  public abstract readonly _initial: ReadonlySignal<TParams["input.schema"]>

  public abstract _replaceInitial(
    monitor: Monitor,
    state: undefined | this,
    isMounting: boolean,
  ): void

  public abstract _setInitial(monitor: Monitor, setter: TParams["input.setter"]): void

  // I N P U T

  public abstract readonly _input: ReadonlySignal<TParams["input.schema"]>
  public abstract _setInput(monitor: Monitor, setter: TParams["input.setter"]): void

  // E R R O R

  public abstract readonly _error: ReadonlySignal<null | TParams["error.schema"]>
  public abstract readonly _errorVerbose: ReadonlySignal<TParams["error.schema.verbose"]>
  public abstract _setError(monitor: Monitor, setter: TParams["error.setter"]): void

  // V A L I D A T E   O N

  public abstract readonly _validateOn: ReadonlySignal<TParams["validateOn.schema"]>
  public abstract readonly _validateOnVerbose: ReadonlySignal<TParams["validateOn.schema.verbose"]>
  public abstract _setValidateOn(monitor: Monitor, setter: TParams["validateOn.setter"]): void

  // T O U C H E D

  public abstract readonly _touched: ReadonlySignal<TParams["flag.schema"]>
  public abstract readonly _touchedVerbose: ReadonlySignal<TParams["flag.schema.verbose"]>
  public abstract _setTouched(monitor: Monitor, setter: TParams["flag.setter"]): void

  // O U T P U T

  public abstract readonly _output: ReadonlySignal<null | TParams["output.schema"]>
  public abstract readonly _outputVerbose: ReadonlySignal<TParams["output.schema.verbose"]>

  // V A L I D

  public abstract readonly _valid: ReadonlySignal<TParams["flag.schema"]>
  public abstract readonly _validVerbose: ReadonlySignal<TParams["flag.schema.verbose"]>

  // I N V A L I D

  public abstract readonly _invalid: ReadonlySignal<TParams["flag.schema"]>
  public abstract readonly _invalidVerbose: ReadonlySignal<TParams["flag.schema.verbose"]>

  // V A L I D A T E D

  public abstract readonly _validated: ReadonlySignal<TParams["flag.schema"]>
  public abstract readonly _validatedVerbose: ReadonlySignal<TParams["flag.schema.verbose"]>

  public abstract _forceValidated(monitor: Monitor): void

  // D I R T Y

  public abstract readonly _dirty: ReadonlySignal<TParams["flag.schema"]>
  public abstract readonly _dirtyVerbose: ReadonlySignal<TParams["flag.schema.verbose"]>

  public abstract readonly _dirtyOn: ReadonlySignal<TParams["flag.schema"]>
  public abstract readonly _dirtyOnVerbose: ReadonlySignal<TParams["flag.schema.verbose"]>

  // F O C U S   I N V A L I D

  public readonly _onFocus = new Emitter()

  public _getFocusFirstInvalid(monitor: Monitor): null | VoidFunction {
    // go deep first and then the current element
    for (const { _state } of this._getChildren(monitor)) {
      const callback = _state._getFocusFirstInvalid(monitor)

      if (callback) {
        return callback
      }
    }

    // ignore if the focus handlers are not set
    const error = this._onFocus._isEmpty() ? null : this._error.read(monitor)

    if (isNull(error)) {
      return null
    }

    return () => {
      this._onFocus._emit(error)
    }
  }

  // S U B M I T

  // biome-ignore lint/suspicious/noConfusingVoidType: it wants using void, not undefined
  public readonly _onSubmit = new Emitter<unknown, void | Promise<unknown>>()

  public readonly _submitAttempts = Signal(0)
  public readonly _submittingCount = Signal(0)

  public _submitWith(
    monitor: Monitor,
    output: TParams["output.schema"],
    // biome-ignore lint/suspicious/noConfusingVoidType: it wants using void, not undefined
  ): ReadonlyArray<void | Promise<unknown>> {
    const promises = this._getChildren(monitor).flatMap(({ _state, _mapToChild }) =>
      _state._submitWith(monitor, _mapToChild(output)),
    )

    return [...this._onSubmit._emit(output), ...promises]
  }

  // R E S E T

  /**
   * Comparing to {@link _setInitial} where the setter is always provided,
   * this method allows the resetter to be undefined.
   * This is for cases when the initial value is not changed BUT
   * the {@link SignalForm} should perform the rest of reset operations,
   * in comparison to {@link _setInitial} which only sets the initial value AND
   * not called at all if the setter is not provided.
   */
  public abstract _reset(monitor: Monitor, resetter: undefined | TParams["input.setter"]): void

  // C H I L D R E N

  public abstract _getChildren<TChildParams extends SignalFormParams>(
    monitor: Monitor,
  ): ReadonlyArray<SignalFormChild<TChildParams, TParams>>
}

interface SignalFormChild<TChildParams extends SignalFormParams, TParams extends SignalFormParams> {
  _state: SignalFormState<TChildParams>
  _mapToChild(this: void, parentValue: TParams["output.schema"]): TChildParams["output.schema"]
}

export type { SignalFormChild }
export { SignalFormState }
