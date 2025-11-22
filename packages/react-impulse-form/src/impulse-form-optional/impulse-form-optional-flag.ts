import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalParam } from "./_internal/impulse-form-optional-param"

type ImpulseFormOptionalFlag<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalParam<TEnabled, TElement, "flag.schema", boolean>

export type { ImpulseFormOptionalFlag }
