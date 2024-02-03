import type Types from "ts-toolbelt"

import {
  type Compare,
  type Scope,
  Impulse,
  batch,
  isFunction,
  identity,
} from "./dependencies"
import { type Func, type Setter, shallowArrayEquals, isDefined } from "./utils"
import { ImpulseForm } from "./ImpulseForm"
import type { ImpulseFormContext } from "./ImpulseFormContext"
import type { ImpulseFormSchema, Result } from "./ImpulseFormSchema"
import {
  VALIDATE_ON_INIT,
  VALIDATE_ON_CHANGE,
  VALIDATE_ON_TOUCH,
  type ValidateStrategy,
  VALIDATE_ON_SUBMIT,
} from "./ValidateStrategy"

export interface ImpulseFormValueOptions<
  TOriginalValue,
  TValue = TOriginalValue,
> {
  errors?: null | ReadonlyArray<string>
  touched?: boolean
  schema?: ImpulseFormSchema<TValue, TOriginalValue>
  // TODO rename to isOriginalValueEqual (whether or not onChange should replace value), add isOriginalValueDirty and isValueEqual (introduce _value: TransmittingImpulse<TValue>)
  compare?: Compare<TOriginalValue>
  initialValue?: TOriginalValue
  /**
   * @default "onTouch"
   */
  validateOn?: ValidateStrategy
}

export type ImpulseFormValueOriginalValueSetter<TOriginalValue> =
  Setter<TOriginalValue>

export type ImpulseFormValueOriginalValueResetter<TOriginalValue> = Setter<
  TOriginalValue,
  [initialValue: TOriginalValue, originalValue: TOriginalValue]
>

export type ImpulseFormValueFlagSetter = Setter<boolean>

export type ImpulseFormValueValidateOnSetter = Setter<ValidateStrategy>

export type ImpulseFormValueErrorsSetter = Setter<null | ReadonlyArray<string>>

export class ImpulseFormValue<
  TOriginalValue,
  TValue = TOriginalValue,
