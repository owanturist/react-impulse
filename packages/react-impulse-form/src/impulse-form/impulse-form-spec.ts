import type { Option } from "~/tools/option"

import type { ImpulseForm } from "./impulse-form"
import type { ImpulseFormParams } from "./impulse-form-params"

export interface ImpulseFormSpecPatch<TParams extends ImpulseFormParams> {
  _input: Option<TParams["input.setter"]>
  _initial: Option<TParams["input.setter"]>
  _error: Option<TParams["error.setter"]>
  _validateOn: Option<TParams["validateOn.setter"]>
  _touched: Option<TParams["flag.setter"]>
}

export interface ImpulseFormSpec<
  TParams extends ImpulseFormParams = ImpulseFormParams,
> {
  _initial: TParams["input.schema"]

  _input: TParams["input.schema"]

  _error: TParams["error.schema.verbose"]

  _validateOn: TParams["validateOn.schema.verbose"]

  _touched: TParams["flag.schema.verbose"]

  _override(patch: ImpulseFormSpecPatch<TParams>): ImpulseFormSpec<TParams>

  _create(): ImpulseForm<TParams>
}
