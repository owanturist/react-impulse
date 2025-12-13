import type { GetFormShapeParam } from "./get-impulse-form-shape-param"
import type { FormShapeFields } from "./impulse-form-shape-fields"

type FormShapeInput<TFields extends FormShapeFields> = GetFormShapeParam<TFields, "input.schema">

export type { FormShapeInput }
