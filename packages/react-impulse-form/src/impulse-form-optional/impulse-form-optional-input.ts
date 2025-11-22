import type { GetImpulseFormParam, ImpulseForm } from "../impulse-form"

import type { ImpulseFormOptionalSchema } from "./impulse-form-optional-schema"

type ImpulseFormOptionalInput<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalSchema<
  GetImpulseFormParam<TEnabled, "input.schema">,
  GetImpulseFormParam<TElement, "input.schema">
>

export type { ImpulseFormOptionalInput }
