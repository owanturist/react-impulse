import { isFunction } from "~/tools/is-function"
import { isNull } from "~/tools/is-null"
import { isStrictEqual } from "~/tools/is-strict-equal"
import { None, type Option, Some } from "~/tools/option"
import { params } from "~/tools/params"
import { resolveSetter } from "~/tools/setter"

import { type Compare, Impulse, type Scope, batch } from "../dependencies"
import { ImpulseForm } from "../impulse-form"
import type { Result } from "../result"
import {
  VALIDATE_ON_CHANGE,
  VALIDATE_ON_INIT,
  VALIDATE_ON_SUBMIT,
  VALIDATE_ON_TOUCH,
  type ValidateStrategy,
} from "../validate-strategy"
import { type ZodLikeSchema, zodLikeParse } from "../zod-like-schema"

import {
  type ImpulseFormUnitTransform,
  transformFromTransformer,
  transformFromValidator,
} from "./_impulse-form-unit-transform"
import type { ImpulseFormUnitErrorSetter } from "./impulse-form-unit-error-setter"
import type { ImpulseFormUnitFlagSetter } from "./impulse-form-unit-flag-setter"
import type { ImpulseFormUnitInputSetter } from "./impulse-form-unit-input-setter"
import type { ImpulseFormUnitTransformer } from "./impulse-form-unit-transformer"
import type { ImpulseFormUnitValidateOnSetter } from "./impulse-form-unit-validate-on-setter"
import type { ImpulseFormUnitValidator } from "./impulse-form-unit-validator"

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

  "error.setter": ImpulseFormUnitErrorSetter<TError>
  "error.schema": null | TError
  "error.schema.verbose": null | TError
}> {
  private readonly _validated = Impulse(false)

  public constructor(
    root: null | ImpulseForm,
    private readonly _spec: ImpulseFormUnitSpec<TInput, TError, TOutput>,
    private readonly _input: Impulse<TInput>,
    private readonly _transform: Impulse<
      undefined | ImpulseFormUnitTransform<TInput, TError, TOutput>
    >,
  ) {
    super(root)
    this._updateValidated()
  }

  private _updateValidated(override = false): void {
    this._validated.setValue((isValidated, scope) => {
      if (!override && isValidated) {
        return true
      }

      const transformer = this._transform.getValue(scope)

      if (!transformer || transformer._transformer) {
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
    const customError = this._error.getValue(scope)._getOrElse(null)

    if (!isNull(customError)) {
      return [customError, null]
    }

    const input = this.getInput(scope)
    const transform = this._transform.getValue(scope)

    if (!transform) {
      return [null, input as unknown as TOutput]
    }

    const [error, output] = transform._validator(this.getInput(scope))

    if (isNull(error)) {
      return [null, output]
    }

    if (this._validated.getValue(scope)) {
      return [error, null]
    }

    return [null, null]
  }

  // TODO add tests against _validated when cloning
  protected _childOf(
    parent: null | ImpulseForm,
  ): ImpulseFormUnit<TInput, TError, TOutput> {
    return new ImpulseFormUnit(
      parent,
      this._spec._clone(),
      this._touched.clone(),
      this._error.clone(),
      this._input.clone(),
      this._transform.clone(),
      this._isInputEqual,
      this._isInputDirty,
    )
  }

  protected _setInitial(
    initial: undefined | ImpulseFormUnit<TInput, TError, TOutput>,
    isRoot: boolean,
  ): void {}

  protected _setValidated(isValidated: boolean): void {
    this._validated.setValue(isValidated)
  }

  protected _isDirty<TResult>(
    scope: Scope,
    select: (concise: boolean, verbose: boolean, dirty: boolean) => TResult,
  ): TResult {
    const initial = this.getInitial(scope)
    const input = this.getInput(scope)
    const dirty = this._spec._isInputDirty._getOrElse(isStrictEqual)(
      initial,
      input,
      scope,
    )

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

  public setError(setter: ImpulseFormUnitErrorSetter<TError>): void {
    this._error.setValue((error) => {
      const nextError = resolveSetter(setter, error._getOrElse(null))

      return isNull(nextError) ? None : new Some(nextError)
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
      this._validated.getValue(scope) || !isNull(this._error.getValue(scope))

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
    this._transform.setValue(transformFromValidator(validator))
  }

  public setTransform(
    transformer: ImpulseFormUnitTransformer<TInput, TOutput>,
  ): void {
    batch(() => {
      this._transform.setValue(transformFromTransformer(transformer))
      this._updateValidated()
    })
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

  public reset(): void {
    batch((scope) => {
      this._input.setValue(this.getInitial(scope))
      this._touched.setValue(this._spec._touched._getOrElse(false))
      this._error.setValue(this._spec._error)
      this._validateOn.setValue(
        this._spec._validateOn._getOrElse(VALIDATE_ON_TOUCH),
      )
      this._validator.setValue(this._spec._validator)

      this._updateValidated(true)
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
    return this._spec._initial._getOrElse(this._input.getValue(scope))
  }
}
