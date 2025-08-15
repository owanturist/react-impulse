import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalSchema } from "./impulse-form-optional-schema"

export type ImpulseFormOptionalInput<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalSchema<
  GetImpulseFormParam<TEnabled, "input.schema">,
  GetImpulseFormParam<TElement, "input.schema">
>
