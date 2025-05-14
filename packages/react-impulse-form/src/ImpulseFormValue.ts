import type Types from "ts-toolbelt"

import {
  type Compare,
  type Scope,
  Impulse,
  batch,
  untrack,
} from "./dependencies"
import {
  type Result,
  type Setter,
  shallowArrayEquals,
  eq,
  resolveSetter,
  isUndefined,
  isNull,
  isFunction,
  params,
} from "./utils"
import { ImpulseForm } from "./ImpulseForm"
import { zodLikeParse, type ZodLikeSchema } from "./ZodLikeSchema"
import {
  VALIDATE_ON_INIT,
  VALIDATE_ON_CHANGE,
  VALIDATE_ON_TOUCH,
  type ValidateStrategy,
  VALIDATE_ON_SUBMIT,
} from "./ValidateStrategy"
import { Emitter } from "./Emitter"

export interface ImpulseFormValueOptions<TInput, TOutput = TInput> {
  errors?: null | ReadonlyArray<string>
  touched?: boolean
  schema?: ZodLikeSchema<TOutput>

  /**
   * A compare function that determines whether the input value changes.
   * When it does, the ImpulseFormValue#getInput returns the new value.
   * Otherwise, it returns the previous value.
   *
   * Useful for none primitive values such as Objects, Arrays, Date.
   * Intended to improve performance but do not affect business logic.
   *
   * @default Object.is
   *
   * @example
   * const initial = { count: 0 }
   *
   * const form = ImpulseFormValue.of(initial, {
   *   isInputEqual: (left, right) => left.count === right.count,
   * })
   *
   * form.setInput({ count: 0 })
   * form.getInput(scope) === initial // true
   */
  isInputEqual?: Compare<TInput>

  /**
   * A compare function that determines whether the input is dirty.
   * When it is, the ImpulseFormValue#isDirty returns true.
   * Fallbacks to not(isInputEqual) if not provided.
   *
   * Useful for values that have intermediate states deviating from the initial value,
   * but should not be considered dirty such as strings, unsorted arrays, etc.
   * Intended to tune business logic and avoid false positives for dirty states.
   *
   * @default not(isInputEqual)
   *
   * @example
   * const form = ImpulseFormValue.of("", {
   *   isInputDirty: (left, right) => left.trim() !== right.trim(),
   * })
   *
   * form.setInput(" ")
   * form.isDirty(scope) === false
   */
  isInputDirty?: Compare<TInput>

  /**
   * @default input
   */
  initial?: TInput

  /**
   * @default "onTouch"
   */
  validateOn?: ValidateStrategy
}

export type ImpulseFormValueInputSetter<TInput> = Setter<
  TInput,
  [TInput, TInput]
>

export type ImpulseFormValueFlagSetter = Setter<boolean>

export type ImpulseFormValueValidateOnSetter = Setter<ValidateStrategy>

export type ImpulseFormValueErrorsSetter = Setter<null | ReadonlyArray<string>>

export class ImpulseFormValue<TInput, TOutput = TInput> extends ImpulseForm<{
  "input.setter": ImpulseFormValueInputSetter<TInput>
  "input.schema": TInput

  "output.schema": TOutput
  "output.schema.verbose": null | TOutput

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
  public static of<TInput>(
    input: TInput,
    options?: ImpulseFormValueOptions<TInput, TInput>,
  ): ImpulseFormValue<TInput, TInput>

  public static of<TInput, TOutput = TInput>(
    input: TInput,
    options: Types.Object.AtLeast<
      ImpulseFormValueOptions<TInput, TOutput>,
      "schema"
    >,
  ): ImpulseFormValue<TInput, TOutput>

  public static of<TInput, TOutput = TInput>(
    input: TInput,
    {
      errors,
      touched = false,
      schema,
      isInputEqual = eq,
      isInputDirty = (left, right, scope) => !isInputEqual(left, right, scope),
      initial,
      validateOn = VALIDATE_ON_TOUCH,
    }: ImpulseFormValueOptions<TInput, TOutput> = {},
  ): ImpulseFormValue<TInput, TOutput> {
    const _initial = isUndefined(initial) ? input : initial

    // initiate with the same value if specified but equal
    const inputOrInitial = untrack((scope) => {
      if (isInputEqual(_initial, input, scope)) {
        return _initial
      }

      return input
    })

    return new ImpulseFormValue(
      null,
      Impulse(),
      Impulse(touched),
      Impulse(validateOn),
      Impulse(errors ?? [], { compare: shallowArrayEquals }),
      Impulse(!isUndefined(initial)),
      Impulse(_initial, { compare: isInputEqual }),
      Impulse(inputOrInitial, { compare: isInputEqual }),
      Impulse(schema),
      isInputEqual,
      isInputDirty,
    )
  }

  private readonly _onFocus = new Emitter<[errors: ReadonlyArray<string>]>()

  private readonly _validated = Impulse(false)

