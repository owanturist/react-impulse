import type { Lazy } from "~/tools/lazy"

import { Impulse, type Scope, batch } from "../dependencies"

import type { ImpulseFormParams } from "./impulse-form-params"
import type { ImpulseFormSpec } from "./impulse-form-spec"
import type { ImpulseFormState } from "./impulse-form-state"

export abstract class ImpulseForm<
  TParams extends ImpulseFormParams = ImpulseFormParams,
> {
  // necessary for type inference
  protected readonly _params?: TParams

  private readonly _output = Impulse(
    (scope) => {
      const verbose = this._state()._output.getValue(scope)

      return this._spec._outputFromVerbose(verbose)
    },
    {
      compare: this._spec._isOutputEqual,
    },
  )

  protected constructor(
    private readonly _spec: ImpulseFormSpec<TParams>,
    private readonly _state: Lazy<ImpulseFormState<TParams>>,
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
    const output = this._output.getValue(scope)

    if (select) {
      const verbose = this._state()._output.getValue(scope)

      return select(output, verbose)
    }

    return output
  }

  public getInitial(scope: Scope): TParams["input.schema"] {
    return this._state()._initial.getValue(scope)
  }

  public setInitial(setter: TParams["input.setter"]): void {
    batch((scope) => {
      const initial = this._spec._resolveInputSetter(
        setter,
        () => this.getInitial(scope),
        () => this.getInput(scope),
      )

      this._state()._initial.setValue(initial)
    })
  }

  public getInput(scope: Scope): TParams["input.schema"] {
    return this._state()._input.getValue(scope)
  }

  public setInput(setter: TParams["input.setter"]): void {
    batch((scope) => {
      const input = this._spec._resolveInputSetter(
        setter,
        () => this.getInput(scope),
        () => this.getInitial(scope),
      )

      this._state()._input.setValue(input)
    })
  }
}
