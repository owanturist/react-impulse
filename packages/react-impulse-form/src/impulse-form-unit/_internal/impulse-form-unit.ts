import { SignalForm } from "../../impulse-form/_internal/impulse-form"
import type { FormUnitParams } from "../impulse-form-unit-params"
import type { FormUnitTransformer } from "../impulse-form-unit-transformer"

import type { FormUnitState } from "./impulse-form-unit-state"

class FormUnit<TInput, TError, TOutput> extends SignalForm<
  FormUnitParams<TInput, TError, TOutput>
> {
  public constructor(public readonly _state: FormUnitState<TInput, TError, TOutput>) {
    super()
  }

  public setTransform(transformer: FormUnitTransformer<TInput, TOutput>): void {
    this._state._setTransform(transformer)
  }
}

export { FormUnit }
