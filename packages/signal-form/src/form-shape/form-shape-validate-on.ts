import type { ValidateStrategy } from "../validate-strategy"

import type { FormShapeFields } from "./form-shape-fields"
import type { GetFormShapeParam } from "./get-form-shape-param"

type FormShapeValidateOn<TFields extends FormShapeFields> =
  | ValidateStrategy
  | GetFormShapeParam<TFields, "validateOn.schema">

export type { FormShapeValidateOn }
