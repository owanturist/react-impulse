import { isTrue } from "~/tools/is-true"
import { isTruthy } from "~/tools/is-truthy"

import { type ReadonlyImpulse, type Scope, batch } from "../dependencies"

import type { ImpulseFormParams } from "./impulse-form-params"
import type { ImpulseFormSpec } from "./impulse-form-spec"
import type { ImpulseFormState } from "./impulse-form-state"
import { Lazy } from "~/tools/lazy"

function resolveGetter<TValue, TVerbose, TSelected>(
  scope: Scope,
  value: ReadonlyImpulse<TValue>,
  verbose: ReadonlyImpulse<TVerbose>,
  select: undefined | ((value: TValue, verbose: TVerbose) => TSelected),
): TSelected | TValue
function resolveGetter<TValue, TVerbose, TSelected, TFallback>(
  scope: Scope,
  value: ReadonlyImpulse<TValue>,
  verbose: ReadonlyImpulse<TVerbose>,
  select: undefined | ((value: TValue, verbose: TVerbose) => TSelected),
  fallback: (value: TValue) => TFallback,
): TSelected | TFallback
function resolveGetter<TValue, TVerbose, TSelected, TFallback>(
  scope: Scope,
  value: ReadonlyImpulse<TValue>,
  verbose: ReadonlyImpulse<TVerbose>,
  select: undefined | ((value: TValue, verbose: TVerbose) => TSelected),
  fallback?: (value: TValue) => TFallback,
): TSelected | TFallback | TValue {
  const value_ = value.getValue(scope)

  if (select) {
    return select(value_, verbose.getValue(scope))
  }

  if (fallback) {
    return fallback(value_)
  }

  return value_
}

export abstract class ImpulseForm<
  TParams extends ImpulseFormParams = ImpulseFormParams,
> {
  // necessary for type inference
  protected readonly _params?: TParams

  protected constructor(
    public readonly _spec: ImpulseFormSpec<TParams>,
    // TODO make it private/protected AND make it Lazy
    public readonly _state: ImpulseFormState<TParams>,
  ) {}

  public getOutput(scope: Scope): null | TParams["output.schema"]
  public getOutput<TResult>(
    scope: Scope,
    select: (
      concise: null | TParams["output.schema"],
      verbose: TParams["output.schema.verbose"],
    ) => TResult,
  ): TResult
  public getOutput<TResult>(
    scope: Scope,
    select?: (
      concise: null | TParams["output.schema"],
      verbose: TParams["output.schema.verbose"],
    ) => TResult,
  ): null | TParams["output.schema"] | TResult {
    const { _output, _outputVerbose } = this._state

    return resolveGetter(scope, _output, _outputVerbose, select)
  }

  public getInitial(scope: Scope): TParams["input.schema"] {
    return this._state._initial.getValue(scope)
  }

  public setInitial(setter: TParams["input.setter"]): void {
    this._state._setInitial(setter)
  }

  public getInput(scope: Scope): TParams["input.schema"] {
    return this._state._input.getValue(scope)
  }

  public setInput(setter: TParams["input.setter"]): void {
    batch((scope) => {
      this._state._setInput(
        setter,
        Lazy(() => this.getInput(scope)),
        Lazy(() => this.getInitial(scope)),
      )
    })
  }

  public getError(scope: Scope): null | TParams["error.schema"]
  public getError<TResult>(
    scope: Scope,
    select: (
      concise: null | TParams["error.schema"],
      verbose: TParams["error.schema.verbose"],
    ) => TResult,
  ): TResult
  public getError<TResult>(
    scope: Scope,
    select?: (
      concise: null | TParams["error.schema"],
      verbose: TParams["error.schema.verbose"],
    ) => TResult,
  ): null | TParams["error.schema"] | TResult {
    const { _error, _errorVerbose } = this._state

    return resolveGetter(scope, _error, _errorVerbose, select)
  }

  public setError(setter: TParams["error.setter"]): void {
    this._state._setError(setter)
  }

  public getValidateOn(scope: Scope): TParams["validateOn.schema"]
  public getValidateOn<TResult>(
    scope: Scope,
    select: (
      concise: TParams["validateOn.schema"],
      verbose: TParams["validateOn.schema.verbose"],
    ) => TResult,
  ): TResult
  public getValidateOn<TResult>(
    scope: Scope,
    select?: (
      concise: TParams["validateOn.schema"],
      verbose: TParams["validateOn.schema.verbose"],
    ) => TResult,
  ): TParams["validateOn.schema"] | TResult {
    const { _validateOn, _validateOnVerbose } = this._state

    return resolveGetter(scope, _validateOn, _validateOnVerbose, select)
  }

  public setValidateOn(setter: TParams["validateOn.setter"]): void {
    this._state._setValidateOn(setter)
  }

  public isValid(scope: Scope): boolean
  public isValid<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult
  public isValid<TResult>(
    scope: Scope,
    select?: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): boolean | TResult {
    const { _valid, _validVerbose } = this._state

    return resolveGetter(scope, _valid, _validVerbose, select, isTrue)
  }

  public isInvalid(scope: Scope): boolean
  public isInvalid<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult
  public isInvalid<TResult>(
    scope: Scope,
    select?: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): boolean | TResult {
    const { _invalid, _invalidVerbose } = this._state

    return resolveGetter(scope, _invalid, _invalidVerbose, select, isTrue)
  }

  public isValidated(scope: Scope): boolean
  public isValidated<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult
  public isValidated<TResult>(
    scope: Scope,
    select?: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): boolean | TResult {
    const { _validated, _validatedVerbose } = this._state

    return resolveGetter(scope, _validated, _validatedVerbose, select, isTrue)
  }

  public isDirty(scope: Scope): boolean
  public isDirty<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult
  public isDirty<TResult>(
    scope: Scope,
    select?: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): boolean | TResult {
    const { _dirty, _dirtyVerbose } = this._state

    return resolveGetter(scope, _dirty, _dirtyVerbose, select, isTruthy)
  }

  public isTouched(scope: Scope): boolean
  public isTouched<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult
  public isTouched<TResult>(
    scope: Scope,
    select?: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): boolean | TResult {
    const { _touched, _touchedVerbose } = this._state

    return resolveGetter(scope, _touched, _touchedVerbose, select, isTruthy)
  }

  public setTouched(setter: TParams["flag.setter"]): void {
    this._state._setTouched(setter)
  }

  public reset(resetter?: TParams["input.setter"]): void {
    batch((scope) => {
      this._state._reset(
        resetter,
        Lazy(() => this.getInitial(scope)),
        Lazy(() => this.getInput(scope)),
      )
    })
  }

  public onFocusWhenInvalid(
    onFocus: (error: TParams["error.schema.verbose"]) => void,
  ): VoidFunction {
    return this._state._onFocus._subscribe(onFocus)
  }

  public focusFirstInvalid(): void {
    batch((scope) => {
      this._state._getFocusFirstInvalid(scope)?.()
    })
  }
}
