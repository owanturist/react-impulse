import type { Monitor } from "@owanturist/signal"

import { ImpulseForm } from "../../impulse-form/_internal/impulse-form"
import type { ImpulseFormOptionalParams } from "../impulse-form-optional-params"

import type { ImpulseFormOptionalState } from "./impulse-form-optional-state"

class ImpulseFormOptional<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> extends ImpulseForm<ImpulseFormOptionalParams<TEnabled, TElement>> {
  public static override _getState = ImpulseForm._getState

  public readonly enabled: TEnabled
  public readonly element: TElement

  public constructor(public readonly _state: ImpulseFormOptionalState<TEnabled, TElement>) {
    super()

    this.enabled = _state._enabled._host() as TEnabled
    this.element = _state._element._host() as TElement
  }

  public getEnabledElement(monitor: Monitor): undefined | TElement {
    return this._state._getEnabledElement(monitor)?._host() as undefined | TElement
  }
}

export { ImpulseFormOptional }
