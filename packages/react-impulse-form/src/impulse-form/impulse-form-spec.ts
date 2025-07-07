import type { Lazy } from "~/tools/lazy"
import type { Option } from "~/tools/option"

import type { ImpulseForm } from "./impulse-form"
import type { ImpulseFormParams } from "./impulse-form-params"
import type { ImpulseFormState } from "./impulse-form-state"

export interface ImpulseFormSpecPatch<TParams extends ImpulseFormParams> {
  readonly _initial: Option<TParams["input.setter"]>
  readonly _input: Option<TParams["input.setter"]>
  readonly _error: Option<TParams["error.setter"]>
  readonly _validateOn: Option<TParams["validateOn.setter"]>
  readonly _touched: Option<TParams["flag.setter"]>
}

export interface ImpulseFormSpec<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TParams extends ImpulseFormParams = any,
> {
  readonly _initial: TParams["input.schema"]

  readonly _input: TParams["input.schema"]

  readonly _error: TParams["error.schema.verbose"]

  readonly _validateOn: TParams["validateOn.schema.verbose"]

  readonly _touched: TParams["flag.schema.verbose"]

  _override(patch: ImpulseFormSpecPatch<TParams>): ImpulseFormSpec<TParams>

  _create(parent?: Lazy<ImpulseFormState>): ImpulseForm<TParams>
}
