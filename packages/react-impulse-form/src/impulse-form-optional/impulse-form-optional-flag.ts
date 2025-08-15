import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalConciseParam } from "./impulse-form-optional-concise-param"

export type ImpulseFormOptionalFlag<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalConciseParam<TEnabled, TElement, "flag.schema", boolean>
