import { isDefined } from "~/tools/is-defined"
import { isNull } from "~/tools/is-null"
import { isTruthy } from "~/tools/is-truthy"

import { Impulse, type Scope, batch, untrack } from "../dependencies"
import { Emitter } from "../emitter"

import type { ImpulseFormParams } from "./impulse-form-params"

export abstract class ImpulseForm<
  TParams extends ImpulseFormParams = ImpulseFormParams,
> {
  protected static _childOf<TChild extends ImpulseForm>(
    parent: ImpulseForm,
    child: TChild,
  ): TChild {
    if (child._root === parent._root) {
      return child
    }

    return child._childOf(parent._root) as TChild
  }

  protected static _setInitial<TForm extends ImpulseForm>(
    form: TForm,
    initial: undefined | TForm,
    isRoot = form._root === form,
  ): void {
    form._setInitial(initial, isRoot)
  }

  protected static _submitWith<TParams extends ImpulseFormParams>(
    form: ImpulseForm<TParams>,
    output: TParams["output.schema"],
  ): ReadonlyArray<void | Promise<unknown>> {
    return form._submitWith(output)
  }

  protected static _getFocusFirstInvalid(
    scope: Scope,
    form: ImpulseForm,
  ): null | VoidFunction {
    return form._getFocusFirstInvalid(scope)
  }

  protected static _setValidated(
    form: ImpulseForm,
    isValidated: boolean,
  ): void {
    form._setValidated(isValidated)
  }

  protected static _isDirty<TParams extends ImpulseFormParams, TResult>(
    scope: Scope,
    form: ImpulseForm<TParams>,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
      dirty: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult {
    return form._isDirty(scope, select)
  }

  // necessary for type inference
  protected readonly _params?: TParams

  private readonly _onFocus = new Emitter<[error: unknown]>()

  private readonly _onSubmit = new Emitter<
    [output: unknown],
    void | Promise<unknown>
  >()

  private readonly _submitAttempts = Impulse(0)
  private readonly _submittingCount = Impulse(0)

  private readonly _root: ImpulseForm

  protected constructor(_root: null | ImpulseForm) {
    this._root = _root ?? this
  }

  protected abstract _childOf(parent: null | ImpulseForm): ImpulseForm<TParams>

  protected abstract _setInitial(
    initial: undefined | ImpulseForm<TParams>,
    isRoot: boolean,
  ): void

  protected abstract _setValidated(isValidated: boolean): void

  protected abstract _isDirty<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
      dirty: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult

  protected _submitWith(
    output: TParams["output.schema"],
  ): ReadonlyArray<void | Promise<unknown>> {
    return this._onSubmit._emit(output)
  }

  protected _getFocusFirstInvalid(scope: Scope): null | VoidFunction {
    // ignore if the focus handlers are not set
    const error = this._onFocus._isEmpty() ? null : this.getError(scope)

    if (error == null) {
      return null
    }

    return () => {
      this._onFocus._emit(error)
    }
  }

  public onFocusWhenInvalid(
    onFocus: (error: TParams["error.schema.verbose"]) => void,
  ): VoidFunction {
    return this._onFocus._subscribe(onFocus)
  }

  public getSubmitCount(scope: Scope): number {
    return this._root._submitAttempts.getValue(scope)
  }

  public isSubmitting(scope: Scope): boolean {
    return this._root._submittingCount.getValue(scope) > 0
  }

  public onSubmit(
    listener: (output: TParams["output.schema"]) => void | Promise<unknown>,
  ): VoidFunction {
    return this._onSubmit._subscribe(listener)
  }

  public async submit(): Promise<void> {
    batch(() => {
      this._root._submitAttempts.setValue((count) => count + 1)
      this._root._setValidated(true)
    })

    const promises = untrack((scope) => {
      const output = this._root.getOutput(scope)

      if (!isNull(output) && this._root.isValid(scope)) {
        return this._root._submitWith(output).filter(isDefined)
      }

      return undefined
    })

    if (!promises) {
      this._root.focusFirstInvalid()
    } else if (promises.length > 0) {
      this._root._submittingCount.setValue((count) => count + 1)

      await Promise.all(promises)

      this._root._submittingCount.setValue((count) => count - 1)
    }
  }

  public focusFirstInvalid(): void {
    batch((scope) => {
      this._getFocusFirstInvalid(scope)?.()
    })
  }

  public clone(): ImpulseForm<TParams> {
    return this._childOf(null)
  }

  public isValid(scope: Scope): boolean {
    return !this.isInvalid(scope)
  }

  public isInvalid(scope: Scope): boolean {
    return this.getError(scope, isDefined)
  }

  public isDirty(scope: Scope): boolean
  public isDirty<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult
  public isDirty(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => boolean = isTruthy,
  ): boolean {
    return this._isDirty(scope, select)
  }

  public abstract getError(scope: Scope): TParams["error.schema"]
  public abstract getError<TResult>(
    scope: Scope,
    select: (
      concise: TParams["error.schema"],
      verbose: TParams["error.schema.verbose"],
    ) => TResult,
  ): TResult

  public abstract setError(setter: TParams["error.setter"]): void

  public abstract isValidated(scope: Scope): boolean
  public abstract isValidated<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult

  public abstract getValidateOn(scope: Scope): TParams["validateOn.schema"]
  public abstract getValidateOn<TResult>(
    scope: Scope,
    select: (
      concise: TParams["validateOn.schema"],
      verbose: TParams["validateOn.schema.verbose"],
    ) => TResult,
  ): TResult

  public abstract setValidateOn(setter: TParams["validateOn.setter"]): void

  public abstract isTouched(scope: Scope): boolean
  public abstract isTouched<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult

  public abstract setTouched(setter: TParams["flag.setter"]): void

  public abstract reset(resetter?: TParams["input.setter"]): void

  public abstract getInitial(scope: Scope): TParams["input.schema"]

  public abstract setInitial(setter: TParams["input.setter"]): void

  public abstract getInput(scope: Scope): TParams["input.schema"]

  public abstract setInput(setter: TParams["input.setter"]): void

  public abstract getOutput(scope: Scope): null | TParams["output.schema"]
  public abstract getOutput<TResult>(
    scope: Scope,
    select: (
      concise: null | TParams["output.schema"],
      verbose: TParams["output.schema.verbose"],
    ) => TResult,
  ): TResult
}
