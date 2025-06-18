import type { ReadonlyImpulse } from "../dependencies"

import type { ImpulseFormParams } from "./impulse-form-params"

export interface ImpulseFormState<TParams extends ImpulseFormParams> {
  readonly _initial: ReadonlyImpulse<TParams["input.schema"]>
  _setInitial(setter: TParams["input.setter"]): void

  readonly _input: ReadonlyImpulse<TParams["input.schema"]>
  _setInput(setter: TParams["input.setter"]): void

  readonly _error: ReadonlyImpulse<null | TParams["error.schema"]>
  readonly _errorVerbose: ReadonlyImpulse<TParams["error.schema.verbose"]>
  _setError(setter: TParams["error.setter"]): void

  readonly _validateOn: ReadonlyImpulse<TParams["validateOn.schema"]>
  readonly _validateOnVerbose: ReadonlyImpulse<
    TParams["validateOn.schema.verbose"]
  >
  _setValidateOn(setter: TParams["validateOn.setter"]): void

  readonly _touched: ReadonlyImpulse<TParams["flag.schema"]>
  readonly _touchedVerbose: ReadonlyImpulse<TParams["flag.schema.verbose"]>
  _setTouched(setter: TParams["flag.setter"]): void

  readonly _output: ReadonlyImpulse<null | TParams["output.schema"]>
  readonly _outputVerbose: ReadonlyImpulse<TParams["output.schema.verbose"]>

  readonly _valid: ReadonlyImpulse<TParams["flag.schema"]>
  readonly _validVerbose: ReadonlyImpulse<TParams["flag.schema.verbose"]>

  readonly _invalid: ReadonlyImpulse<TParams["flag.schema"]>
  readonly _invalidVerbose: ReadonlyImpulse<TParams["flag.schema.verbose"]>

  readonly _validated: ReadonlyImpulse<TParams["flag.schema"]>
  readonly _validatedVerbose: ReadonlyImpulse<TParams["flag.schema.verbose"]>

  readonly _dirty: ReadonlyImpulse<TParams["flag.schema"]>
  readonly _dirtyVerbose: ReadonlyImpulse<TParams["flag.schema.verbose"]>
}
