import { Lazy } from "~/tools/lazy"
import { mapValues } from "~/tools/map-values"

import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import type { ImpulseFormShapeState } from "./_impulse-form-shape-state"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export class ImpulseFormShape<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseForm<ImpulseFormShapeParams<TFields>> {
  private readonly _fields: Lazy<TFields>

  public constructor(public readonly _state: ImpulseFormShapeState<TFields>) {
    super()

    this._fields = Lazy(() => ({
      ...mapValues(this._state._forms, (field) => field._wrap()),
      ...this._state._meta,
    }))
  }

  public get fields(): Readonly<TFields> {
    return this._fields()
  }
}
