import type { Impulse, ReadonlyImpulse } from "../dependencies"

import type { ImpulseFormParams } from "./impulse-form-params"

export interface ImpulseFormState<TParams extends ImpulseFormParams> {
  readonly _output: ReadonlyImpulse<null | TParams["output.schema"]>
  readonly _outputVerbose: ReadonlyImpulse<TParams["output.schema.verbose"]>

  readonly _initial: Impulse<TParams["input.schema"]>

  readonly _input: Impulse<TParams["input.schema"]>

  _resolveInputSetter(
    setter: TParams["input.setter"],
    current: TParams["input.schema"],
    additional: TParams["input.schema"],
  ): TParams["input.schema"]

  readonly _error: ReadonlyImpulse<null | TParams["error.schema"]>
  readonly _errorVerbose: Impulse<TParams["error.schema.verbose"]>

  _resolveErrorSetter(
    setter: TParams["error.setter"],
    current: TParams["error.schema.verbose"],
  ): TParams["error.schema.verbose"]

  readonly _validateOn: ReadonlyImpulse<TParams["validateOn.schema"]>
  readonly _validateOnVerbose: Impulse<TParams["validateOn.schema.verbose"]>

  _resolveValidateOnSetter(
    setter: TParams["validateOn.setter"],
    current: TParams["validateOn.schema.verbose"],
  ): TParams["validateOn.schema.verbose"]

  readonly _valid: ReadonlyImpulse<TParams["flag.schema"]>
  readonly _validVerbose: ReadonlyImpulse<TParams["flag.schema.verbose"]>

  readonly _invalid: ReadonlyImpulse<TParams["flag.schema"]>
  readonly _invalidVerbose: ReadonlyImpulse<TParams["flag.schema.verbose"]>

  readonly _validated: ReadonlyImpulse<TParams["flag.schema"]>
  readonly _validatedVerbose: ReadonlyImpulse<TParams["flag.schema.verbose"]>

  readonly _dirty: ReadonlyImpulse<TParams["flag.schema"]>
  readonly _dirtyVerbose: ReadonlyImpulse<TParams["flag.schema.verbose"]>

  readonly _touched: ReadonlyImpulse<TParams["flag.schema"]>
  readonly _touchedVerbose: Impulse<TParams["flag.schema.verbose"]>

  _resolveFlagSetter(
    setter: TParams["flag.setter"],
    current: TParams["flag.schema.verbose"],
  ): TParams["flag.schema.verbose"]
}
