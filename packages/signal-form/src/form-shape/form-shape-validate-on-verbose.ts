import type { FormShapeFields } from "./form-shape-fields"
import type { GetFormShapeParam } from "./get-form-shape-param"

type FormShapeValidateOnVerbose<TFields extends FormShapeFields> = GetFormShapeParam<
  TFields,
  "validateOn.schema.verbose"
>

export type { FormShapeValidateOnVerbose }
