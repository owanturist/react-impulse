import type { GetFormShapeParam } from "./get-impulse-form-shape-param"
import type { FormShapeFields } from "./impulse-form-shape-fields"

type FormShapeOutputVerbose<TFields extends FormShapeFields> = GetFormShapeParam<
  TFields,
  "output.schema.verbose"
>

export type { FormShapeOutputVerbose }
