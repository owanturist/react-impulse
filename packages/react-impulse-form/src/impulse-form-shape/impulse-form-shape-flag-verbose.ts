import type { GetFormShapeParam } from "./get-impulse-form-shape-param"
import type { FormShapeFields } from "./impulse-form-shape-fields"

type FormShapeFlagVerbose<TFields extends FormShapeFields> = GetFormShapeParam<
  TFields,
  "flag.schema.verbose"
>

export type { FormShapeFlagVerbose }
