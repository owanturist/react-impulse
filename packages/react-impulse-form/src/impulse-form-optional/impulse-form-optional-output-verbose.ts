import type { ImpulseForm } from "../impulse-form"

import type { ImpulseFormOptionalParam } from "./_internal/impulse-form-optional-param"

type ImpulseFormOptionalOutputVerbose<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalParam<TEnabled, TElement, "output.schema.verbose">

export type { ImpulseFormOptionalOutputVerbose }
