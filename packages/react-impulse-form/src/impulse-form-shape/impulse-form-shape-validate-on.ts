import type { ValidateStrategy } from "../validate-strategy"

import type { GetFormShapeParam } from "./get-impulse-form-shape-param"
import type { FormShapeFields } from "./impulse-form-shape-fields"

type FormShapeValidateOn<TFields extends FormShapeFields> =
  | ValidateStrategy
  | GetFormShapeParam<TFields, "validateOn.schema">

export type { FormShapeValidateOn }
