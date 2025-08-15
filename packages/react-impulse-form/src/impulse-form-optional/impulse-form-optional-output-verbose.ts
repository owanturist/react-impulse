import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalVerboseParam } from "./impulse-form-optional-verbose-param"

export type ImpulseFormOptionalOutputVerbose<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalVerboseParam<TEnabled, TElement, "output.schema.verbose">
