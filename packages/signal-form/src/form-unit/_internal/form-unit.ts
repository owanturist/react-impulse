import { SignalForm } from "../../signal-form/_internal/signal-form"
import type { FormUnitParams } from "../form-unit-params"
import type { FormUnitTransformer } from "../form-unit-transformer"

import type { FormUnitState } from "./form-unit-state"

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
