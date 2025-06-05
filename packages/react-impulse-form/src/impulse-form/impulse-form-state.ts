import type { Impulse, ReadonlyImpulse } from "../dependencies"

import type { ImpulseFormParams } from "./impulse-form-params"

export interface ImpulseFormState<TParams extends ImpulseFormParams> {
  _output: ReadonlyImpulse<TParams["output.schema.verbose"]>

  _initial: Impulse<TParams["input.schema"]>

  _input: Impulse<TParams["input.schema"]>
}
