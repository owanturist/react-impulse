import type { Scope } from "../dependencies"

import type { ImpulseFormParams } from "./impulse-form-params"
import type { ImpulseFormSpec } from "./impulse-form-spec"
import type { ImpulseFormState } from "./impulse-form-state"

export abstract class ImpulseForm<
  TParams extends ImpulseFormParams = ImpulseFormParams,
> {
  // necessary for type inference
  protected readonly _params?: TParams

  protected constructor(
    private readonly _spec: ImpulseFormSpec<TParams>,
    // TODO make it private/protected AND make it Lazy
    public readonly _state: ImpulseFormState<TParams>,
  ) {}

  public getOutput(scope: Scope): null | TParams["output.schema"]
  public getOutput<TResult>(
    scope: Scope,
    select: (
      concise: null | TParams["output.schema"],
      verbose: TParams["output.schema.verbose"],
    ) => TResult,
  ): TResult
  public getOutput<TResult>(
    scope: Scope,
    select?: (
      concise: null | TParams["output.schema"],
      verbose: TParams["output.schema.verbose"],
    ) => TResult,
  ): null | TParams["output.schema"] | TResult {
    const { _output, _outputVerbose } = this._state
    const output = _output.getValue(scope)

    if (!select) {
      return output
    }

    const verbose = _outputVerbose.getValue(scope)

    return select(output, verbose)
  }

  public getInitial(scope: Scope): TParams["input.schema"] {
    return this._state._initial.getValue(scope)
  }

  public setInitial(setter: TParams["input.setter"]): void {
    this._state._initial.setValue((initial, scope) => {
      return this._state._resolveInputSetter(
        setter,
        initial,
        this.getInput(scope),
      )
    })
  }

  public getInput(scope: Scope): TParams["input.schema"] {
    return this._state._input.getValue(scope)
  }

  public setInput(setter: TParams["input.setter"]): void {
    this._state._input.setValue((input, scope) => {
      return this._state._resolveInputSetter(
        setter,
        input,
        this.getInitial(scope),
      )
    })
  }

  public getError(scope: Scope): null | TParams["error.schema"]
  public getError<TResult>(
    scope: Scope,
    select: (
      concise: null | TParams["error.schema"],
      verbose: TParams["error.schema.verbose"],
    ) => TResult,
  ): TResult
  public getError<TResult>(
    scope: Scope,
    select?: (
      concise: null | TParams["error.schema"],
      verbose: TParams["error.schema.verbose"],
    ) => TResult,
  ): null | TParams["error.schema"] | TResult {
    const { _error, _errorVerbose } = this._state
    const error = _error.getValue(scope)

    if (!select) {
      return error
    }

    const verbose = _errorVerbose.getValue(scope)

    return select(error, verbose)
  }

  public setError(setter: TParams["error.setter"]): void {
    this._state._errorVerbose.setValue((error) => {
      return this._state._resolveErrorSetter(setter, error)
    })
  }

  public getValidateOn(scope: Scope): TParams["validateOn.schema"]
  public getValidateOn<TResult>(
    scope: Scope,
    select: (
      concise: TParams["validateOn.schema"],
      verbose: TParams["validateOn.schema.verbose"],
    ) => TResult,
  ): TResult
  public getValidateOn<TResult>(
    scope: Scope,
    select?: (
      concise: TParams["validateOn.schema"],
      verbose: TParams["validateOn.schema.verbose"],
    ) => TResult,
  ): TParams["validateOn.schema"] | TResult {
    const { _validateOn, _validateOnVerbose } = this._state
    const validateOn = _validateOn.getValue(scope)

    if (!select) {
      return validateOn
    }

    const verbose = _validateOnVerbose.getValue(scope)

    return select(validateOn, verbose)
  }

  public setValidateOn(setter: TParams["validateOn.setter"]): void {
    this._state._validateOnVerbose.setValue((validateOn) => {
      return this._state._resolveValidateOnSetter(setter, validateOn)
    })
  }

  public isValid(scope: Scope): boolean
  public isValid<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult
  public isValid<TResult>(
    scope: Scope,
    select?: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): boolean | TResult {
    const { _valid, _validVerbose } = this._state
    const validated = _valid.getValue(scope)

    if (!select) {
      return isTrue(validated)
    }

    const verbose = _validVerbose.getValue(scope)

    return select(validated, verbose)
  }

  public isInvalid(scope: Scope): boolean
  public isInvalid<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult
  public isInvalid<TResult>(
    scope: Scope,
    select?: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): boolean | TResult {
    const { _invalid, _invalidVerbose } = this._state
    const validated = _invalid.getValue(scope)

    if (!select) {
      return isTrue(validated)
    }

    const verbose = _invalidVerbose.getValue(scope)

    return select(validated, verbose)
  }

  public isValidated(scope: Scope): boolean
  public isValidated<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult
  public isValidated<TResult>(
    scope: Scope,
    select?: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): boolean | TResult {
    const { _validated, _validatedVerbose } = this._state
    const validated = _validated.getValue(scope)

    if (!select) {
      return isTrue(validated)
    }

    const verbose = _validatedVerbose.getValue(scope)

    return select(validated, verbose)
  }

  public isDirty(scope: Scope): boolean
  public isDirty<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult
  public isDirty<TResult>(
    scope: Scope,
    select?: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): boolean | TResult {
    const { _dirty, _dirtyVerbose } = this._state
    const dirty = _dirty.getValue(scope)

    if (!select) {
      return isTruthy(dirty)
    }

    const verbose = _dirtyVerbose.getValue(scope)

    return select(dirty, verbose)
  }

  public isTouched(scope: Scope): boolean
  public isTouched<TResult>(
    scope: Scope,
    select: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): TResult
  public isTouched<TResult>(
    scope: Scope,
    select?: (
      concise: TParams["flag.schema"],
      verbose: TParams["flag.schema.verbose"],
    ) => TResult,
  ): boolean | TResult {
    const { _touched, _touchedVerbose } = this._state
    const touched = _touched.getValue(scope)

    if (!select) {
      return isTruthy(touched)
    }

    const verbose = _touchedVerbose.getValue(scope)

    return select(touched, verbose)
  }

  public setTouched(setter: TParams["flag.setter"]): void {
    this._state._touchedVerbose.setValue((touched) => {
      return this._state._resolveFlagSetter(setter, touched)
    })
  }
}
