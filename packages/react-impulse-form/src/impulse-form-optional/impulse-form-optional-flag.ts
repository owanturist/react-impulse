import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalParam } from "./impulse-form-optional-param"

export type ImpulseFormOptionalFlag<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalParam<TEnabled, TElement, "flag.schema", boolean>
