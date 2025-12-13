import type { GetFormShapeParam } from "./get-impulse-form-shape-param"
import type { FormShapeFields } from "./impulse-form-shape-fields"

type FormShapeOutput<TFields extends FormShapeFields> = GetFormShapeParam<TFields, "output.schema">

export type { FormShapeOutput }
