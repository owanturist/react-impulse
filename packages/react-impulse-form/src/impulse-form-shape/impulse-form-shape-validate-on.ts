import type { ValidateStrategy } from "../validate-strategy"

import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

type ImpulseFormShapeValidateOn<TFields extends ImpulseFormShapeFields> =
  | ValidateStrategy
  | GetImpulseFormShapeParam<TFields, "validateOn.schema">

export type { ImpulseFormShapeValidateOn }
