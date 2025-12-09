import { type Monitor, type ReadonlySignal, batch, untracked } from "@owanturist/signal"

import { isDefined } from "~/tools/is-defined"
import { isNull } from "~/tools/is-null"
import { isTrue } from "~/tools/is-true"
import { isTruthy } from "~/tools/is-truthy"

import type { SignalFormParams } from "../signal-form-params"

import type { SignalFormState } from "./signal-form-state"

function resolveGetter<TValue, TVerbose, TSelected>(
  monitor: Monitor,
  value: ReadonlySignal<TValue>,
  verbose: ReadonlySignal<TVerbose>,
  select: undefined | ((val: TValue, ver: TVerbose) => TSelected),
): TSelected | TValue

function resolveGetter<TValue, TVerbose, TSelected, TFallback>(
  monitor: Monitor,
  value: ReadonlySignal<TValue>,
  verbose: ReadonlySignal<TVerbose>,
  select: undefined | ((val: TValue, ver: TVerbose) => TSelected),
  fallback: (val: TValue) => TFallback,
): TSelected | TFallback

function resolveGetter<TValue, TVerbose, TSelected, TFallback>(
  monitor: Monitor,
  value: ReadonlySignal<TValue>,
  verbose: ReadonlySignal<TVerbose>,
  select: undefined | ((val: TValue, ver: TVerbose) => TSelected),
  fallback?: (val: TValue) => TFallback,
): TSelected | TFallback | TValue {
  const value_ = value.read(monitor)

  if (select) {
    return select(value_, verbose.read(monitor))
  }

  if (fallback != null) {
    return fallback(value_)
  }

  return value_
}

abstract class SignalForm<
  // biome-ignore lint/suspicious/noExplicitAny: any is the only reasonable default
  TParams extends SignalFormParams = any,
