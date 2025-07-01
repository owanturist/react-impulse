import { isNull } from "~/tools/is-null"

import type { ReadonlyImpulse, Scope } from "../dependencies"
import { Emitter } from "../emitter"

import type { ImpulseFormParams } from "./impulse-form-params"

export abstract class ImpulseFormState<TParams extends ImpulseFormParams> {
  // I N I T I A L

  public abstract readonly _initial: ReadonlyImpulse<TParams["input.schema"]>
  public abstract _setInitial(setter: TParams["input.setter"]): void

  // I N P U T

  public abstract readonly _input: ReadonlyImpulse<TParams["input.schema"]>
  public abstract _setInput(setter: TParams["input.setter"]): void

  // E R R O R

  public abstract readonly _error: ReadonlyImpulse<
    null | TParams["error.schema"]
  >
  public abstract readonly _errorVerbose: ReadonlyImpulse<
    TParams["error.schema.verbose"]
  >
  public abstract _setError(setter: TParams["error.setter"]): void

  // V A L I D A T E   O N

  public abstract readonly _validateOn: ReadonlyImpulse<
    TParams["validateOn.schema"]
  >
  public abstract readonly _validateOnVerbose: ReadonlyImpulse<
    TParams["validateOn.schema.verbose"]
  >
  public abstract _setValidateOn(setter: TParams["validateOn.setter"]): void

  // T O U C H E D

  public abstract readonly _touched: ReadonlyImpulse<TParams["flag.schema"]>
  public abstract readonly _touchedVerbose: ReadonlyImpulse<
    TParams["flag.schema.verbose"]
  >
  public abstract _setTouched(setter: TParams["flag.setter"]): void

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

  // D I R T Y

  public abstract readonly _dirty: ReadonlyImpulse<TParams["flag.schema"]>
  public abstract readonly _dirtyVerbose: ReadonlyImpulse<
    TParams["flag.schema.verbose"]
  >

  // F O C U S   I N V A L I D

  public readonly _onFocus = new Emitter<[error: unknown]>()

  public _getFocusFirstInvalid(scope: Scope): null | VoidFunction {
    // go deep first and then the current element
    for (const element of this._getChildren(scope)) {
      const callback = element._getFocusFirstInvalid(scope)

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

  // C H I L D R E N

  public abstract _getChildren(
    scope: Scope,
  ): ReadonlyArray<ImpulseFormState<ImpulseFormParams>>
}
