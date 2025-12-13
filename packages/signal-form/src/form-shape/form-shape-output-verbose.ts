import type { FormShapeFields } from "./form-shape-fields"
import type { GetFormShapeParam } from "./get-form-shape-param"

type FormShapeOutputVerbose<TFields extends FormShapeFields> = GetFormShapeParam<
  TFields,
  "output.schema.verbose"
>

export type { FormShapeOutputVerbose }
