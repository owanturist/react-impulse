import type { FormShapeFields } from "./form-shape-fields"
import type { GetFormShapeParam } from "./get-form-shape-param"

type FormShapeFlag<TFields extends FormShapeFields> =
  | boolean
  | GetFormShapeParam<TFields, "flag.schema">

export type { FormShapeFlag }
