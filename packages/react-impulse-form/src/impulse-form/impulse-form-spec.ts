import type { Compare } from "../dependencies"

import type { ImpulseForm } from "./impulse-form"
import type { ImpulseFormParams } from "./impulse-form-params"

export interface ImpulseFormSpec<TParams extends ImpulseFormParams> {
  _isOutputEqual: Compare<null | TParams["output.schema"]>

  _outputFromVerbose(
    verbose: TParams["output.schema.verbose"],
  ): null | TParams["output.schema"]

  /**
   *
   * @param setter
   * @param first when setting the input: the first() returns the current input value; when setting the initial: the first() returns the current initial value
   * @param second when setting the input: the second() returns the current initial value; when setting the initial: the second() returns the current input value
   */
  _inputFromSetter(
    setter: TParams["input.setter"],
    first: () => TParams["input.schema"],
    second: () => TParams["input.schema"],
  ): TParams["input.schema"]

  _create(): ImpulseForm<TParams>
}
