import { hasProperty } from "~/tools/has-property"
import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isShallowArrayEqual } from "~/tools/is-shallow-array-equal"
import { isStrictEqual } from "~/tools/is-strict-equal"
import type { NullOrNonNullable } from "~/tools/null-or-non-nullable"
import { params } from "~/tools/params"
import { type Setter, resolveSetter } from "~/tools/setter"

import {
  type Compare,
  Impulse,
  type Scope,
  batch,
  untrack,
} from "./dependencies"
import { Emitter } from "./emitter"
import { ImpulseForm } from "./impulse-form"
import type { Result } from "./result"
import {
  VALIDATE_ON_CHANGE,
  VALIDATE_ON_INIT,
  VALIDATE_ON_SUBMIT,
  VALIDATE_ON_TOUCH,
  type ValidateStrategy,
} from "./validate-strategy"
import { type ZodLikeSchema, zodLikeParse } from "./zod-like-schema"

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

export type ImpulseFormUnitValidator<TInput, TError, TOutput> = (
  input: TInput,
) => Result<TError, TOutput>

export interface ImpulseFormUnitOptions<TInput, TError = null> {
  /**
   * The initial or custom error associated with the form value.
   * This can be used to set an error state manually.
   *
   * @default null
   */
  error?: null | TError

  touched?: boolean

  /**
   * A compare function that determines whether the input value changes.
   * When it does, the ImpulseFormUnit#getInput returns the new value.
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
   * const form = ImpulseFormUnit.of(initial, {
   *   isInputEqual: (left, right) => left.count === right.count,
   * })
   *
   * form.setInput({ count: 0 })
   * form.getInput(scope) === initial // true
   */
  isInputEqual?: Compare<TInput>

  /**
   * A compare function that determines whether the input is dirty.
   * When it is, the ImpulseFormUnit#isDirty returns true.
   * Fallbacks to not(isInputEqual) if not provided.
   *
   * Useful for values that have intermediate states deviating from the initial value,
   * but should not be considered dirty such as strings, unsorted arrays, etc.
   * Intended to tune business logic and avoid false positives for dirty states.
   *
   * @default not(isInputEqual)
   *
   * @example
   * const form = ImpulseFormUnit.of("", {
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

export interface ImpulseFormUnitSchemaOptions<TInput, TOutput = TInput>
  extends ImpulseFormUnitOptions<TInput, ReadonlyArray<string>> {
  /**
   * @default "onTouch"
   */
  validateOn?: ValidateStrategy

  schema: ZodLikeSchema<TOutput>
}

export interface ImpulseFormUnitValidatedOptions<
  TInput,
  TError = null,
  TOutput = TInput,
> extends ImpulseFormUnitOptions<TInput, TError> {
  /**
   * @default "onTouch"
   */
  validateOn?: ValidateStrategy

  validate: ImpulseFormUnitValidator<TInput, TError, TOutput>

  /**
   * A compare function that determines whether the validation error change.
   * When it does, the ImpulseFormUnit#getError returns the new value.
   * Otherwise, it returns the previous value.
   *
   * Useful for none primitive values such as Objects, Arrays, Date, etc.
   * Intended to improve performance but do not affect business logic.
   *
   * @default Object.is
   */

  isErrorEqual?: Compare<TError>
}

export type ImpulseFormUnitInputSetter<TInput> = Setter<
  TInput,
  [TInput, TInput]
>

export type ImpulseFormUnitFlagSetter = Setter<boolean>

export type ImpulseFormUnitValidateOnSetter = Setter<ValidateStrategy>

export type ImpulseFormUnitErrorsSetter<TError> = Setter<null | TError>

export class ImpulseFormUnit<
  TInput,
  TError = null,
  TOutput = TInput,
