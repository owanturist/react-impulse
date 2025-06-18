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
}
