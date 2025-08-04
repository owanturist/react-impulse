import { mapValues } from "~/tools/map-values"

import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import type { ImpulseFormShapeState } from "./_impulse-form-shape-state"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export class ImpulseFormShape<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseForm<ImpulseFormShapeParams<TFields>> {
  public constructor(public readonly _state: ImpulseFormShapeState<TFields>) {
    super()
  }

  public readonly fields = {
    ...mapValues(this._state._fields, ({ _host }) => _host()),
    ...this._state._meta,
  } as Readonly<TFields>
}
