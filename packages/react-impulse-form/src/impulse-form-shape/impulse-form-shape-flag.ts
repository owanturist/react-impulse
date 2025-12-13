import type { GetFormShapeParam } from "./get-impulse-form-shape-param"
import type { FormShapeFields } from "./impulse-form-shape-fields"

type FormShapeFlag<TFields extends FormShapeFields> =
  | boolean
  | GetFormShapeParam<TFields, "flag.schema">

export type { FormShapeFlag }
