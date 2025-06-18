import { Lazy } from "~/tools/lazy"
import { mapValues } from "~/tools/map-values"

import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import type { ImpulseFormShapeSpec } from "./_impulse-form-shape-spec"
import type { ImpulseFormShapeState } from "./_impulse-form-shape-state"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export class ImpulseFormShape<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseForm<ImpulseFormShapeParams<TFields>> {
  public readonly fields: TFields

  public constructor(
    spec: ImpulseFormShapeSpec<TFields>,
    state: Lazy<ImpulseFormShapeState<TFields>>,
  ) {
    super(spec, state)

    const _fields = mapValues(spec._fields, (field, key) => {
      return field._create(
        Lazy(() => {
          const _state = state()

          return _state[key]
        }),
      )
    })

    this.fields = { ..._fields, ...spec._constants }
  }
}
