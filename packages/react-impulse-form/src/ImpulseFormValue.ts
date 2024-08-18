import type Types from "ts-toolbelt"

import {
  type Compare,
  type Scope,
  Impulse,
  batch,
  isFunction,
  identity,
  isDefined,
  untrack,
} from "./dependencies"
import { type Setter, shallowArrayEquals, eq, resolveSetter } from "./utils"
import { ImpulseForm } from "./ImpulseForm"
import type { ImpulseFormSchema, Result } from "./ImpulseFormSchema"
import {
  VALIDATE_ON_INIT,
  VALIDATE_ON_CHANGE,
  VALIDATE_ON_TOUCH,
  type ValidateStrategy,
  VALIDATE_ON_SUBMIT,
} from "./ValidateStrategy"
import { Emitter } from "./Emitter"

export interface ImpulseFormValueOptions<
  TOriginalValue,
  TValue = TOriginalValue,
> {
  errors?: null | ReadonlyArray<string>
  touched?: boolean
  schema?: ImpulseFormSchema<TValue, TOriginalValue>

  // TODO add isOriginalValueDirty and isValueEqual (introduce _value: TransmittingImpulse<TValue>)

  /**
   * A compare function that determines whether the original value changes.
   * When it does, the ImpulseFormValue#getOriginalValue returns the new value.
   * Otherwise, it returns the previous value.
   *
   * @default Object.is
   *
   * @example
   * const initial = { count: 0 }
   *
   * const form = ImpulseFormValue.of(initial, {
   *   isOriginalValueEqual: (left, right) => left.count === right.count,
   * })
   *
   * form.setOriginalValue({ count: 0 })
   * form.getOriginalValue(scope) === initial // true
   */
  isOriginalValueEqual?: Compare<TOriginalValue>
  initialValue?: TOriginalValue
  /**
   * @default "onTouch"
   */
  validateOn?: ValidateStrategy
}

