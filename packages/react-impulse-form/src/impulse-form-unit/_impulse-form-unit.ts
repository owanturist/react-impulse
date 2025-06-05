import type { Lazy } from "~/tools/lazy"

import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormUnitParams } from "./_impulse-form-unit-params"
import type { ImpulseFormUnitSpec } from "./_impulse-form-unit-spec"
import type { ImpulseFormUnitState } from "./_impulse-form-unit-state"

export class ImpulseFormUnit<
  TInput,
  TError = null,
  TOutput = TInput,
> extends ImpulseForm<ImpulseFormUnitParams<TInput, TError, TOutput>> {
  public constructor(
    spec: ImpulseFormUnitSpec<TInput, TError, TOutput>,
    state: Lazy<ImpulseFormUnitState<TInput, TError, TOutput>>,
  ) {
    super(spec, state)
  }
}
