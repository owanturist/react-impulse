import type { Scope } from "../dependencies"
import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormOptionalParams } from "./_impulse-form-optional-params"
import type { ImpulseFormOptionalState } from "./_impulse-form-optional-state"

export class ImpulseFormOptional<
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

  public getEnabledElement(scope: Scope): undefined | TElement {
    return this._state._getEnabledElement(scope)?._host() as undefined | TElement
  }
}
