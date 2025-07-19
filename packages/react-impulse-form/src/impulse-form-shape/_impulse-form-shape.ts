import { Lazy } from "~/tools/lazy"
import { mapValues } from "~/tools/map-values"

import { Impulse } from "../dependencies"
import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import type { ImpulseFormShapeSpec } from "./_impulse-form-shape-spec"
import { ImpulseFormShapeState } from "./_impulse-form-shape-state"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export class ImpulseFormShape<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseForm<ImpulseFormShapeParams<TFields>> {
  public readonly fields: TFields

  public readonly _state: Lazy<ImpulseFormShapeState<TFields>>

  public constructor(
    root: null | ImpulseForm,
    public readonly _spec: ImpulseFormShapeSpec<TFields>,
  ) {
    super(root)

    this.fields = mapValues(_spec._fields, (field, key) => {
      return field._childOf(
        this,
        Impulse(
          (scope) => _spec._initial.getValue(scope)[key],
          (initial) => {
            _spec._initial.setValue((fieldsInitial) => ({
              ...fieldsInitial,
              [key]: initial,
            }))
          },
        ),
      )
    })

    this._state = Lazy(() => {
      return new ImpulseFormShapeState(
        mapValues(this.fields, ({ _state }) => _state._peek()),
        _spec._constants,
      )
    })
  }
}
