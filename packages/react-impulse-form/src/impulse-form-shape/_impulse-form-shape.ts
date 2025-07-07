import type { Lazy } from "~/tools/lazy"

import type { Impulse } from "../dependencies"
import { ImpulseForm } from "../impulse-form"
import type { ImpulseFormSpec } from "../impulse-form/impulse-form-spec"

import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import type { ImpulseFormShapeState } from "./_impulse-form-shape-state"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export class ImpulseFormShape<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseForm<ImpulseFormShapeParams<TFields>> {
  public constructor(
    public readonly _spec: Impulse<
      ImpulseFormSpec<ImpulseFormShapeParams<TFields>>
    >,
    public readonly _state: Lazy<ImpulseFormShapeState<TFields>>,
    public readonly fields: TFields,
  ) {
    super()
  }
}
