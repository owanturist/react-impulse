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
  isNull,
  params,
  isFunction,
  hasProperty,
  type NullOrNonNullable,
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

function createErrorImpulseCompare<TError>(compare: Compare<TError>) {
  return (left: null | TError, right: null | TError, scope: Scope) => {
    if (isNull(left) || isNull(right)) {
      // null === null -> true
      // null === unknown -> false
      // unknown === null -> false
      return left === right
    }

    return compare(left, right, scope)
  }
}

export type ImpulseFormValueValidator<TInput, TError, TOutput> = (
  input: TInput,
) => Result<TError, TOutput>

export interface ImpulseFormValueOptions<TInput, TError = null> {
  errors?: null | TError
  touched?: boolean

  /**
   * A compare function that determines whether the input value changes.
   * When it does, the ImpulseFormValue#getInput returns the new value.
   * Otherwise, it returns the previous value.
   *
   * Useful for none primitive values such as Objects, Arrays, Date, etc.
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
}

export interface ImpulseFormValueSchemaOptions<TInput, TOutput = TInput>
  extends ImpulseFormValueOptions<TInput, ReadonlyArray<string>> {
  /**
   * @default "onTouch"
   */
  validateOn?: ValidateStrategy

  schema: ZodLikeSchema<TOutput>
}

export interface ImpulseFormValueValidatedOptions<
  TInput,
  TError = null,
  TOutput = TInput,
> extends ImpulseFormValueOptions<TInput, TError> {
  /**
   * @default "onTouch"
   */
  validateOn?: ValidateStrategy

  validate: ImpulseFormValueValidator<TInput, TError, TOutput>

  /**
   * A compare function that determines whether the validation error change.
   * When it does, the ImpulseFormValue#getErrors returns the new value.
   * Otherwise, it returns the previous value.
   *
   * Useful for none primitive values such as Objects, Arrays, Date, etc.
   * Intended to improve performance but do not affect business logic.
   *
   * @default Object.is
   */

  isErrorEqual?: Compare<TError>
}

export type ImpulseFormValueInputSetter<TInput> = Setter<
  TInput,
  [TInput, TInput]
>

export type ImpulseFormValueFlagSetter = Setter<boolean>

export type ImpulseFormValueValidateOnSetter = Setter<ValidateStrategy>

export type ImpulseFormValueErrorsSetter<TError> = Setter<null | TError>

export class ImpulseFormValue<
  TInput,
  TError = null,
  TOutput = TInput,
