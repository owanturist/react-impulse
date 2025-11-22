import type { ImpulseForm } from "../impulse-form/impulse-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { ImpulseFormOptionalParam } from "./_internal/impulse-form-optional-param"

type ImpulseFormOptionalValidateOn<
  TEnabled extends ImpulseForm,
  TElement extends ImpulseForm,
> = ImpulseFormOptionalParam<TEnabled, TElement, "validateOn.schema", ValidateStrategy>

export type { ImpulseFormOptionalValidateOn }
