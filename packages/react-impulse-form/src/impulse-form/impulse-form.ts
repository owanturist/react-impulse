import { isDefined } from "~/tools/is-defined"
import { isNull } from "~/tools/is-null"
import { isTrue } from "~/tools/is-true"
import { isTruthy } from "~/tools/is-truthy"
import { Lazy } from "~/tools/lazy"

import {
  type Impulse,
  type ReadonlyImpulse,
  type Scope,
  batch,
  untrack,
} from "../dependencies"

import type { ImpulseFormParams } from "./impulse-form-params"
import type { ImpulseFormSpec } from "./impulse-form-spec"
import type { ImpulseFormState } from "./impulse-form-state"

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TParams extends ImpulseFormParams = any,
> {
  // TODO check if still necessary for type inference
  protected readonly _params?: TParams

  // TODO make those private/protected
  public abstract readonly _spec: Impulse<ImpulseFormSpec<TParams>>
  public abstract readonly _state: Lazy<ImpulseFormState<TParams>>

  private readonly _rootState = Lazy(() => {
    function getRoot(
      state: ImpulseFormState | ImpulseFormState<TParams>,
    ): ImpulseFormState | ImpulseFormState<TParams> {
      if (state._parent) {
        return getRoot(state._parent._peek())
      }

      return state
    }

    return getRoot(this._state._peek())
  })

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
    const { _output, _outputVerbose } = this._state._peek()

    return resolveGetter(scope, _output, _outputVerbose, select)
  }

  public getInitial(scope: Scope): TParams["input.schema"] {
    return this._spec.getValue(scope)._initial.getValue(scope)
  }

  public setInitial(setter: TParams["input.setter"]): void {
    batch((scope) => {
      this._state._peek()._setInitial(scope, setter)
    })
  }

  public getInput(scope: Scope): TParams["input.schema"] {
    return this._state._peek()._input.getValue(scope)
  }

  public setInput(setter: TParams["input.setter"]): void {
    batch((scope) => {
      this._state._peek()._setInput(scope, setter)
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
    const { _error, _errorVerbose } = this._state._peek()

    return resolveGetter(scope, _error, _errorVerbose, select)
  }

  public setError(setter: TParams["error.setter"]): void {
    batch((scope) => {
      this._state._peek()._setError(scope, setter)
    })
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
    const { _validateOn, _validateOnVerbose } = this._state._peek()

    return resolveGetter(scope, _validateOn, _validateOnVerbose, select)
  }

  public setValidateOn(setter: TParams["validateOn.setter"]): void {
    batch((scope) => {
      this._state._peek()._setValidateOn(scope, setter)
    })
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
    const { _valid, _validVerbose } = this._state._peek()

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
    const { _invalid, _invalidVerbose } = this._state._peek()

    return resolveGetter(scope, _invalid, _invalidVerbose, select, isTruthy)
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
    const { _validated, _validatedVerbose } = this._state._peek()

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
    const { _dirty, _dirtyVerbose } = this._state._peek()

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
    const { _touched, _touchedVerbose } = this._state._peek()

    return resolveGetter(scope, _touched, _touchedVerbose, select, isTruthy)
  }

  public setTouched(setter: TParams["flag.setter"]): void {
    batch((scope) => {
      this._state._peek()._setTouched(scope, setter)
    })
  }

  public reset(resetter?: TParams["input.setter"]): void {
    batch((scope) => {
      this._state._peek()._reset(scope, resetter)
    })
  }

  public onFocusWhenInvalid(
    onFocus: (error: TParams["error.schema.verbose"]) => void,
  ): VoidFunction {
    return this._state._peek()._onFocus._subscribe(onFocus)
  }

  public focusFirstInvalid(): void {
    batch((scope) => {
      this._state._peek()._getFocusFirstInvalid(scope)?.()
    })
  }

  public getSubmitCount(scope: Scope): number {
    return this._rootState._peek()._submitAttempts.getValue(scope)
  }

  public isSubmitting(scope: Scope): boolean {
    return this._rootState._peek()._submittingCount.getValue(scope) > 0
  }

  public onSubmit(
    listener: (output: TParams["output.schema"]) => void | Promise<unknown>,
  ): VoidFunction {
    return this._state._peek()._onSubmit._subscribe(listener)
  }

  public async submit(): Promise<void> {
    batch((scope) => {
      this._rootState._peek()._submitAttempts.setValue((count) => count + 1)
      this._rootState._peek()._forceValidated(scope)
    })

    const promises = untrack((scope) => {
      const output = this._rootState._peek()._output.getValue(scope)

      if (!isNull(output) && this._rootState._peek()._valid.getValue(scope)) {
        return this._rootState
          ._peek()
          ._submitWith(scope, output)
          .filter(isDefined)
      }

      return undefined
    })

    if (!promises) {
      batch((scope) => {
        this._rootState._peek()._getFocusFirstInvalid(scope)?.()
      })
    } else if (promises.length > 0) {
      this._rootState._peek()._submittingCount.setValue((count) => count + 1)

      await Promise.all(promises)

      this._rootState._peek()._submittingCount.setValue((count) => {
        return Math.max(0, count - 1)
      })
    }
  }
}
