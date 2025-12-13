import type { Monitor } from "@owanturist/signal"

import { SignalForm } from "../../impulse-form/_internal/impulse-form"
import type { FormOptionalParams } from "../impulse-form-optional-params"

import type { FormOptionalState } from "./impulse-form-optional-state"

class FormOptional<TEnabled extends SignalForm, TElement extends SignalForm> extends SignalForm<
  FormOptionalParams<TEnabled, TElement>
> {
  public static override _getState = SignalForm._getState

  public readonly enabled: TEnabled
  public readonly element: TElement

  public constructor(public readonly _state: FormOptionalState<TEnabled, TElement>) {
    super()

    this.enabled = _state._enabled._host() as TEnabled
    this.element = _state._element._host() as TElement
  }

  public getEnabledElement(monitor: Monitor): undefined | TElement {
    return this._state._getEnabledElement(monitor)?._host() as undefined | TElement
  }
}

export { FormOptional }