  protected constructor(
    root: null | ImpulseForm,
    private readonly _initialSource: Impulse<
      undefined | ImpulseFormValue<TInput, TOutput>
    >,
    private readonly _touched: Impulse<boolean>,
    // TODO convert to undefined | ValidateStrategy so it can inherit from parent (List)
    private readonly _validateOn: Impulse<ValidateStrategy>,
    private readonly _errors: Impulse<ReadonlyArray<string>>,
    private readonly _isExplicitInitial: Impulse<boolean>,
    private readonly _initial: Impulse<TInput>,
    private readonly _input: Impulse<TInput>,
    private readonly _schema: Impulse<undefined | ZodLikeSchema<TOutput>>,
    private readonly _isInputEqual: Compare<TInput>,
    private readonly _isInputDirty: Compare<TInput>,
  ) {
    super(root)
    this._updateValidated()
  }

  private _updateValidated(override = false): void {
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
  ): Result<ReadonlyArray<string>, null | TOutput> {
    const errors = this._errors.getValue(scope)

    if (errors.length > 0) {
      return [errors, null]
    }

    const value = this.getInput(scope)
    const schema = this._schema.getValue(scope)

    if (isUndefined(schema)) {
      return [null, value as unknown as TOutput]
    }

    if (!this._validated.getValue(scope)) {
      return [null, null]
    }

    return zodLikeParse(schema, value)
  }

  protected _getFocusFirstInvalidValue(): null | VoidFunction {
    const errors = untrack((scope) => {
      return this._onFocus._isEmpty() ? null : this.getErrors(scope)
    })

    if (isNull(errors)) {
      return null
    }

    return () => {
      this._onFocus._emit(errors)
    }
  }

  // TODO add tests against _validated when cloning
  protected _childOf(
    parent: null | ImpulseForm,
  ): ImpulseFormValue<TInput, TOutput> {
    return new ImpulseFormValue(
      parent,
      this._initialSource.clone(),
      this._touched.clone(),
      this._validateOn.clone(),
      this._errors.clone(),
      this._isExplicitInitial.clone(),
      this._initial.clone(),
      this._input.clone(),
      this._schema.clone(),
      this._isInputEqual,
      this._isInputDirty,
    )
  }

  protected _setInitial(
    initial: undefined | ImpulseFormValue<TInput, TOutput>,
    isRoot: boolean,
  ): void {
    batch((scope) => {
      this._initialSource.setValue(initial)

      if (
        initial != null &&
        isRoot &&
        this._isExplicitInitial.getValue(scope)
      ) {
        initial.setInitial(this._initial.getValue(scope))
      }
    })
  }

  protected _setValidated(isValidated: boolean): void {
    this._validated.setValue(isValidated)
  }

  protected _isDirty<TResult>(
    scope: Scope,
    select: (concise: boolean, verbose: boolean, dirty: boolean) => TResult,
  ): TResult {
    const initial = this.getInitial(scope)
    const input = this.getInput(scope)
    const dirty = this._isInputDirty(initial, input, scope)

    return select(dirty, dirty, true)
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
    ) => TResult = params._first as typeof select,
  ): TResult {
    const [errors] = this._validate(scope)

    return select(errors, errors)
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
    ) => TResult = params._first as typeof select,
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
    ) => TResult = params._first as typeof select,
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
    ) => TResult = params._first as typeof select,
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

  public setSchema(schema: null | ZodLikeSchema<TOutput>): void {
    this._schema.setValue(schema ?? undefined)
  }

  public reset(
    resetter: ImpulseFormValueInputSetter<TInput> = params._first,
  ): void {
    batch((scope) => {
      const resetValue = resolveSetter(
        resetter,
        this.getInitial(scope),
        this._input.getValue(scope),
      )

      this.setInitial(resetValue)
      this.setInput(resetValue)
      // TODO test when reset for all below
      this._validated.setValue(false)
      this._touched.setValue(false)
      this._errors.setValue([])
    })
  }

  public getOutput(scope: Scope): null | TOutput
  public getOutput<TResult>(
    scope: Scope,
    select: (concise: null | TOutput, verbose: null | TOutput) => TResult,
  ): TResult
  public getOutput<TResult = null | TOutput>(
    scope: Scope,
    select: (
      concise: null | TOutput,
      verbose: null | TOutput,
    ) => TResult = params._first as typeof select,
  ): TResult {
    const [, output] = this._validate(scope)

    return select(output, output)
  }

  public getInput(scope: Scope): TInput {
    return this._input.getValue(scope)
  }

  // TODO add tests against initial coming as second argument
  public setInput(setter: ImpulseFormValueInputSetter<TInput>): void {
    batch((scope) => {
      const input = this._input.getValue(scope)

      this._input.setValue(resolveSetter(setter, input, this.getInitial(scope)))

      if (input !== this._input.getValue(scope)) {
        this._updateValidated()
      }
    })
  }

  public getInitial(scope: Scope): TInput {
    const form = this._initialSource.getValue(scope) ?? this

    return form._initial.getValue(scope)
  }

  // TODO add tests against input coming as second argument
  public setInitial(setter: ImpulseFormValueInputSetter<TInput>): void {
    batch((scope) => {
      const initial = this.getInitial(scope)

      this._initial.setValue(
        resolveSetter(setter, initial, this._input.getValue(scope)),
      )

      this._isExplicitInitial.setValue(true)

      if (initial !== this._initial.getValue(scope)) {
        this._updateValidated()
        this._initialSource.getValue(scope)?.setInitial(setter)
      }
    })
  }

  public onFocusWhenInvalid(
    onFocus: (errors: ReadonlyArray<string>) => void,
  ): VoidFunction {
    return this._onFocus._subscribe(onFocus)
  }
}
