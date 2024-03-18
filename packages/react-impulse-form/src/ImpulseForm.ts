import { type Scope, isDefined, batch, untrack, Impulse } from "./dependencies"
import { Emitter } from "./Emitter"

export interface ImpulseFormParams {
  "value.schema": unknown
  "value.schema.verbose": unknown

  "originalValue.setter": unknown
  "originalValue.schema": unknown

  "flag.setter": unknown
  "flag.schema": unknown
  "flag.schema.verbose": unknown

  "validateOn.setter": unknown
  "validateOn.schema": unknown
  "validateOn.schema.verbose": unknown

  "errors.setter": unknown
  "errors.schema": unknown
  "errors.schema.verbose": unknown
}

export type ImpulseFormParamsKeys = keyof ImpulseFormParams

export type GetImpulseFormParam<
  TTarget,
  TKey extends ImpulseFormParamsKeys,
  TFallback = never,
> = TTarget extends ImpulseForm<infer TParams> ? TParams[TKey] : TFallback

export abstract class ImpulseForm<
  TParams extends ImpulseFormParams = ImpulseFormParams,
> {
  public static isImpulseForm(value: unknown): value is ImpulseForm {
    return value instanceof ImpulseForm
  }

  protected static _childOf<TChildParams extends ImpulseFormParams>(
    parent: ImpulseForm,
    child: ImpulseForm<TChildParams>,
  ): ImpulseForm<TChildParams> {
    if (child._root === parent._root) {
      return child
    }

    return child._childOf(parent._root)
  }

  protected static _submitWith<TParams extends ImpulseFormParams>(
    form: ImpulseForm<TParams>,
    value: TParams["value.schema"],
  ): ReadonlyArray<void | Promise<unknown>> {
    return form._submitWith(value)
  }

  protected static _getFocusFirstInvalidValue(
    form: ImpulseForm,
  ): null | VoidFunction {
    return form._getFocusFirstInvalidValue()
  }

  protected static _setValidated(
    form: ImpulseForm,
    isValidated: boolean,
  ): void {
    form._setValidated(isValidated)
  }

  // necessary for type inference
  protected readonly _params?: TParams

  private readonly _onSubmit = new Emitter<
    [value: unknown],
    void | Promise<unknown>
  >()

  private readonly _submitAttempts = Impulse.of(0)
  private readonly _submittingCount = Impulse.of(0)

  private readonly _root: ImpulseForm

  protected constructor(_root: null | ImpulseForm) {
    this._root = _root ?? this
  }

  protected abstract _getFocusFirstInvalidValue(): null | VoidFunction

  protected abstract _childOf(parent: null | ImpulseForm): ImpulseForm<TParams>

  protected abstract _setValidated(isValidated: boolean): void

  protected _submitWith(
    value: TParams["value.schema"],
  ): ReadonlyArray<void | Promise<unknown>> {
    return this._onSubmit._emit(value)
  }

  public getSubmitCount(scope: Scope): number {
    return this._root._submitAttempts.getValue(scope)
  }

  public isSubmitting(scope: Scope): boolean {
    return this._root._submittingCount.getValue(scope) > 0
  }

  public onSubmit(
    listener: (value: TParams["value.schema"]) => void | Promise<unknown>,
  ): VoidFunction {
    return this._onSubmit._subscribe(listener)
  }

  public async submit(): Promise<void> {
    batch(() => {
      this._root._submitAttempts.setValue((count) => count + 1)
      this._root._setValidated(true)
    })

    const promises = untrack((scope) => {
      const value = this._root.getValue(scope)

      if (value !== null && this._root.isValid(scope)) {
        return this._root._submitWith(value).filter(isDefined)
      }
    })

    if (!isDefined(promises)) {
      this._root.focusFirstInvalidValue()
    } else if (promises.length > 0) {
      this._root._submittingCount.setValue((count) => count + 1)

      await Promise.all(promises)

      this._root._submittingCount.setValue((count) => count - 1)
    }
  }

  public focusFirstInvalidValue(): void {
    this._getFocusFirstInvalidValue()?.()
  }

  public clone(): ImpulseForm<TParams> {
    return this._childOf(null)
  }

  // TODO add select
  public isValid(scope: Scope): boolean {
    return !this.isInvalid(scope)
  }

  // TODO add select

  public isInvalid(scope: Scope): boolean {
    return this.getErrors(scope, isDefined)
  }

  public abstract getErrors(scope: Scope): TParams["errors.schema"]
  public abstract getErrors<TResult>(
    scope: Scope,
    select: (
      concise: TParams["errors.schema"],
      verbose: TParams["errors.schema.verbose"],
    ) => TResult,
  ): TResult

  public abstract setErrors(setter: TParams["errors.setter"]): void

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

  public abstract reset(resetter?: TParams["originalValue.setter"]): void

  public abstract isDirty(scope: Scope): boolean
  public abstract isDirty<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult

  public abstract getValue(scope: Scope): null | TParams["value.schema"]
  public abstract getValue<TResult>(
    scope: Scope,
    select: (
      concise: null | TParams["value.schema"],
      verbose: TParams["value.schema.verbose"],
    ) => TResult,
  ): TResult

  // TODO extend with select
  public abstract getOriginalValue(
    scope: Scope,
  ): TParams["originalValue.schema"]

  public abstract setOriginalValue(
    setter: TParams["originalValue.setter"],
  ): void

  // TODO extend with select
  public abstract getInitialValue(scope: Scope): TParams["originalValue.schema"]

  public abstract setInitialValue(setter: TParams["originalValue.setter"]): void
}
