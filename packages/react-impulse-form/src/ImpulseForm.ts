import { Impulse, type Scope, isDefined } from "./dependencies"
import type { ImpulseFormContext } from "./ImpulseFormContext"

export interface ImpulseFormParams {
  "value.schema": unknown
  "value.schema.verbose": unknown

  "originalValue.setter": unknown
  "originalValue.resetter": unknown
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

  protected static _setParent(form: ImpulseForm, parent: ImpulseForm): void {
    form._parent.setValue((current) => {
      if (isDefined(current)) {
        throw new Error("ImpulseForm already has a parent")
      }

      return parent
    })
  }

  // necessary for type inference
  protected readonly _params?: TParams
  private readonly _parent = Impulse.of<ImpulseForm>()
  protected readonly _context = Impulse.of<ImpulseFormContext>()

  /**
   * @private
   */
  public _getContext(scope: Scope): undefined | ImpulseFormContext {
    return this._context.getValue(scope)
  }

  /**
   * @private
   */
  public abstract _setContext(context: ImpulseFormContext): void

  /**
   * @private
   */
  public abstract _getFocusFirstInvalidValue(scope: Scope): null | VoidFunction

  public isValid(scope: Scope): boolean {
    return !this.isInvalid(scope)
  }

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

  /**
   * TODO provide reset options, where
   * untouch: boolean = true - when true, resets touched flag
   * unvalidate: boolean = true - when true, resets validated flag
   * unerror: boolean = true - when true, resets errors
   */

  public abstract reset(resetter?: TParams["originalValue.resetter"]): void

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

  public abstract getOriginalValue(
    scope: Scope,
  ): TParams["originalValue.schema"]
  public abstract setOriginalValue(
    setter: TParams["originalValue.setter"],
  ): void

  public abstract getInitialValue(scope: Scope): TParams["originalValue.schema"]
  public abstract setInitialValue(setter: TParams["originalValue.setter"]): void

  public abstract clone(): ImpulseForm<TParams>
}
