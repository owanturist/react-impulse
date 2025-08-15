import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalVerboseParam } from "./impulse-form-optional-verbose-param"

export type ImpulseFormOptionalFlagVerbose<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalVerboseParam<TEnabled, TElement, "flag.schema.verbose">
