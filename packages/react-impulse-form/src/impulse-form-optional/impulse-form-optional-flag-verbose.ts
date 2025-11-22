import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalParam } from "./_internal/impulse-form-optional-param"

type ImpulseFormOptionalFlagVerbose<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalParam<TEnabled, TElement, "flag.schema.verbose">

export type { ImpulseFormOptionalFlagVerbose }
