import { type Compare, Impulse, type Scope, batch } from "react-impulse"

import {
  type Func,
  type Setter,
  type AtLeast,
  isDefined,
  isFunction,
  identity,
  shallowArrayEquals,
} from "./utils"
import { ImpulseForm } from "./ImpulseForm"
import type { ImpulseFormContext } from "./ImpulseFormContext"
import type { ImpulseFormSchema, Result } from "./ImpulseFormSchema"

export interface ImpulseFormValueOptions<
  TOriginalValue,
  TValue = TOriginalValue,
> {
  errors?: null | ReadonlyArray<string>
  touched?: boolean
  schema?: ImpulseFormSchema<TValue, TOriginalValue>
  compare?: Compare<TOriginalValue>
  initialValue?: TOriginalValue
}

export type ImpulseFormValueOriginalValueSetter<TOriginalValue> =
  Setter<TOriginalValue>

export type ImpulseFormValueOriginalValueResetter<TOriginalValue> = Setter<
  TOriginalValue,
  [initialValue: TOriginalValue, originalValue: TOriginalValue]
>

export type ImpulseFormValueFlagSetter = Setter<boolean>

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
    options: AtLeast<ImpulseFormValueOptions<TOriginalValue, TValue>, "schema">,
  ): ImpulseFormValue<TOriginalValue, TValue>

  public static of<TOriginalValue, TValue = TOriginalValue>(
    originalValue: TOriginalValue,
    {
      errors = [],
      touched = false,
      schema,
      compare = Object.is,
      initialValue = originalValue,
    }: ImpulseFormValueOptions<TOriginalValue, TValue> = {},
  ): ImpulseFormValue<TOriginalValue, TValue> {
    const compareImpulse = Impulse.of(compare)
    const compareFn: Compare<TOriginalValue> = (left, right, scope) => {
      const cmp = compareImpulse.getValue(scope)

      return cmp(left, right, scope)
    }

    return new ImpulseFormValue(
      Impulse.of(touched),
      Impulse.of(errors ?? [], { compare: shallowArrayEquals }),
      Impulse.of(initialValue, { compare: compareFn }),
      Impulse.of(originalValue, { compare: compareFn }),
      Impulse.of(schema),
      compareImpulse,
    )
  }

  private readonly onFocus = Impulse.of<Func<[errors: ReadonlyArray<string>]>>()

  protected constructor(
    private readonly touched: Impulse<boolean>,
    private readonly errors: Impulse<ReadonlyArray<string>>,
    private readonly initialValue: Impulse<TOriginalValue>,
    private readonly originalValue: Impulse<TOriginalValue>,
    private readonly schema: Impulse<
      undefined | ImpulseFormSchema<TValue, TOriginalValue>
    >,
    private readonly compare: Impulse<Compare<TOriginalValue>>,
  ) {
    super()
  }

  private validate(scope: Scope): Result<ReadonlyArray<string>, TValue> {
    const errors = this.errors.getValue(scope)

    if (errors.length > 0) {
      return { success: false, error: errors }
    }

    const value = this.getOriginalValue(scope)
    const schema = this.schema.getValue(scope)

    if (!isDefined(schema)) {
      return { success: true, data: value as unknown as TValue }
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

  public setContext(context: ImpulseFormContext): void {
    this.context.setValue(context)
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
    const result = this.validate(scope)
    const error = result.success
      ? null
      : result.error.length === 0
        ? null
        : result.error

    return select(error, error)
  }

  public setErrors(setter: ImpulseFormValueErrorsSetter): void {
    this.errors.setValue((errors) => {
      const nextErrors = isFunction(setter)
        ? setter(errors.length === 0 ? null : errors)
        : setter

      return nextErrors ?? []
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
    const touched = this.touched.getValue(scope)

    return select(touched, touched)
  }

  public setTouched(touched: ImpulseFormValueFlagSetter): void {
    this.touched.setValue(touched)
  }

  public setSchema(schema: ImpulseFormSchema<TValue, TOriginalValue>): void {
    this.schema.setValue(schema)
  }

  public reset(
    resetter?: ImpulseFormValueOriginalValueResetter<TOriginalValue>,
  ): void
  public reset(
    resetter: ImpulseFormValueOriginalValueResetter<TOriginalValue> = identity,
  ): void {
    batch((scope) => {
      const initialValue = this.initialValue.getValue(scope)
      const resetValue = isFunction(resetter)
        ? resetter(initialValue, this.originalValue.getValue(scope))
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
    const compare = this.compare.getValue(scope)
    const dirty = !compare(initialValue, originalValue)

    return select(dirty, dirty)
  }

  public setCompare(setter: Setter<Compare<TOriginalValue>>): void {
    this.compare.setValue(setter)
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
    const result = this.validate(scope)
    const value = result.success ? result.data : null

    return select(value, value)
  }

  public getOriginalValue(scope: Scope): TOriginalValue {
    return this.originalValue.getValue(scope)
  }

  public setOriginalValue(
    setter: ImpulseFormValueOriginalValueSetter<TOriginalValue>,
  ): void {
    batch((scope) => {
      const originalValue = this.originalValue.getValue(scope)

      this.originalValue.setValue(setter)

      if (originalValue !== this.originalValue.getValue(scope)) {
        this.errors.setValue([])
      }
    })
  }

  public getInitialValue(scope: Scope): TOriginalValue {
    return this.initialValue.getValue(scope)
  }

  public setInitialValue(
    setter: ImpulseFormValueOriginalValueSetter<TOriginalValue>,
  ): void {
    this.initialValue.setValue(setter)
  }

  public getFocusFirstInvalidValue(scope: Scope): null | VoidFunction {
    const errors = this.getErrors(scope)
    const onFocus = this.onFocus.getValue(scope)

    if (!isDefined(errors) || !isDefined(onFocus)) {
      return null
    }

    return () => {
      onFocus(errors)
    }
  }

  public setOnFocus(
    onFocus: null | Func<[errors: ReadonlyArray<string>]>,
  ): void {
    this.onFocus.setValue(() => onFocus ?? undefined)
  }

  public clone(): ImpulseFormValue<TOriginalValue, TValue> {
    return new ImpulseFormValue(
      this.touched.clone(),
      this.errors.clone(),
      this.initialValue.clone(),
      this.originalValue.clone(),
      this.schema.clone(),
      this.compare.clone(),
    )
  }
}
