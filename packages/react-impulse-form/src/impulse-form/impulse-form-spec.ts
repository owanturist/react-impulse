import type { Option } from "~/tools/option"

import type { Compare } from "../dependencies"

import type { ImpulseForm } from "./impulse-form"
import type { ImpulseFormParams } from "./impulse-form-params"

export interface ImpulseFormSpecPatch<TParams extends ImpulseFormParams> {
  _input: Option<TParams["input.setter"]>
  _initial: Option<TParams["input.setter"]>
  _error: Option<TParams["error.setter"]>
}

export interface ImpulseFormSpec<
  TParams extends ImpulseFormParams = ImpulseFormParams,
> {
  _isOutputEqual: Compare<null | TParams["output.schema"]>

  _initial: TParams["input.schema"]

  _input: TParams["input.schema"]

  _error: TParams["error.schema.verbose"]

  _override(patch: ImpulseFormSpecPatch<TParams>): ImpulseFormSpec<TParams>

  _create(): ImpulseForm<TParams>
}
