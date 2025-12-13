import type { GetFormShapeParam } from "./get-impulse-form-shape-param"
import type { FormShapeFields } from "./impulse-form-shape-fields"

type FormShapeValidateOnVerbose<TFields extends FormShapeFields> = GetFormShapeParam<
  TFields,
  "validateOn.schema.verbose"
>

export type { FormShapeValidateOnVerbose }
