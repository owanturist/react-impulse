import type { GetImpulseFormShapeParam } from "./get-impulse-form-shape-param"
import type { ImpulseFormShapeFields } from "./impulse-form-shape-fields"

export { isShallowObjectEqual as isImpulseFormShapeFlagVerboseEqual } from "~/tools/is-shallow-object-equal"

export type ImpulseFormShapeFlagVerbose<
  TFields extends ImpulseFormShapeFields,
> = GetImpulseFormShapeParam<TFields, "flag.schema.verbose">
