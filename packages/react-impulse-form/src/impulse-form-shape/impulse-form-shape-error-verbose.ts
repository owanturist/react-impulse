import type { GetFormShapeParam } from "./get-impulse-form-shape-param"
import type { FormShapeFields } from "./impulse-form-shape-fields"

type FormShapeErrorVerbose<TFields extends FormShapeFields> = GetFormShapeParam<
  TFields,
  "error.schema.verbose"
>

export type { FormShapeErrorVerbose }
