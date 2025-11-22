import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalParam } from "./_internal/impulse-form-optional-param"

type ImpulseFormOptionalErrorVerbose<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalParam<TEnabled, TElement, "error.schema.verbose">

export type { ImpulseFormOptionalErrorVerbose }