> {
  protected static _getState<TFormParams extends SignalFormParams>({
    _state,
  }: SignalForm<TFormParams>): SignalFormState<TFormParams> {
    return _state
  }

  protected abstract readonly _state: SignalFormState<TParams>

  public clone(): SignalForm<TParams> {
    return this._state._clone()._host()
  }

  public getOutput(monitor: Monitor): null | TParams["output.schema"]
  public getOutput<TResult>(
    monitor: Monitor,
    select: (
      concise: null | TParams["output.schema"],
      verbose: TParams["output.schema.verbose"],
    ) => TResult,
  ): TResult
  public getOutput<TResult>(
    monitor: Monitor,
    select?: (
      concise: null | TParams["output.schema"],
      verbose: TParams["output.schema.verbose"],
    ) => TResult,
  ): null | TParams["output.schema"] | TResult {
    const { _output, _outputVerbose } = this._state

    return resolveGetter(monitor, _output, _outputVerbose, select)
  }

  public getInitial(monitor: Monitor): TParams["input.schema"] {
    return this._state._initial.read(monitor)
  }

  public setInitial(setter: TParams["input.setter"]): void {
    batch((monitor) => {
      this._state._setInitial(monitor, setter)
    })
  }

  public getInput(monitor: Monitor): TParams["input.schema"] {
    return this._state._input.read(monitor)
  }

  public setInput(setter: TParams["input.setter"]): void {
    batch((monitor) => {
      this._state._setInput(monitor, setter)
    })
  }

  public getError(monitor: Monitor): null | TParams["error.schema"]
  public getError<TResult>(
    monitor: Monitor,
    select: (
      concise: null | TParams["error.schema"],
      verbose: TParams["error.schema.verbose"],
    ) => TResult,
  ): TResult
  public getError<TResult>(
    monitor: Monitor,
    select?: (
      concise: null | TParams["error.schema"],
      verbose: TParams["error.schema.verbose"],
    ) => TResult,
  ): null | TParams["error.schema"] | TResult {
    const { _error, _errorVerbose } = this._state

    return resolveGetter(monitor, _error, _errorVerbose, select)
  }

  public setError(setter: TParams["error.setter"]): void {
    batch((monitor) => {
      this._state._setError(monitor, setter)
    })
  }

  public getValidateOn(monitor: Monitor): TParams["validateOn.schema"]
  public getValidateOn<TResult>(
    monitor: Monitor,
    select: (
      concise: TParams["validateOn.schema"],
      verbose: TParams["validateOn.schema.verbose"],
    ) => TResult,
  ): TResult
  public getValidateOn<TResult>(
    monitor: Monitor,
    select?: (
      concise: TParams["validateOn.schema"],
      verbose: TParams["validateOn.schema.verbose"],
    ) => TResult,
  ): TParams["validateOn.schema"] | TResult {
    const { _validateOn, _validateOnVerbose } = this._state

    return resolveGetter(monitor, _validateOn, _validateOnVerbose, select)
  }

  public setValidateOn(setter: TParams["validateOn.setter"]): void {
    batch((monitor) => {
      this._state._setValidateOn(monitor, setter)
    })
  }

  public isValid(monitor: Monitor): boolean
  public isValid<TResult>(
    monitor: Monitor,
    select: (concise: TParams["flag.schema"], verbose: TParams["flag.schema.verbose"]) => TResult,
  ): TResult
  public isValid<TResult>(
    monitor: Monitor,
    select?: (concise: TParams["flag.schema"], verbose: TParams["flag.schema.verbose"]) => TResult,
  ): boolean | TResult {
    const { _valid, _validVerbose } = this._state

    return resolveGetter(monitor, _valid, _validVerbose, select, isTrue)
  }

  public isInvalid(monitor: Monitor): boolean
  public isInvalid<TResult>(
    monitor: Monitor,
    select: (concise: TParams["flag.schema"], verbose: TParams["flag.schema.verbose"]) => TResult,
  ): TResult
  public isInvalid<TResult>(
    monitor: Monitor,
    select?: (concise: TParams["flag.schema"], verbose: TParams["flag.schema.verbose"]) => TResult,
  ): boolean | TResult {
    const { _invalid, _invalidVerbose } = this._state

    return resolveGetter(monitor, _invalid, _invalidVerbose, select, isTruthy)
  }

  public isValidated(monitor: Monitor): boolean
  public isValidated<TResult>(
    monitor: Monitor,
    select: (concise: TParams["flag.schema"], verbose: TParams["flag.schema.verbose"]) => TResult,
  ): TResult
  public isValidated<TResult>(
    monitor: Monitor,
    select?: (concise: TParams["flag.schema"], verbose: TParams["flag.schema.verbose"]) => TResult,
  ): boolean | TResult {
    const { _validated, _validatedVerbose } = this._state

    return resolveGetter(monitor, _validated, _validatedVerbose, select, isTrue)
  }

  public isDirty(monitor: Monitor): boolean
  public isDirty<TResult>(
    monitor: Monitor,
    select: (concise: TParams["flag.schema"], verbose: TParams["flag.schema.verbose"]) => TResult,
  ): TResult
  public isDirty<TResult>(
    monitor: Monitor,
    select?: (concise: TParams["flag.schema"], verbose: TParams["flag.schema.verbose"]) => TResult,
  ): boolean | TResult {
    const { _dirty, _dirtyVerbose } = this._state

    return resolveGetter(monitor, _dirty, _dirtyVerbose, select, isTruthy)
  }

  public isTouched(monitor: Monitor): boolean
  public isTouched<TResult>(
    monitor: Monitor,
    select: (concise: TParams["flag.schema"], verbose: TParams["flag.schema.verbose"]) => TResult,
  ): TResult
  public isTouched<TResult>(
    monitor: Monitor,
    select?: (concise: TParams["flag.schema"], verbose: TParams["flag.schema.verbose"]) => TResult,
  ): boolean | TResult {
    const { _touched, _touchedVerbose } = this._state

    return resolveGetter(monitor, _touched, _touchedVerbose, select, isTruthy)
  }

  public setTouched(setter: TParams["flag.setter"]): void {
    batch((monitor) => {
      this._state._setTouched(monitor, setter)
    })
  }

  public reset(resetter?: TParams["input.setter"]): void {
    batch((monitor) => {
      this._state._reset(monitor, resetter)
    })
  }

  public onFocusWhenInvalid(
    onFocus: (error: TParams["error.schema.verbose"]) => void,
  ): VoidFunction {
    return this._state._onFocus._subscribe(onFocus)
  }

  public focusFirstInvalid(): void {
    batch((monitor) => {
      this._state._getFocusFirstInvalid(monitor)?.()
    })
  }

  public getSubmitCount(monitor: Monitor): number {
    return this._state._root._submitAttempts.read(monitor)
  }

  public isSubmitting(monitor: Monitor): boolean {
    return this._state._root._submittingCount.read(monitor) > 0
  }

  public onSubmit(
    // biome-ignore lint/suspicious/noConfusingVoidType: it wants using void, not undefined
    listener: (output: TParams["output.schema"]) => void | Promise<unknown>,
  ): VoidFunction {
    return this._state._onSubmit._subscribe(listener)
  }

  public async submit(): Promise<void> {
    batch((monitor) => {
      this._state._root._submitAttempts.update((count) => count + 1)
      this._state._root._forceValidated(monitor)
    })

    const promises = untracked((monitor) => {
      const output = this._state._root._output.read(monitor)

      if (!isNull(output)) {
        return this._state._root._submitWith(monitor, output).filter(isDefined)
      }

      return undefined
    })

    if (!promises) {
      batch((monitor) => {
        this._state._root._getFocusFirstInvalid(monitor)?.()
      })
    } else if (promises.length > 0) {
      this._state._root._submittingCount.update((count) => count + 1)

      await Promise.all(promises)

      this._state._root._submittingCount.update((count) => Math.max(0, count - 1))
    }
  }
}

export { SignalForm }
