import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalParam } from "./impulse-form-optional-param"

export type ImpulseFormOptionalError<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalParam<TEnabled, TElement, "error.schema", null>
