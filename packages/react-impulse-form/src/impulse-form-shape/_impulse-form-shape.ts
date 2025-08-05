import { mapValues } from "~/tools/map-values"

import type { Scope } from "../dependencies"
import { ImpulseForm } from "../impulse-form"
import type { ImpulseFormMeta } from "../impulse-form-meta"

import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import type { ImpulseFormShapeState } from "./_impulse-form-shape-state"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

type ImpulseFormShapeField<TField> = TField extends ImpulseForm
  ? TField
  : ImpulseFormMeta<TField>

export class ImpulseFormShape<
  TFields extends ImpulseFormShapeFields,
> extends ImpulseForm<ImpulseFormShapeParams<TFields>> {
  public static override _getState = ImpulseForm._getState

  public readonly fields: {
    readonly [TField in keyof TFields]: ImpulseFormShapeField<TFields[TField]>
  }

  public constructor(public readonly _state: ImpulseFormShapeState<TFields>) {
    super()

    this.fields = {
      ...mapValues(this._state._fields, ({ _host }) => _host()),

      ...mapValues(
        this._state._meta,
        (field) => (scope: Scope) => field.getValue(scope),
      ),
    } as {
      readonly [TField in keyof TFields]: ImpulseFormShapeField<TFields[TField]>
    }
  }
}
