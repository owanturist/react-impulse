import type { ImpulseFormState } from "../impulse-form/impulse-form-state"
import type { ImpulseFormShapeParams } from "./_impulse-form-shape-params"

import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export class ImpulseFormShapeState<
  TFields extends ImpulseFormShapeFields = ImpulseFormShapeFields,
> implements ImpulseFormState<ImpulseFormShapeParams<TFields>> {}
