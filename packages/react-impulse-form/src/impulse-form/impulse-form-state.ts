import { Impulse, type ReadonlyImpulse } from "../dependencies"

import type { ImpulseFormParams } from "./impulse-form-params"
import type { ImpulseFormSpec } from "./impulse-form-spec"

export abstract class ImpulseFormState<TParams extends ImpulseFormParams> {
  public abstract readonly _outputVerbose: ReadonlyImpulse<
    TParams["output.schema.verbose"]
  >

  public readonly _output = Impulse(
    (scope) => {
      const verbose = this._outputVerbose.getValue(scope)

      return this._outputFromVerbose(verbose)
    },
    {
      compare: this._spec._isOutputEqual,
    },
  )

  public abstract readonly _initial: Impulse<TParams["input.schema"]>

  public abstract readonly _input: Impulse<TParams["input.schema"]>

  public abstract readonly _error: Impulse<TParams["error.schema.verbose"]>

  public constructor(protected readonly _spec: ImpulseFormSpec<TParams>) {}

  protected abstract _outputFromVerbose(
    verbose: TParams["output.schema.verbose"],
  ): null | TParams["output.schema"]

  public abstract _resolveInputSetter(
    setter: TParams["input.setter"],
    main: TParams["input.schema"],
    additional: TParams["input.schema"],
  ): TParams["input.schema"]
}
