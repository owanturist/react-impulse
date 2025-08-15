import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { ImpulseFormOptionalConciseParam } from "./impulse-form-optional-concise-param"

export type ImpulseFormOptionalValidateOn<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalConciseParam<
  TEnabled,
  TElement,
  "validateOn.schema",
  ValidateStrategy
>
