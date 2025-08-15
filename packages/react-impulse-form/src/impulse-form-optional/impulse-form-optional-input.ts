import type { GetImpulseFormParam } from "../impulse-form/get-impulse-form-param"
import type { ImpulseForm } from "../impulse-form/impulse-form"

import type { ImpulseFormOptionalVerboseSchema } from "./impulse-form-optional-verbose-schema"

export type ImpulseFormOptionalInput<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalVerboseSchema<
  GetImpulseFormParam<TEnabled, "input.schema">,
  GetImpulseFormParam<TElement, "input.schema">
>