> extends ImpulseForm<{
  "input.setter": ImpulseFormUnitInputSetter<TInput>
  "input.schema": TInput

  "output.schema": TOutput
  "output.schema.verbose": null | TOutput

  "flag.setter": ImpulseFormUnitFlagSetter
  "flag.schema": boolean
  "flag.schema.verbose": boolean

  "validateOn.setter": ImpulseFormUnitValidateOnSetter
  "validateOn.schema": ValidateStrategy
  "validateOn.schema.verbose": ValidateStrategy

  "error.setter": ImpulseFormUnitErrorsSetter<TError>
  "error.schema": null | TError
  "error.schema.verbose": null | TError
}> {
  public static of<TInput, TError = null, TOutput = TInput>(
    input: TInput,
    options: ImpulseFormUnitValidatedOptions<TInput, TError, TOutput>,
  ): ImpulseFormUnit<
    TInput,
    NullOrNonNullable<TError>,
    NullOrNonNullable<TOutput>
  >

  public static of<TInput, TOutput = TInput>(
    input: TInput,
    options: ImpulseFormUnitSchemaOptions<TInput, TOutput>,
  ): ImpulseFormUnit<TInput, ReadonlyArray<string>, NullOrNonNullable<TOutput>>

  public static of<TInput, TError = null>(
    input: TInput,
    options?: ImpulseFormUnitOptions<TInput, TError>,
  ): ImpulseFormUnit<TInput, TError, TInput>

  public static of<TInput, TError = null, TOutput = TInput>(
    input: TInput,
    options?:
      | ImpulseFormUnitOptions<TInput, TError>
      | ImpulseFormUnitSchemaOptions<TInput, TOutput>
      | ImpulseFormUnitValidatedOptions<TInput, TError, TOutput>,
  ):
    | ImpulseFormUnit<TInput, TError>
    | ImpulseFormUnit<TInput, ReadonlyArray<string>, TOutput>
    | ImpulseFormUnit<TInput, TError, TOutput> /* enforce syntax highlight */ {
    const touched = options?.touched ?? false

    const isInputEqual = options?.isInputEqual ?? isStrictEqual
    const isInputDirty =
      options?.isInputDirty ??
      ((left, right, scope) => !isInputEqual(left, right, scope))

    const isExplicitInitial = hasProperty(options, "initial")
    const initial = isExplicitInitial ? options.initial! : input
    const inputOrInitial = untrack((scope) => {
      return isInputEqual(initial, input, scope) ? initial : input
    })

    if (hasProperty(options, "schema")) {
      return new ImpulseFormUnit<TInput, ReadonlyArray<string>, TOutput>(
        null,
        Impulse(),
        Impulse(touched),
        Impulse(options.validateOn ?? VALIDATE_ON_TOUCH),
        Impulse(options.error ?? null, {
          compare: createErrorImpulseCompare(isShallowArrayEqual),
        }),
        Impulse(isExplicitInitial),
        Impulse(initial, { compare: isInputEqual }),
        Impulse(inputOrInitial, { compare: isInputEqual }),
        Impulse<
          | undefined
          | {
              _validate: ImpulseFormUnitValidator<
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
      return new ImpulseFormUnit<TInput, TError, TOutput>(
        null,
        Impulse(),
        Impulse(touched),
        Impulse(options.validateOn ?? VALIDATE_ON_TOUCH),
        Impulse<null | TError>(options.error ?? null, {
          compare: createErrorImpulseCompare(
            options.isErrorEqual ?? isStrictEqual,
          ),
        }),
        Impulse(isExplicitInitial),
        Impulse(initial, { compare: isInputEqual }),
        Impulse(inputOrInitial, { compare: isInputEqual }),
        Impulse<
          | undefined
          | {
              _validate: ImpulseFormUnitValidator<TInput, TError, TOutput>
            }
        >({ _validate: options.validate }),
        isInputEqual,
        isInputDirty,
      )
    }

    return new ImpulseFormUnit<TInput, TError>(
      null,
      Impulse(),
      Impulse(touched),
      Impulse<ValidateStrategy>(VALIDATE_ON_TOUCH),
      Impulse<null | TError>(options?.error ?? null),
      Impulse(isExplicitInitial),
      Impulse(initial, { compare: isInputEqual }),
      Impulse(inputOrInitial, { compare: isInputEqual }),
      Impulse(),
      isInputEqual,
      isInputDirty,
    )
  }

  private readonly _onFocus = new Emitter<[error: TError]>()

  private readonly _validated = Impulse(false)

  protected constructor(
    root: null | ImpulseForm,
    private readonly _initialSource: Impulse<
      undefined | ImpulseFormUnit<TInput, TError, TOutput>
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
          _validate: ImpulseFormUnitValidator<TInput, TError, TOutput>
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
    const error = this._onFocus._isEmpty()
      ? null
      : untrack((scope) => this.getError(scope))

    if (error == null) {
      return null
    }

    return () => {
      this._onFocus._emit(error)
    }
  }

  // TODO add tests against _validated when cloning
  protected _childOf(
    parent: null | ImpulseForm,
  ): ImpulseFormUnit<TInput, TError, TOutput> {
    return new ImpulseFormUnit(
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
    initial: undefined | ImpulseFormUnit<TInput, TError, TOutput>,
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

  public getError(scope: Scope): null | TError
  public getError<TResult>(
    scope: Scope,
    select: (concise: null | TError, verbose: null | TError) => TResult,
  ): TResult
  public getError<TResult = null | TError>(
    scope: Scope,
    select: (
      concise: null | TError,
      verbose: null | TError,
    ) => TResult = params._first as typeof select,
  ): TResult {
    const [error] = this._validate(scope)

    return select(error, error)
  }

  public setError(setter: ImpulseFormUnitErrorsSetter<TError>): void {
    this._errors.setValue((error) => resolveSetter(setter, error))
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

  public setValidateOn(setter: ImpulseFormUnitValidateOnSetter): void {
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

  public setTouched(touched: ImpulseFormUnitFlagSetter): void {
    batch(() => {
      this._touched.setValue(touched)
      this._updateValidated()
    })
  }

  public setValidator(
    validator: ImpulseFormUnitValidator<TInput, TError, TOutput>,
  ): void {
    this._validator.setValue({ _validate: validator })
  }

  public setSchema(
    schema: TError extends ReadonlyArray<string>
      ? ZodLikeSchema<TOutput>
      : never,
  ): void {
    this.setValidator((_input) => {
      return zodLikeParse(schema, _input) as Result<TError, TOutput>
    })
  }

  public reset(
    resetter: ImpulseFormUnitInputSetter<TInput> = params._first,
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
  public setInput(setter: ImpulseFormUnitInputSetter<TInput>): void {
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
  public setInitial(setter: ImpulseFormUnitInputSetter<TInput>): void {
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

  public onFocusWhenInvalid(onFocus: (error: TError) => void): VoidFunction {
    return this._onFocus._subscribe(onFocus)
  }
}
