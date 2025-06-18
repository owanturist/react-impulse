import type { Impulse, ReadonlyImpulse } from "../dependencies"

import type { ImpulseFormParams } from "./impulse-form-params"

export abstract class ImpulseFormState<TParams extends ImpulseFormParams> {
  public abstract readonly _output: ReadonlyImpulse<
    null | TParams["output.schema"]
  >
  public abstract readonly _outputVerbose: ReadonlyImpulse<
    TParams["output.schema.verbose"]
  >

  public abstract readonly _initial: Impulse<TParams["input.schema"]>

  public abstract readonly _input: Impulse<TParams["input.schema"]>

  public abstract readonly _error: Impulse<TParams["error.schema.verbose"]>

  public abstract _resolveInputSetter(
    setter: TParams["input.setter"],
    main: TParams["input.schema"],
    additional: TParams["input.schema"],
  ): TParams["input.schema"]
}
