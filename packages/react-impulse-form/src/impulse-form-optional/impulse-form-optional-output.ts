import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

export type ImpulseFormOptionalOutput<TElement extends ImpulseForm> =
  | undefined
  | GetImpulseFormParam<TElement, "output.schema">