> extends ImpulseForm<{
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

  "errors.setter": ImpulseFormValueErrorsSetter<TError>
  "errors.schema": null | TError
  "errors.schema.verbose": null | TError
}> {
  public static of<TInput, TError = null, TOutput = TInput>(
    input: TInput,
    options: ImpulseFormValueValidatedOptions<TInput, TError, TOutput>,
  ): ImpulseFormValue<
    TInput,
    NullOrNonNullable<TError>,
    NullOrNonNullable<TOutput>
  >

  public static of<TInput, TOutput = TInput>(
    input: TInput,
    options: ImpulseFormValueSchemaOptions<TInput, TOutput>,
  ): ImpulseFormValue<TInput, ReadonlyArray<string>, NullOrNonNullable<TOutput>>

  public static of<TInput, TError = null>(
    input: TInput,
    options?: ImpulseFormValueOptions<TInput, TError>,
  ): ImpulseFormValue<TInput, TError, TInput>

  public static of<TInput, TError = null, TOutput = TInput>(
    input: TInput,
    options?:
      | ImpulseFormValueOptions<TInput, TError>
      | ImpulseFormValueSchemaOptions<TInput, TOutput>
      | ImpulseFormValueValidatedOptions<TInput, TError, TOutput>,
  ):
    | ImpulseFormValue<TInput, TError>
    | ImpulseFormValue<TInput, ReadonlyArray<string>, TOutput>
    | ImpulseFormValue<TInput, TError, TOutput> /* enforce syntax highlight */ {
    const touched = options?.touched ?? false

    const isInputEqual = options?.isInputEqual ?? eq
    const isInputDirty =
      options?.isInputDirty ??
      ((left, right, scope) => !isInputEqual(left, right, scope))

    const isExplicitInitial = hasProperty(options, "initial")
    const initial = isExplicitInitial ? options.initial! : input
    const inputOrInitial = untrack((scope) => {
      return isInputEqual(initial, input, scope) ? initial : input
    })

    if (hasProperty(options, "schema")) {
      return new ImpulseFormValue<TInput, ReadonlyArray<string>, TOutput>(
        null,
        Impulse(),
        Impulse(touched),
        Impulse(options.validateOn ?? VALIDATE_ON_TOUCH),
        Impulse(options.errors ?? null, {
          compare: createErrorImpulseCompare(shallowArrayEquals),
        }),
        Impulse(isExplicitInitial),
        Impulse(initial, { compare: isInputEqual }),
        Impulse(inputOrInitial, { compare: isInputEqual }),
        Impulse<
          | undefined
          | {
              _validate: ImpulseFormValueValidator<
                TInput,
                ReadonlyArray<string>,
                TOutput
              >
            }
        >({
          _validate: (_input) => zodLikeParse(options.schema, _input),
        }),
        isInputEqual,
        isInputDirty,
      )
    }

    if (hasProperty(options, "validate")) {
      return new ImpulseFormValue<TInput, TError, TOutput>(
        null,
        Impulse(),
        Impulse(touched),
        Impulse(options.validateOn ?? VALIDATE_ON_TOUCH),
        Impulse<null | TError>(options.errors ?? null, {
          compare: createErrorImpulseCompare(options.isErrorEqual ?? eq),
        }),
        Impulse(isExplicitInitial),
        Impulse(initial, { compare: isInputEqual }),
        Impulse(inputOrInitial, { compare: isInputEqual }),
        Impulse<
          | undefined
          | {
              _validate: ImpulseFormValueValidator<TInput, TError, TOutput>
            }
        >({ _validate: options.validate }),
        isInputEqual,
        isInputDirty,
      )
    }

    return new ImpulseFormValue<TInput, TError>(
      null,
      Impulse(),
      Impulse(touched),
      Impulse<ValidateStrategy>(VALIDATE_ON_TOUCH),
      Impulse<null | TError>(options?.errors ?? null),
      Impulse(isExplicitInitial),
      Impulse(initial, { compare: isInputEqual }),
      Impulse(inputOrInitial, { compare: isInputEqual }),
      Impulse(),
      isInputEqual,
      isInputDirty,
    )
  }

  private readonly _onFocus = new Emitter<[errors: TError]>()

  private readonly _validated = Impulse(false)

  protected constructor(
    root: null | ImpulseForm,
    private readonly _initialSource: Impulse<
      undefined | ImpulseFormValue<TInput, TError, TOutput>
    >,
    private readonly _touched: Impulse<boolean>,
    // TODO convert to undefined | ValidateStrategy so it can inherit from parent (List)
    private readonly _validateOn: Impulse<ValidateStrategy>,
    private readonly _errors: Impulse<null | TError>,
    private readonly _isExplicitInitial: Impulse<boolean>,
    private readonly _initial: Impulse<TInput>,
    private readonly _input: Impulse<TInput>,
    private readonly _validator: Impulse<
      | undefined
      | {
          _validate: ImpulseFormValueValidator<TInput, TError, TOutput>
        }
    >,
    private readonly _isInputEqual: Compare<TInput>,
    private readonly _isInputDirty: Compare<TInput>,
  ) {
    super(root)
    this._updateValidated()
  }

  private _updateValidated(override = false): void {
    this._validated.setValue((isValidated, scope) => {
      if (
        (!override && isValidated) ||
        this._validator.getValue(scope) == null
      ) {
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

  private _validate(scope: Scope): [null | TError, null | TOutput] {
    const customError = this._errors.getValue(scope)

    if (!isNull(customError)) {
      return [customError, null]
    }

    const input = this.getInput(scope)
    const validator = this._validator.getValue(scope)

    if (!validator) {
      return [null, input as unknown as TOutput]
    }

    if (!this._validated.getValue(scope)) {
      return [null, null]
    }

    return validator._validate(this.getInput(scope))
  }

  protected _getFocusFirstInvalidValue(): null | VoidFunction {
    const errors = this._onFocus._isEmpty()
      ? null
      : untrack((scope) => this.getErrors(scope))

    if (errors == null) {
      return null
    }

    return () => {
      this._onFocus._emit(errors)
    }
  }

  // TODO add tests against _validated when cloning
  protected _childOf(
    parent: null | ImpulseForm,
  ): ImpulseFormValue<TInput, TError, TOutput> {
    return new ImpulseFormValue(
      parent,
      this._initialSource.clone(),
      this._touched.clone(),
      this._validateOn.clone(),
      this._errors.clone(),
      this._isExplicitInitial.clone(),
      this._initial.clone(),
      this._input.clone(),
      this._validator.clone(),
      this._isInputEqual,
      this._isInputDirty,
    )
  }

  protected _setInitial(
    initial: undefined | ImpulseFormValue<TInput, TError, TOutput>,
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

  public getErrors(scope: Scope): null | TError
  public getErrors<TResult>(
    scope: Scope,
    select: (concise: null | TError, verbose: null | TError) => TResult,
  ): TResult
  public getErrors<TResult = null | TError>(
    scope: Scope,
    select: (
      concise: null | TError,
      verbose: null | TError,
    ) => TResult = params._first as typeof select,
  ): TResult {
    const [errors] = this._validate(scope)

    return select(errors, errors)
  }

  public setErrors(setter: ImpulseFormValueErrorsSetter<TError>): void {
    this._errors.setValue((errors) => resolveSetter(setter, errors))
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
      this._validated.getValue(scope) || !isNull(this._errors.getValue(scope))

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
      const nextValidateOn = resolveSetter(setter, validateOn)

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

  public setValidator(
    validator: ImpulseFormValueValidator<TInput, TError, TOutput>,
  ): void {
    this._validator.setValue({ _validate: validator })
  }

  public setSchema(
    schema: TOutput extends ReadonlyArray<string>
      ? ZodLikeSchema<TOutput>
      : never,
  ): void {
    this.setValidator((_input) => {
      return zodLikeParse(schema, _input) as Result<TError, TOutput>
    })
  }

  public reset(
    resetter: ImpulseFormValueInputSetter<TInput> = params._first,
  ): void {
    batch((scope) => {
      const resetValue = isFunction(resetter)
        ? resetter(this.getInitial(scope), this._input.getValue(scope))
        : resetter

      this.setInitial(resetValue)
      this.setInput(resetValue)
      // TODO test when reset for all below
      this._validated.setValue(false)
      this._touched.setValue(false)
      this._errors.setValue(null)
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
      const nextValue = isFunction(setter)
        ? setter(input, this.getInitial(scope))
        : setter

      this._input.setValue(nextValue)

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
      const nextInitial = isFunction(setter)
        ? setter(initial, this._input.getValue(scope))
        : setter

      this._initial.setValue(nextInitial)

      this._isExplicitInitial.setValue(true)

      if (initial !== this._initial.getValue(scope)) {
        this._updateValidated()
        this._initialSource.getValue(scope)?.setInitial(setter)
      }
    })
  }

  public onFocusWhenInvalid(onFocus: (errors: TError) => void): VoidFunction {
    return this._onFocus._subscribe(onFocus)
  }
}