> extends ImpulseForm<{
  "value.schema": TValue
  "value.schema.verbose": null | TValue

  "originalValue.setter": ImpulseFormValueOriginalValueSetter<TOriginalValue>
  "originalValue.resetter": ImpulseFormValueOriginalValueResetter<TOriginalValue>
  "originalValue.schema": TOriginalValue

  "flag.setter": ImpulseFormValueFlagSetter
  "flag.schema": boolean
  "flag.schema.verbose": boolean

  "validateOn.setter": ImpulseFormValueValidateOnSetter
  "validateOn.schema": ValidateStrategy
  "validateOn.schema.verbose": ValidateStrategy

  "errors.setter": ImpulseFormValueErrorsSetter
  "errors.schema": null | ReadonlyArray<string>
  "errors.schema.verbose": null | ReadonlyArray<string>
}> {
  public static of<TOriginalValue extends TValue, TValue = TOriginalValue>(
    originalValue: TOriginalValue,
    options?: ImpulseFormValueOptions<TOriginalValue, TValue>,
  ): ImpulseFormValue<TOriginalValue, TValue>

  public static of<TOriginalValue, TValue = TOriginalValue>(
    originalValue: TOriginalValue,
    options: Types.Object.AtLeast<
      ImpulseFormValueOptions<TOriginalValue, TValue>,
      "schema"
    >,
  ): ImpulseFormValue<TOriginalValue, TValue>

  public static of<TOriginalValue, TValue = TOriginalValue>(
    originalValue: TOriginalValue,
    {
      errors = [],
      touched = false,
      schema,
      compare = Object.is,
      initialValue = originalValue,
      validateOn = VALIDATE_ON_TOUCH,
    }: ImpulseFormValueOptions<TOriginalValue, TValue> = {},
  ): ImpulseFormValue<TOriginalValue, TValue> {
    const compareImpulse = Impulse.of(compare)
    const compareFn: Compare<TOriginalValue> = (left, right, scope) => {
      const cmp = compareImpulse.getValue(scope)

      return cmp(left, right, scope)
    }

    return new ImpulseFormValue(
      Impulse.of(touched),
      Impulse.of(validateOn),
      Impulse.of(errors ?? [], { compare: shallowArrayEquals }),
      Impulse.of(initialValue, { compare: compareFn }),
      Impulse.of(originalValue, { compare: compareFn }),
      Impulse.of(schema),
      compareImpulse,
    )
  }

  private readonly _onFocus =
    Impulse.of<(errors: ReadonlyArray<string>) => void>()

  private readonly _validated = Impulse.of(false)

  protected constructor(
    private readonly _touched: Impulse<boolean>,
    private readonly _validateOn: Impulse<ValidateStrategy>,
    private readonly _errors: Impulse<ReadonlyArray<string>>,
    private readonly _initialValue: Impulse<TOriginalValue>,
    private readonly _originalValue: Impulse<TOriginalValue>,
    private readonly _schema: Impulse<
      undefined | ImpulseFormSchema<TValue, TOriginalValue>
    >,
    private readonly _compare: Impulse<Compare<TOriginalValue>>,
  ) {
    super()
    this._initValidated()
  }

  private _initValidated(): void {
    this._validated.setValue((validated, scope) => {
      if (validated) {
        return true
      }

      switch (this.getValidateOn(scope)) {
        case VALIDATE_ON_INIT: {
          return true
        }

        case VALIDATE_ON_TOUCH: {
          return this.isTouched(scope)
        }

        case VALIDATE_ON_CHANGE: {
          return this.isDirty(scope)
        }

        case VALIDATE_ON_SUBMIT: {
          // TODO return true if submitCount > 0
          return false
        }
      }
    })
  }

  private _validate(
    scope: Scope,
  ): Result<ReadonlyArray<string>, null | TValue> {
    const errors = this._errors.getValue(scope)

    if (errors.length > 0) {
      return { success: false, error: errors }
    }

    const value = this.getOriginalValue(scope)
    const schema = this._schema.getValue(scope)

    if (!isDefined(schema)) {
      return { success: true, data: value as unknown as TValue }
    }

    const result = schema.safeParse(value)

    if (result.success) {
      return result
    }

    if (!this._validated.getValue(scope)) {
      return { success: true, data: null }
    }

    return {
      success: false,
      error: result.error.errors.map(({ message }) => message),
    }
  }

  public _setContext(context: ImpulseFormContext): void {
    this._context.setValue(context)
  }

  public getErrors(scope: Scope): null | ReadonlyArray<string>
  public getErrors<TResult>(
    scope: Scope,
    select: (
      concise: null | ReadonlyArray<string>,
      verbose: null | ReadonlyArray<string>,
    ) => TResult,
  ): TResult
  public getErrors<TResult = null | ReadonlyArray<string>>(
    scope: Scope,
    select: (
      concise: null | ReadonlyArray<string>,
      verbose: null | ReadonlyArray<string>,
    ) => TResult = identity as typeof select,
  ): TResult {
    const result = this._validate(scope)
    const error =
      result.success || result.error.length === 0 ? null : result.error

    return select(error, error)
  }

  public setErrors(setter: ImpulseFormValueErrorsSetter): void {
    this._errors.setValue((errors) => {
      const nextErrors = isFunction(setter)
        ? setter(errors.length === 0 ? null : errors)
        : setter

      return nextErrors ?? []
    })
  }

  public isValidated(scope: Scope): boolean
  public isValidated<TResult>(
    scope: Scope,
    select: (concise: boolean, verbose: boolean) => TResult,
  ): TResult
  public isValidated<TResult = boolean>(
    scope: Scope,
    select: (
      concise: boolean,
      verbose: boolean,
    ) => TResult = identity as typeof select,
  ): TResult {
    const validated = this._validated.getValue(scope)

    return select(validated, validated)
  }

  public getValidateOn(scope: Scope): ValidateStrategy
  public getValidateOn<TResult>(
    scope: Scope,
    select: (concise: ValidateStrategy, verbose: ValidateStrategy) => TResult,
  ): TResult
  public getValidateOn<TResult = ValidateStrategy>(
    scope: Scope,
    select: (
      concise: ValidateStrategy,
      verbose: ValidateStrategy,
    ) => TResult = identity as typeof select,
  ): TResult {
    const validateOn = this._validateOn.getValue(scope)

    return select(validateOn, validateOn)
  }

  public setValidateOn(setter: ImpulseFormValueValidateOnSetter): void {
    batch(() => {
      this._validateOn.setValue((validateOn) => {
        return isFunction(setter) ? setter(validateOn) : setter
      })
      this._initValidated()
    })
  }

  public isTouched(scope: Scope): boolean
  public isTouched<TResult>(
    scope: Scope,
    select: (concise: boolean, verbose: boolean) => TResult,
  ): TResult
  public isTouched<TResult = boolean>(
    scope: Scope,
    select: (
      concise: boolean,
      verbose: boolean,
    ) => TResult = identity as typeof select,
  ): TResult {
    const touched = this._touched.getValue(scope)

    return select(touched, touched)
  }

  public setTouched(touched: ImpulseFormValueFlagSetter): void {
    batch((scope) => {
      this._touched.setValue(touched)

      if (touched && this._validateOn.getValue(scope) === VALIDATE_ON_TOUCH) {
        this._validated.setValue(true)
      }
    })
  }

  public setSchema(schema: ImpulseFormSchema<TValue, TOriginalValue>): void {
    this._schema.setValue(schema)
  }

  public reset(
    resetter?: ImpulseFormValueOriginalValueResetter<TOriginalValue>,
  ): void
  public reset(
    resetter: ImpulseFormValueOriginalValueResetter<TOriginalValue> = identity,
  ): void {
    batch((scope) => {
      const initialValue = this._initialValue.getValue(scope)
      const resetValue = isFunction(resetter)
        ? resetter(initialValue, this._originalValue.getValue(scope))
        : resetter

      this.setInitialValue(resetValue)
      this.setOriginalValue(resetValue)
    })
  }

  public isDirty(scope: Scope): boolean
  public isDirty<TResult>(
    scope: Scope,
    select: (concise: boolean, verbose: boolean) => TResult,
  ): TResult
  public isDirty<TResult = boolean>(
    scope: Scope,
    select: (
      concise: boolean,
      verbose: boolean,
    ) => TResult = identity as typeof select,
  ): TResult {
    const initialValue = this.getInitialValue(scope)
    const originalValue = this.getOriginalValue(scope)
    const compare = this._compare.getValue(scope)
    const dirty = !compare(initialValue, originalValue, scope)

    return select(dirty, dirty)
  }

  public setCompare(setter: Setter<Compare<TOriginalValue>>): void {
    this._compare.setValue(setter)
  }

  public getValue(scope: Scope): null | TValue
  public getValue<TResult>(
    scope: Scope,
    select: (concise: null | TValue, verbose: null | TValue) => TResult,
  ): TResult
  public getValue<TResult = null | TValue>(
    scope: Scope,
    select: (
      concise: null | TValue,
      verbose: null | TValue,
    ) => TResult = identity as typeof select,
  ): TResult {
    const result = this._validate(scope)
    const value = result.success ? result.data : null

    return select(value, value)
  }

  public getOriginalValue(scope: Scope): TOriginalValue {
    return this._originalValue.getValue(scope)
  }

  public setOriginalValue(
    setter: ImpulseFormValueOriginalValueSetter<TOriginalValue>,
  ): void {
    batch((scope) => {
      const originalValue = this._originalValue.getValue(scope)

      this._originalValue.setValue(setter)

      if (originalValue !== this._originalValue.getValue(scope)) {
        this._errors.setValue([])

        if (this._validateOn.getValue(scope) === VALIDATE_ON_CHANGE) {
          this._validated.setValue(true)
        }
      }
    })
  }

  public getInitialValue(scope: Scope): TOriginalValue {
    return this._initialValue.getValue(scope)
  }

  public setInitialValue(
    setter: ImpulseFormValueOriginalValueSetter<TOriginalValue>,
  ): void {
    this._initialValue.setValue(setter)
  }

  public _getFocusFirstInvalidValue(scope: Scope): null | VoidFunction {
    const errors = this.getErrors(scope)
    const onFocus = this._onFocus.getValue(scope)

    if (!isDefined(errors) || !isDefined(onFocus)) {
      return null
    }

    return () => {
      onFocus(errors)
    }
  }

  /**
   * @private
   */
  public _setOnFocus(
    onFocus: null | Func<[errors: ReadonlyArray<string>]>,
  ): void {
    this._onFocus.setValue(() => onFocus ?? undefined)
  }

  // TODO add tests against _validated when cloning
  public clone(): ImpulseFormValue<TOriginalValue, TValue> {
    return new ImpulseFormValue(
      this._touched.clone(),
      this._validateOn.clone(),
      this._errors.clone(),
      this._initialValue.clone(),
      this._originalValue.clone(),
      this._schema.clone(),
      this._compare.clone(),
    )
  }
}
