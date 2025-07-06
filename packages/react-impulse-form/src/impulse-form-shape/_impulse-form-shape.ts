import type { Lazy } from "~/tools/lazy"

import type { Impulse } from "../dependencies"
import { ImpulseForm } from "../impulse-form"

import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"
import type { ImpulseFormShapeSpec } from "./_impulse-form-shape-spec"
import type { ImpulseFormShapeState } from "./_impulse-form-shape-state"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export class ImpulseFormShape<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> extends ImpulseForm<ImpulseFormShapeParams<TFields>> {
  public constructor(
    spec: Impulse<ImpulseFormShapeSpec<TFields>>,
    state: Lazy<ImpulseFormShapeState<TFields>>,
    public readonly fields: TFields,
  ) {
    super(spec, state)
  }
}
