import { mapValues } from "~/tools/map-values"

import type { Scope } from "../../_internal/dependencies"
import { ImpulseForm } from "../../impulse-form/_internal/impulse-form"
import type { ImpulseFormMeta } from "../../impulse-form-meta"
import type { ImpulseFormShapeFields } from "../impulse-form-shape-fields"
import type { ImpulseFormShapeParams } from "../impulse-form-shape-params"

import type { ImpulseFormShapeState } from "./impulse-form-shape-state"

type ImpulseFormShapeField<TField> = TField extends ImpulseForm ? TField : ImpulseFormMeta<TField>

class ImpulseFormShape<TFields extends ImpulseFormShapeFields> extends ImpulseForm<
  ImpulseFormShapeParams<TFields>
> {
  public static override _getState = ImpulseForm._getState

  public readonly fields: {
    readonly [TField in keyof TFields]: ImpulseFormShapeField<TFields[TField]>
  }

  public constructor(public readonly _state: ImpulseFormShapeState<TFields>) {
    super()

    this.fields = {
      ...mapValues(_state._fields, ({ _host }) => _host()),

      ...mapValues(_state._meta, (field) => (scope: Scope) => field.getValue(scope)),
    } as {
      readonly [TField in keyof TFields]: ImpulseFormShapeField<TFields[TField]>
    }
  }
}

export { ImpulseFormShape }
