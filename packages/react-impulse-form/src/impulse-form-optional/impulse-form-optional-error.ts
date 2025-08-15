import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalConciseParam } from "./impulse-form-optional-concise-param"

export type ImpulseFormOptionalError<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalConciseParam<TEnabled, TElement, "error.schema", null>