export type ImpulseFormValueOriginalValueSetter<TOriginalValue> = Setter<
  TOriginalValue,
  [TOriginalValue, TOriginalValue]
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
      errors,
      touched = false,
      schema,
      isOriginalValueEqual = eq,
      initialValue,
      validateOn = VALIDATE_ON_TOUCH,
    }: ImpulseFormValueOptions<TOriginalValue, TValue> = {},
  ): ImpulseFormValue<TOriginalValue, TValue> {
    const _initialValue = isDefined.strict(initialValue)
      ? initialValue
      : originalValue

    const isOriginalValueEqualImpulse = Impulse.of(isOriginalValueEqual)
    const isOriginalValueEqualStable: Compare<TOriginalValue> = (
      left,
      right,
      scope,
    ) => {
      const compare = isOriginalValueEqualImpulse.getValue(scope)

      return compare(left, right, scope)
    }

    const initialOriginalValue = untrack((scope) => {
      if (isOriginalValueEqual(_initialValue, originalValue, scope)) {
        return _initialValue
      }

      return originalValue
    })

    return new ImpulseFormValue(
      null,
      Impulse.of(),
      Impulse.of(touched),
      Impulse.of(validateOn),
      Impulse.of(errors ?? [], { compare: shallowArrayEquals }),
      Impulse.of(isDefined.strict(initialValue)),
      Impulse.of(_initialValue, { compare: isOriginalValueEqualStable }),
      Impulse.of(initialOriginalValue, { compare: isOriginalValueEqualStable }),
      Impulse.of(schema),
      isOriginalValueEqualImpulse,
    )
  }

  private readonly _onFocus = new Emitter<[errors: ReadonlyArray<string>]>()

  private readonly _validated = Impulse.of(false)

  protected constructor(
    root: null | ImpulseForm,
    private readonly _initial: Impulse<
      undefined | ImpulseFormValue<TOriginalValue, TValue>
    >,
    private readonly _touched: Impulse<boolean>,
    // TODO convert to undefined | ValidateStrategy so it can inherit from parent (List)
    private readonly _validateOn: Impulse<ValidateStrategy>,
    private readonly _errors: Impulse<ReadonlyArray<string>>,
    private readonly _isExplicitInitialValue: Impulse<boolean>,
    private readonly _initialValue: Impulse<TOriginalValue>,
    private readonly _originalValue: Impulse<TOriginalValue>,
    private readonly _schema: Impulse<
      undefined | ImpulseFormSchema<TValue, TOriginalValue>
    >,
    private readonly _isOriginalValueEqual: Impulse<Compare<TOriginalValue>>,
  ) {
    super(root)
    this._updateValidated()
  }

  private _updateValidated(override: boolean = false): void {
    this._validated.setValue((isValidated, scope) => {
      if (!override && isValidated) {
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

    if (!this._validated.getValue(scope)) {
      return { success: true, data: null }
    }

    const result = schema.safeParse(value)

    if (result.success) {
      return result
    }

    return {
      success: false,
      error: result.error.errors.map(({ message }) => message),
    }
  }

  protected _getFocusFirstInvalidValue(): null | VoidFunction {
    const errors = untrack((scope) => {
      return this._onFocus._isEmpty() ? null : this.getErrors(scope)
    })

    if (!isDefined(errors)) {
      return null
    }

    return () => {
      this._onFocus._emit(errors)
    }
  }

  // TODO add tests against _validated when cloning
  protected _childOf(
    parent: null | ImpulseForm,
  ): ImpulseFormValue<TOriginalValue, TValue> {
    return new ImpulseFormValue(
      parent,
      this._initial.clone(),
      this._touched.clone(),
      this._validateOn.clone(),
      this._errors.clone(),
      this._isExplicitInitialValue.clone(),
      this._initialValue.clone(),
      this._originalValue.clone(),
      this._schema.clone(),
      this._isOriginalValueEqual.clone(),
    )
  }

  protected _setInitial(
    initial: undefined | ImpulseFormValue<TOriginalValue, TValue>,
    isRoot: boolean,
  ): void {
    batch((scope) => {
      this._initial.setValue(initial)

      if (
        initial != null &&
        isRoot &&
        this._isExplicitInitialValue.getValue(scope)
      ) {
        initial.setInitialValue(this._initialValue.getValue(scope))
      }
    })
  }

  protected _setValidated(isValidated: boolean): void {
    this._validated.setValue(isValidated)
  }

  protected _isDirty<TResult>(
    scope: Scope,
    initial: ImpulseFormValue<TOriginalValue, TValue>,
    select: (concise: boolean, verbose: boolean) => TResult,
  ): TResult {
    const initialValue = initial.getInitialValue(scope)
    const originalValue = this.getOriginalValue(scope)
    const compare = this._isOriginalValueEqual.getValue(scope)
    const dirty = !compare(initialValue, originalValue, scope)

    return select(dirty, dirty)
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
    const validated =
      this._validated.getValue(scope) || this._errors.getValue(scope).length > 0

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
    batch((scope) => {
      const validateOn = this._validateOn.getValue(scope)
      const nextValidateOn = isFunction(setter) ? setter(validateOn) : setter

      if (validateOn !== nextValidateOn) {
        this._validateOn.setValue(nextValidateOn)
        this._updateValidated(true)
      }
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
    batch(() => {
      this._touched.setValue(touched)
      this._updateValidated()
    })
  }

  public setSchema(
    schema: null | ImpulseFormSchema<TValue, TOriginalValue>,
  ): void {
    this._schema.setValue(schema ?? undefined)
  }

  public reset(
    resetter: ImpulseFormValueOriginalValueSetter<TOriginalValue> = identity,
  ): void {
    batch((scope) => {
      const resetValue = resolveSetter(
        resetter,
        this.getInitialValue(scope),
        this._originalValue.getValue(scope),
      )

      this.setInitialValue(resetValue)
      this.setOriginalValue(resetValue)
      // TODO test when reset for all below
      this._validated.setValue(false)
      this._touched.setValue(false)
      this._errors.setValue([])
    })
  }

  public setCompare(setter: Setter<Compare<TOriginalValue>>): void {
    this._isOriginalValueEqual.setValue(setter)
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

  // TODO add tests against initialValue coming as second argument
  public setOriginalValue(
    setter: ImpulseFormValueOriginalValueSetter<TOriginalValue>,
  ): void {
    batch((scope) => {
      const originalValue = this._originalValue.getValue(scope)

      this._originalValue.setValue(
        resolveSetter(setter, originalValue, this.getInitialValue(scope)),
      )

      if (originalValue !== this._originalValue.getValue(scope)) {
        this._updateValidated()
      }
    })
  }

  public getInitialValue(scope: Scope): TOriginalValue {
    const form = this._initial.getValue(scope) ?? this

    return form._initialValue.getValue(scope)
  }

  // TODO add tests against originalValue coming as second argument
  public setInitialValue(
    setter: ImpulseFormValueOriginalValueSetter<TOriginalValue>,
  ): void {
    batch((scope) => {
      const initialValue = this.getInitialValue(scope)

      this._initialValue.setValue(
        resolveSetter(
          setter,
          initialValue,
          this._originalValue.getValue(scope),
        ),
      )

      this._isExplicitInitialValue.setValue(true)

      if (initialValue !== this._initialValue.getValue(scope)) {
        this._updateValidated()
        this._initial.getValue(scope)?.setInitialValue(setter)
      }
    })
  }

  public onFocusWhenInvalid(
    onFocus: (errors: ReadonlyArray<string>) => void,
  ): VoidFunction {
    return this._onFocus._subscribe(onFocus)
  }
}
