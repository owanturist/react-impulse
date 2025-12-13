import type { GetFormShapeParam } from "./get-impulse-form-shape-param"
import type { FormShapeFields } from "./impulse-form-shape-fields"

type FormShapeError<TFields extends FormShapeFields> = null | GetFormShapeParam<
  TFields,
  "error.schema"
>

export type { FormShapeError }
